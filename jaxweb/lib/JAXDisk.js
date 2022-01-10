//import {Store, get, set, del, clear, keys, drop} from "../extern/idb-keyval.js"
import {JAXDiskStore, get, set, del, clear, keys, drop} from "./JAXDiskDB.js"

var JAXDisk,__Proto;

//***************************************************************************
//JAX's virtual disk system for web
//***************************************************************************
JAXDisk=function(diskName,majorDisk=null,code="")
{
	this.name=diskName;
	//this.dbStore=new Store('JAXDisk_'+diskName, code?(code+"@"+diskName):diskName);
	this.dbStore=new JAXDiskStore(diskName);
	this.writeObj=null;
	this.writeVsn=0;
	if(majorDisk){
		majorDisk.subDisk[code]=this;
	}else {
		JAXDisk.diskHash[diskName] = this;
		this.subDisk={};
	}
	this.refCount=1;
	this.infoStore=new JAXDiskStore(diskName, "info");
	this.baseStore=new JAXDiskStore(diskName, "base");
};

//---------------------------------------------------------------------------
//All available disk:
//JAXDisk.sysStore=new Store('JAXDisk_', "System");
JAXDisk.sysStore=JAXDiskStore.systemStore();
JAXDisk.disks=null;
JAXDisk.diskHash={};

//***************************************************************************
//JAXDisk static-system functions:
//***************************************************************************
{
	//---------------------------------------------------------------------------
	//Init jax-disk system.
	JAXDisk.init=async function(refresh=false) {
		if(JAXDisk.disks && !refresh){
			return;
		}
		return get("disks", JAXDisk.sysStore).then(list => {
			if (Array.isArray(list)) {
				JAXDisk.disks = new Set(list);
			} else {
				JAXDisk.disks = new Set();
				set("disks", [], JAXDisk.sysStore).then(() => {
				});
			}
		});
	};

	//---------------------------------------------------------------------------
	//Open an disk, may create new disk if param create is true:
	JAXDisk.openDisk = async function (diskName, create) {
		let disk;
		if(!this.disks) {
			await this.init();
		}
		disk = this.diskHash[diskName];
		if (disk) {
			//Check if the disk is still there:
			try {
				let list = await get("disks", JAXDisk.sysStore);
				if (list.indexOf(diskName) >= 0) {
					disk.refCount++;
					return disk;
				} else {
					//The disk is removed.
					this.disks.delete(diskName);
					delete this.diskHash[diskName];
					return null;
				}
			}catch(err) {
				return null;
			}
		}
		if (!this.disks.has(diskName)) {
			let list=await get("disks",JAXDisk.sysStore);
			if(list && list.indexOf(diskName)>=0){
				this.disks.add(diskName);
				return new JAXDisk(diskName);
			}
			if (create) {
				return await JAXDisk.newDisk(diskName);
			}
			return null;
		} else {
			let list=await get("disks",JAXDisk.sysStore);
			if(list && list.indexOf(diskName)>=0) {
				return new JAXDisk(diskName);
			}
			//The disk is removed.
			this.disks.delete(diskName);
			delete this.diskHash[diskName];
			return null;
		}
		return null;
	};

	//---------------------------------------------------------------------------
	//Check if a disk is exist:
	JAXDisk.diskExist = function (diskName,doubleCheck=0) {
		var self=this;
		return new Promise((resolve, reject) => {
			if (self.disks.has(diskName)) {
				resolve(1);
			} else {
				if(doubleCheck){
					//再次检查数据库:
					return get("disks",JAXDisk.sysStore).then(list=>{
						if(list.indexOf(diskName)>=0){
							JAXDisk.disks.add(diskName);
							resolve(1);
						}else{
							resolve(0);
						}
					});
				}else {
					resolve(0);
				}
			}
		});
	};

	//---------------------------------------------------------------------------
	//Create a new disk:
	JAXDisk.newDisk = function (diskName) {
		let self=this,diskObj;
		if(diskName.indexOf("/")>=0 || diskName.indexOf("*")>=0){
			throw new Error("New disk: illegal name.");
		}
		return new Promise((resolve, reject) => {
			if (self.disks.has(diskName)) {
				self.openDisk(diskName,0).then((disk)=>{
					resolve(disk);
				});
				return;
			}
			self.disks.add(diskName);
			set('disks', Array.from(self.disks), self.sysStore).then(() => {
				//let store=new Store('JAXDisk_'+diskName, diskName,1);
				let store=new JAXDiskStore(diskName);
				set(".",{},store).then(()=>{
					diskObj=new JAXDisk(diskName);
					resolve(diskObj);
				});
			})
		});
	};

	//---------------------------------------------------------------------------
	//Get a disk's info VO:
	JAXDisk.getDiskInfo=async function(diskName){
		let disk,infoStore,info;
		if(!this.disks) {
			await this.init();
		}
		disk=await this.openDisk(diskName,false);
		if(!disk){
			return null;
		}
		infoStore=disk.infoStore;
		if(!infoStore){
			//disk.infoStore=infoStore=new Store('JAXDiskInfo_'+diskName, diskName,1);
			disk.infoStore=infoStore=new JAXDiskStore(diskName, "info");
		}
		return await get("info",infoStore);
	};

	//---------------------------------------------------------------------------
	//Set a disk's info VO:
	JAXDisk.setDiskInfo=async function(diskName,info){
		let disk,infoStore,pms;
		if(!this.disks) {
			await this.init();
		}
		disk=await this.openDisk(diskName);
		if(!disk){
			return null;
		}
		infoStore=disk.infoStore;
		if(!infoStore){
			//disk.infoStore=infoStore=new Store('JAXDiskInfo_'+diskName, diskName,1);
			disk.infoStore=infoStore=new JAXDiskStore(diskName, "info");
			await set("info",info,infoStore);
			return;
		}
		if(disk.writeObj){
			await disk.writeObj;
		}
		pms=set("info",info,infoStore);
		disk.writeObj=pms;
		pms.writeVsn=disk.writeVsn++;
		return pms;
	};
	
	//---------------------------------------------------------------------------
	//Get a disk's info VO:
	JAXDisk.getDiskAttr=async function(diskName,attr){
		let disk,infoStore,info;
		if(!this.disks) {
			await this.init();
		}
		disk=await this.openDisk(diskName,false);
		if(!disk){
			return null;
		}
		infoStore=disk.infoStore;
		if(!infoStore){
			disk.infoStore=infoStore=new JAXDiskStore(diskName, "info");
		}
		return await get("attr_"+attr,infoStore);
	};

	//---------------------------------------------------------------------------
	//Set a disk's attr:
	JAXDisk.setDiskAttr=async function(diskName,key,val){
		let disk,infoStore,pms;
		if(!this.disks) {
			await this.init();
		}
		disk=await this.openDisk(diskName);
		if(!disk){
			return null;
		}
		infoStore=disk.infoStore;
		if(!infoStore){
			disk.infoStore=infoStore=new JAXDiskStore(diskName, "info");
			await set("attr_"+key,val,infoStore);
			return;
		}
		if(disk.writeObj){
			await disk.writeObj;
		}
		pms=set("attr_"+key,val,infoStore);
		disk.writeObj=pms;
		pms.writeVsn=disk.writeVsn++;
		return pms;
	};

	//---------------------------------------------------------------------------
	//Remove a disk, clear the DB(but not drop the db)
	JAXDisk.dropDisk = function (diskName) {
		let self;
		self=this;
		return new Promise((resolve, reject) => {
			self.openDisk(diskName).then(async diskObj=>{
				if(diskObj){
					if(diskObj.dbStore) {
						await clear(diskObj.dbStore);
						if(diskObj.infoStore) {
							await clear(diskObj.infoStore);
						}
						if(diskObj.baseStore) {
							await clear(diskObj.baseStore);
						}
					}
					//await drop("Disk_"+diskName);
				}
				self.disks.delete(diskName);
				delete self.diskHash[diskName];
				set('disks', Array.from(self.disks), self.sysStore).then(resolve);
			});
		});
	};

	//---------------------------------------------------------------------------
	//Get current disks list:
	JAXDisk.getDisks=function(){
		return Array.from(this.disks);
	};
	
	//---------------------------------------------------------------------------
	//Get current disk names
	JAXDisk.getDiskNames=async function(){
		let list,i,n,name,disk;
		await this.init(true);
		list=Array.from((this.disks));
		n=list.length;
		for(i=0;i<n;i++){
			name=list[i];
			disk=await JAXDisk.openDisk(name,0);
			if(!disk){
				list.splice(i,1);
				JAXDisk.disks.delete(name);
				delete JAXDisk.diskHash[name];
				n--;i--;
			}
		}
		return list;
	};
}

JAXDisk.prototype=__Proto={};
//***************************************************************************
//JAXDisk member funcitons
//***************************************************************************
{
	var divPath=function (dirPath)
	{
		let pos,dirName,upPath;
		//Split dir upper and base:
		if(dirPath.endsWith("/")){
			dirPath=dirPath.substring(0,dirPath.length-1);
		}
		pos=dirPath.lastIndexOf("/");
		if(pos>=0){
			dirName=dirPath.substring(pos+1);
			upPath=dirPath.substring(0,pos);
		}else{
			dirName=dirPath;
			upPath="";
		}
		if(upPath.startsWith("/")){
			upPath=upPath.substring(1);
		}
		return [dirName,upPath];
	};

	//-----------------------------------------------------------------------
	//Create a new dir:
	__Proto.newDir=function(dirPath,allowRoot=0,recursive=true)
	{
		var self=this;
		let writeVsn;
		if(dirPath==='.'){
			if(!allowRoot) {
				throw "Error: '.' is not allowed for folder name.";
			}
		}

		if(dirPath.endsWith("/")){
			dirPath=dirPath.substring(0,dirPath.length-1);
		}
		if(dirPath.startsWith("/")){
			dirPath=dirPath.substring(1);
		}

		async function mkDirList(list){
			let i,n,stub;
			n=list.length;
			for(i=0;i<n;i++) {
				stub=list[i];
				await set(stub.path, stub.obj,self.dbStore);
			}
			return list[0];
		}

		async function doNewDir() {
			let waitPath;
			if(self.writeObj && self.writeObj.writeVsn!==writeVsn){
				waitPath=self.writeObj.path;
				await self.writeObj;
			}

			return get(dirPath, self.dbStore).then(async curDirObj => {
				let upPath, pos, dirName;
				let dirList;
				let time = Date.now();

				dirList=[];
				
				//Check if path is already there and if it's dir?
				if (curDirObj instanceof Uint8Array) {
					throw "Can't create dir on file!";
				} else if (typeof (curDirObj) === 'object') {
					return curDirObj;
				}

				//Path is empty, create dir:
				dirList.push({path:dirPath,obj:{}});
				[dirName, upPath] = divPath(dirPath);
				if(!upPath){
					upPath=".";
				}
				while(upPath){
					let dirObj;
					dirObj=await get(upPath, self.dbStore);
					if(!dirObj){
						if(!recursive){
							return null;
						}
						dirObj={};
						dirObj[dirName]={
							name: dirName, dir: 1, createTime: time, modifyTime: time,
						};
						dirList.push({path:upPath,obj:dirObj});
					}else{
						dirObj[dirName]={
							name: dirName, dir: 1, createTime: time, modifyTime: time,
						};
						dirList.push({path:upPath,obj:dirObj});
						break;
					}
					if(upPath==="."){
						throw "newDir: Bad disk structure!";
					}
					[dirName, upPath] = divPath(upPath);
					if(!upPath){
						upPath=".";
					}
				}
				return await mkDirList(dirList);
			})
		}
		//Sync write operation:
		writeVsn=this.writeVsn++;
		self.writeObj=doNewDir();
		self.writeObj.writeVsn=writeVsn;
		self.writeObj.path=dirPath;
		//console.log("Set wait obj: "+dirPath);
		return self.writeObj;
	};

	//-----------------------------------------------------------------------
	//Delete an entry-item, if path is a dir, also delete the whole dir tree under it.
	__Proto.del=function(path){
		var self=this;
		let writeVsn;

		//console.log("Disk.del: "+path);
		if(path.endsWith("/")){
			path=path.substring(0,path.length-1);
		}
		if(path.startsWith("/")){
			path=path.substring(1);
		}
		if(path.startsWith("./")){
			path=path.substring(2);
		}

		//-------------------------------------------------------------------
		//Delete file/dir item array(list)
		async function doDelList(list){
			let i,n,item,pList;
			n=list.length;
			pList=[];
			for(i=0;i<n;i++){
				item=list[i];
				pList.push(del(item,self.dbStore));//Delete one item
			}
			return Promise.allSettled(pList);
		}

		//-------------------------------------------------------------------
		//List an dir's all sub-tree items including sub in sub
		async function doMakeList(tgtPath,tgtList){
			let list,i,n,stub;
			tgtList.push(tgtPath);
			list=await self.getEntries(tgtPath);
			n=list.length;
			for(i=0;i<n;i++){
				stub=list[i];
				if(stub.dir){
					await doMakeList((tgtPath?(tgtPath+"/"+stub.name):stub.name),tgtList);
				}else{
					tgtList.push((tgtPath?(tgtPath+"/"+stub.name):stub.name));
				}
			}
		}

		//-------------------------------------------------------------------
		//Erase item's entry in upper dir record:
		async function doDelEntry(tgtPath){
			let tgtName,upPath;
			[tgtName,upPath]=divPath(tgtPath);
			if(!upPath){
				upPath=".";
			}
			return get(upPath,self.dbStore).then((upDirObj)=>{
				if(upDirObj){
					delete upDirObj[tgtName];
					return set(upPath,upDirObj,self.dbStore);
				}
			});
		}

		//-------------------------------------------------------------------
		//Check delete item type, exec the del operation:
		async function checkAndDel()
		{
			let waitPath;
			if(self.writeObj && self.writeObj.writeVsn!==writeVsn){
				waitPath=self.writeObj.path;
				console.log("Waiting: "+path+" on "+waitPath);
				await self.writeObj;
				console.log("Wait done: "+path+" on "+waitPath);
			}

			return get(path,self.dbStore).then(async (delObj)=> {
				let delList;

				//Do the delete:
				delList=[];
				if(delObj instanceof Uint8Array) {
					//File, nothing more.
					delList.push(path);
					return doDelList(delList).then(()=>{
						return doDelEntry(path);
					});
				}else if(delObj){
					//Dir, generate the sub-item list to delete
					await doMakeList(path,delList);
					return doDelList(delList).then(()=>{
						return doDelEntry(path);
					});
				}else{
					return doDelEntry(path);
				}
			});
		}
		writeVsn=this.writeVsn++;
		self.writeObj=checkAndDel();
		self.writeObj.writeVsn=writeVsn;
		self.writeObj.path=path;
		//console.log("Set wait obj: "+path);
		return self.writeObj;
	};

	//-----------------------------------------------------------------------
	//Save a file, fileObj can be string, File-Object, etc.
	__Proto.saveFile=function(path,fileObj,recursive=true)
	{
		var self,tgtName,upPath,byteAry,time,writeVsn,byteHex;
		self=this;

		//console.log("JAXDisk.saveFile: Disk.saveFile: "+path);
		if(path.endsWith("/")){
			throw "JAXDisk.saveFile: Error: filename can't end with '/'!";
		}
		if(path.startsWith("/")){
			path=path.substring(1);
		}

		[tgtName,upPath]=divPath(path);
		time=Date.now();

		let digestBytes=async function(buf) {
			let hex;
			const hashBuffer = await crypto.subtle.digest('SHA-256', buf);       	    	// hash the message
			const hashArray = Array.from(new Uint8Array(hashBuffer));                     			// convert buffer to byte array
			hex= hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
			return hex;
		};

		//Save byte content to DB, update entry info, make base backup if needed:
		async function saveByteAry(){
			let dirVO,stub,oldData,oldHash;
			//console.log("saveByteAry: "+path+", writeObj: "+(self.writeObj?self.writeObj.filePath:"null"));
			//wait for current update file:
			if(self.writeObj && self.writeObj.writeVsn!==writeVsn){
				await self.writeObj;
			}
			//get upper dirVO:
			dirVO=await get(upPath?upPath:".",self.dbStore);
			if(!dirVO){
				throw "Path is not available: "+upPath;
			}
			stub=dirVO[tgtName];
			if(stub){
				//file exists, update stub, save base if 1st :
				oldHash=stub.hash;
				stub.modifyTime=time;
				if(!stub.modified && (oldHash!==byteHex || stub.size!==byteAry.byteLength)) {
					oldData=await get(upPath ? (upPath + "/" + tgtName) : tgtName, self.dbStore);
					//save the base file content:
					if(oldData) {
						set(upPath ? (upPath + "/" + tgtName) : tgtName, oldData, self.baseStore);
					}
					stub.modified=true;
				}
				stub.size=byteAry.byteLength;
				stub.hash=byteHex;
				//update stub:
			}else{
				//new file, create stub:
				dirVO[tgtName]={
					name:tgtName,dir:0,createTime:time,modifyTime:time,size:byteAry.byteLength,modified:true,
					hash:byteHex
				};
			}
			await set(upPath?(upPath+"/"+tgtName):tgtName,byteAry,self.dbStore);
			await set(upPath?upPath:".",dirVO,self.dbStore);
		}
		
		async function arrayBuffer(file){
			if(file.arrayBuffer){
				return file.arrayBuffer();
			}
			return new Promise((onDone,onError)=>{
				let reader=new FileReader();
				reader.onload=function(event) {
					let arrayBuffer = event.target.result;
					onDone(arrayBuffer);
				};
				reader.readAsArrayBuffer(file);
			})
		}

		function doCopy(){
			//Ensure saved object is ByteArray
			if (typeof (fileObj) === 'string') {
				let encoder = new TextEncoder();
				byteAry = encoder.encode(fileObj);
				return digestBytes(byteAry).then(hex=>{
					writeVsn = self.writeVsn++;
					byteHex=hex;
					self.writeObj =saveByteAry();
					self.writeObj.filePath = path;
					self.writeObj.writeVsn = writeVsn;
					return self.writeObj;
				});
			} else if (fileObj instanceof File) {
				return arrayBuffer(fileObj).then(async buf => {
					byteAry = new Uint8Array(buf);
					return digestBytes(byteAry).then(hex=>{
						writeVsn = self.writeVsn++;
						byteHex=hex;
						self.writeObj =saveByteAry();
						self.writeObj.filePath = path;
						self.writeObj.writeVsn = writeVsn;
						return self.writeObj;
					});
				});
			} else if (fileObj instanceof Uint8Array) {
				byteAry = fileObj;
				return digestBytes(byteAry).then(hex=>{
					writeVsn = self.writeVsn++;
					byteHex=hex;
					self.writeObj =saveByteAry();
					self.writeObj.filePath = path;
					self.writeObj.writeVsn = writeVsn;
					return self.writeObj;
				});
			}else if(fileObj instanceof ArrayBuffer){
				byteAry = new Uint8Array(fileObj);
				return digestBytes(byteAry).then(hex=>{
					writeVsn = self.writeVsn++;
					byteHex=hex;
					self.writeObj =saveByteAry();
					self.writeObj.filePath = path;
					self.writeObj.writeVsn = writeVsn;
					return self.writeObj;
				});
			}
		}

		if(upPath && recursive){
			//Ensure the target dir is there:
			return self.newDir(upPath).then(()=>{
				return doCopy();
			});
		}else{
			return doCopy();
		}
	};

	//-----------------------------------------------------------------------
	//Load file data as ByteArray
	__Proto.loadFile=function(path)
	{
		var self;
		self=this;
		if(path.startsWith("/")){
			path=path.substring(1);
		}
		return get(path,self.dbStore).then(fileObj=>{
			if(fileObj instanceof Uint8Array){
				return fileObj;
			}
			return null;
		});
	};

	//-----------------------------------------------------------------------
	//Load file data as text
	__Proto.loadText=function(path)
	{
		var self;
		self=this;
		if(path.startsWith("/")){
			path=path.substring(1);
		}
		return get(path,self.dbStore).then(fileObj=>{
			if(fileObj instanceof Uint8Array){
				let enc = new TextDecoder("utf-8");
				return enc.decode(fileObj);
			}
			return null;
		}).catch(err=>{
			return null;
		});
	};

	//-----------------------------------------------------------------------
	//Read file, if encode!==null, read as text:
	__Proto.readFile=function(path,encode=null){
		if(encode) {
			return this.loadText(path);
		}else {
			return this.loadFile(path);
		}
	};
	
	//-----------------------------------------------------------------------
	//List sub-item-vo under path, return null if path is a file:
	__Proto.getEntries=function(path)
	{
		var self;
		self=this;
		if(path.startsWith("/")){
			path=path.substring(1);
		}
		if(!path){
			path='.';
		}
		return get(path,self.dbStore).then(fileObj=>{
			if(fileObj instanceof Uint8Array || !fileObj){
				return null;//这是文件，不是目录, 或者路径不存在
			}
			return Object.values(fileObj);
		});
	};

	//-----------------------------------------------------------------------
	//Check if a path is existed:
	__Proto.isExist=function(path)
	{
		var self=this;
		if(path.startsWith("/")){
			path=path.substring(1);
		}
		if(!path){
			path='.';
		}
		return get(path,self.dbStore).then(fileObj=>{
			return !!fileObj;
		});
	};

	//-----------------------------------------------------------------------
	//Get item entry(info) by path
	__Proto.getEntry=async function(path){
		let self=this;
		let dir,fileName;
		[fileName,dir]=divPath(path);
		if(dir.startsWith("/")){
			dir=dir.substring(1);
		}
		if(!dir){
			dir='.';
		}
		let dirObj=await get(dir,self.dbStore);
		if(dirObj) {
			if(fileName===""){
				return {name:self.name,dir:1,disk:1};
			}
			return dirObj[fileName]||null;
		}
		return null;
	};

	//-----------------------------------------------------------------------
	//Set item entry-info by path
	__Proto.setEntryInfo=async function(path,info){
		let self=this;
		let entry,pms;
		entry=await this.getEntry(path);
		if(typeof(entry)==="object"){
			let dir,fileName,writeVersion;
			[fileName,dir]=divPath(path);
			if(dir.startsWith("/")){
				dir=dir.substring(1);
			}
			if(!dir){
				dir='.';
			}
			Object.assign(entry,info);
			if(self.writeObj){
				await self.writeObj;
			}
			writeVersion=self.writeVsn++;
			self.writeObj=pms=get(dir,self.dbStore).then((dirInfo)=>{
				dirInfo[fileName]=entry;
				return set(dir,dirInfo,self.dbStore);
			});
			pms.writeVsn=writeVersion;
			return pms;
		}
	};

	//-----------------------------------------------------------------------
	//copy a file or dir, src can from another disk (orgDisk)
	__Proto.copyFile=function(path,newPath,overwrite=1,orgDisk=null)
	{
		var self=this;
		var dirList,fileList;
		orgDisk=orgDisk||this;
		if(path.startsWith("/")){
			path=path.substring(1);
		}
		if(path.endsWith("/")){
			path=path.substring(0,path.length-1);
		}
		if(!path){
			path='.';
		}

		if(newPath.startsWith("/")){
			newPath=newPath.substring(1);
		}
		if(newPath.endsWith("/")){
			newPath=newPath.substring(0,newPath.length-1);
		}
		if(!newPath){
			newPath='.';
		}

		dirList=[];
		fileList=[];

		async function checkInItem(itemPath,tgtPath) {
			var itemObj,subPath,subTgtPath,curItem;
			itemObj=await get(itemPath,orgDisk.dbStore);
			if(itemObj instanceof Uint8Array){
				curItem=await get(tgtPath,self.dbStore);//Is target there?
				if(curItem) {
					if(overwrite && curItem instanceof Uint8Array) {//Can't overwrite a dir with file!
						fileList.push({org: itemPath, tgt: tgtPath});
					}
				}else{
					fileList.push({org: itemPath, tgt: tgtPath});
				}
			}else if(typeof(itemObj)==="object"){
				var stub,itemName,name;
				dirList.push({org:itemPath,tgt:tgtPath});
				for(itemName in itemObj){
					name=itemName;
					stub=itemObj[name];
					subPath=itemPath?(itemPath+"/"+stub.name):stub.name;
					subTgtPath=tgtPath?(tgtPath+"/"+stub.name):stub.name;
					await checkInItem(subPath,subTgtPath);
				}
			}
		}

		function copyOneFile(stub){
			return orgDisk.loadFile(stub.org).then(fileData=>{
				return self.saveFile(stub.tgt,fileData);
			});
		}

		return get(path,orgDisk.dbStore).then(async fileObj=>{
			let i,n,pList;
			if(!fileObj){
				throw "Missing copy source: "+path;
			}
			await checkInItem(path,newPath);
			pList=[];
			n=dirList.length;
			for(i=0;i<n;i++){
				pList.push(self.newDir(dirList[i].tgt));
			}
			return Promise.allSettled(pList).then(async ()=>{
				let pList=[],p,stub;
				n=fileList.length;
				for(i=0;i<n;i++){
					stub=fileList[i];
					p=copyOneFile(stub);
					pList.push(p);
				}
				return Promise.allSettled(pList).then(()=>{
					return dirList.map((item)=>{
						return item.tgt;
					}).concat(fileList.map(item=>{
						return item.tgt;
					}));
				});
			});
		});
	};

	//-----------------------------------------------------------------------
	//Rename a file/dir
	__Proto.rename=function(path,newPath)
	{
		var self=this;
		let orgName,orgPath,tgtName,tgtPath;

		if(path.startsWith("/")){
			path=path.substring(1);
		}
		if(path.endsWith("/")){
			path=path.substring(0,path.length-1);
		}
		if(!path){
			path='.';
		}
		[orgName, orgPath] = divPath(path);

		if(newPath.startsWith("/")){
			newPath=newPath.substring(1);
		}
		if(newPath.endsWith("/")){
			newPath=newPath.substring(0,newPath.length-1);
		}
		if(!newPath){
			newPath='.';
		}
		[tgtName, tgtPath] = divPath(newPath);

		if(tgtPath!==orgPath){
			throw "Path error."
		}
		if(orgName===tgtName){//Same name:
			return (async function(){return true})();
		}

		return self.copyFile(path,newPath).then(()=>{
			return self.del(path);
		});
	};

	//-----------------------------------------------------------------------
	//Get all items path-name in a flat list:
	__Proto.getAllItemPath=async function(){
		return await keys(this.dbStore);
	};
	
	//-----------------------------------------------------------------------
	//Load a file's base version:
	__Proto.loadFileBase=async function(path,encode=null){
		let self,fileObj;
		self=this;
		if(path.startsWith("/")){
			path=path.substring(1);
		}
		if(!self.baseStore){
			return null;
		}
		fileObj=await get(path,self.baseStore);
		if(fileObj instanceof Uint8Array){
			if(encode) {
				let enc = new TextDecoder("utf-8");
				return enc.decode(fileObj);
			}else{
				return fileObj;
			}
		}
		return null;
	};
}

export {JAXDisk};
