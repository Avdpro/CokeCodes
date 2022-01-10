var express = require('express');
var crypto=require('crypto');
var pathCfg=require("../cfg/filepath");
var fsp=require("fs/promises");
var {Buffer}=require("buffer");
const child_process = require("child_process");

//---------------------------------------------------------------------------
//磁盘相关API
module.exports =function(app,router,apiMap){

	//***********************************************************************
	//基础用户磁盘操作:
	//***********************************************************************
	{
		const dbUser=app.get("DBUser");
		const dbDisk=app.get("DBDisk");
		const dbSys=app.get("DBSys");
		const dbPkg=app.get("DBPkg");
		const diskNameChecker=/^([a-zA-Z]{1})([a-zA-Z_-]{2,29})$/;

		//初始化获得磁盘路径的函数:
		let env=app.get("env");
		let pathFunc=pathCfg[env].getDiskPath;
		let commitMap={};

		//执行操作的函数:
		let DoActDir=null;
		let DoActFile=null;
		let DoActDel=null;

		if(!pathFunc){
			throw "No path function for: "+env;
		}

		//-----------------------------------------------------------------------
		//请求创建一个磁盘:
		apiMap["diskApplyCheckIn"] = async function (req, res, next) {
			let reqVO,userId,token,diskName,userInfo,disks,idx;
			let diskId,isPublic,diskPath,commitKey,diskVO,isVIP,time;
			let resVO,commitVO;

			reqVO=req.body.vo;
			userId=reqVO.userId;
			token=reqVO.token;
			diskName=reqVO.diskName;
			
			if(!diskNameChecker.test(diskName)){
			
			}

			userInfo=await dbUser.findOne({_id:userId,token:token});
			if(!userInfo){
				res.json({code:-100,info:"UserId/Token invalid."});
				return;
			}

			time=Date.now();

			isVIP=userInfo.rank==="MEMBER"||userInfo.rank==="LORD"||userInfo.rank!=="LEADER";

			disks=userInfo.disks;

			//免费用户只能有三个磁盘:
			if(!isVIP && disks.length>=3){
				res.json({code:-201,info:"None member users can only have upto 3 cloud disks."});
				return;
			}

			//排除重复磁盘名称:
			idx=disks.indexOf(diskName);
			if(idx>=0){
				res.json({code:-101,info:"Disk name is taken."});
				return;
			}
			diskPath=pathFunc(diskName,userInfo.email,userId);
			diskId=diskName+"@"+userInfo.email;

			//是否公开:
			isPublic=reqVO.public===0?0:1;
			if(!isPublic && !isVIP){
				//免费用户必须公开磁盘:
				isPublic=1;
			}

			//更新user表
			await dbUser.updateOne({_id:userId},{$addToSet:{disks:diskName}});

			commitKey=crypto.randomUUID();
			//Disk表插入新的Disk信息
			diskVO={
				_id:diskId,
				name:diskName,
				showName:reqVO.showName||diskName,
				userId:userId,
				user:{userId:userId,email:userInfo.email,name:userInfo.name},
				type:reqVO.diskType||"Project",
				path:diskPath,
				public:isPublic,
				version:reqVO.version||"0.0.1",
				versionIdx:0,
				checkInTime:time,
				lastUpdateTime:time,
				lastUpdateUser:{userId:userId,email:userInfo.email,name:userInfo.name},
				shortInfo:reqVO.shortInfo||("Disk by "+userInfo.name),
				members:[{userId:userId,role:"OWNER",email:userInfo.email,name:userInfo.name}],
				followUserNum:0,
				tags:[],
				fovNum:0,
				points:0,
				updateLocker:userId,
				updateKey:commitKey,
				updateLockExpire:time+1000*60*10,//10分钟后更新锁无效
				package:""
			};

			commitVO=commitMap[commitKey]={
				diskId:diskId,
				owner:diskVO.user,
				user:{userId:userId,email:userInfo.email,name:userInfo.name},
				time:time,
				path:diskPath,
				version:diskVO.version,
				versionIdx:1,
				actions:[],
				isVIP:isVIP,
				expire:time+1000*60*5,
				done:0,
				timeout:0,
				timer:null,

				filesMap:{},
				dirsSet:new Set(),
				totalSize:0,
				totalFileNum:0,
			};

			//设置超时处理:
			commitVO.timer=setTimeout(()=>{
				delete commitMap[commitKey];
				commitVO.timer=null;
				if(commitVO.done){
					return;
				}
				commitVO.timeout=1;
				//改写数据库:
				dbDisk.updateOne({_id:diskId},{$set:{updateKey:"",updateLocker:"",updateLockExpire:0}});
			},1000*60*5);

			//创建目录:
			//await fsp.mkdir(diskPath+"/files_1",{recursive: true});
			await fsp.mkdir(diskPath+"/updates",{recursive: true});
			await fsp.mkdir(diskPath+"/tags",{recursive: true});

			//数据库操作:
			await dbDisk.insertOne(diskVO);
			resVO={
				code:200,
				diskId:diskId,
				name:diskName,
				user:commitVO.user,
				showName:diskVO.showName,
				type:diskVO.type,
				public:isPublic,
				version:diskVO.version,
				versionIdx:diskVO.versionIdx,
				updateKey:diskVO.updateKey,
				updateLockExpire:diskVO.updateLockExpire,
			};
			res.json(resVO);
		};

		//-----------------------------------------------------------------------
		//请求提交一个版本更新:
		apiMap["diskApplyCommit"] = async function (req, res, next) {
			let reqVO,userId,token,diskId,version,versionIdx,diskInfo,userInfo;
			let list,i,n,member,access,isVIP;
			let time,commitVO,commitKey,dbVO,resVO,diskJSON;

			reqVO=req.body.vo;

			time=Date.now();
			diskId=reqVO.diskId;
			userId=reqVO.userId;
			token=reqVO.token;

			userInfo=await dbUser.findOne({_id:userId,token:token});
			if(!userInfo){
				res.json({code:-100,info:"UserId/Token invalid."});
				return;
			}

			isVIP=userInfo.rank==="MEMBER"||userInfo.rank==="LORD"||userInfo.rank!=="LEADER";

			diskInfo=await dbDisk.findOne({_id:diskId});
			if(!diskInfo){
				res.json({code:-101,info:"DiskId is invalid."});
				return;
			}
			if(diskInfo.versionIdx!==reqVO.versionIdx){
				res.json({code:-105,info:"Disk version mismatched: "+diskInfo.verionIdx+" vs "+reqVO.versionIdx});
				return;
			}
			version=reqVO.version||diskInfo.version;
			versionIdx=reqVO.versionIdx+1;
			if(diskInfo.updateLocker && diskInfo.updateLockExpire>time){
				res.json({code:-102,info:"Disk is locked for another commit.",lockExpire:diskInfo.updateLockExpire});
				return;
			}

			FindAccess:{
				access=0;
				list = diskInfo.members;
				n = list.length;
				for (i = 0; i < n; i++) {
					member = list[i];
					if (member.userId ===userId){
						access=1;
						break FindAccess;
					}
				}
				if(!access) {
					res.json({code: -103, info: "Access denied, only members can commit this disk."});
					return;
				}
			}

			diskJSON=await fsp.readFile(diskInfo.path+"/disk.json",{encoding:"utf8"});
			if(!diskJSON){
				res.json({code:-103,info:"Disk json is missing."});
				return;
			}
			try{
				diskJSON=JSON.parse(diskJSON);
			}catch (e) {
				res.json({code:-104,info:"Disk json parse error."});
				return;
			}

			commitKey=crypto.randomUUID();

			commitVO=commitMap[commitKey]={
				diskId:diskId,
				owner:diskInfo.user,
				user:{userId:userId,email:userInfo.email,name:userInfo.name},
				time:time,
				path:diskInfo.path,
				version:version,
				versionIdx:versionIdx,
				actions:[],
				isVIP:isVIP,
				expire:time+1000*60*5,
				done:0,
				timeout:0,
				timer:null,

				filesMap:diskJSON.files,
				dirsSet:new Set(diskJSON.dirs),
				totalSize:diskJSON.diskSize||0,
				totalFileNum:diskJSON.totalFileNum||0,
			};

			//设置超时处理:
			commitVO.timer=setTimeout(()=>{
				delete commitMap[commitKey];
				commitVO.timer=null;
				if(commitVO.done){
					return;
				}
				commitVO.timeout=1;
				//改写数据库:
				dbDisk.updateOne({_id:diskId},{$set:{updateKey:"",updateLocker:"",updateLockExpire:0}});
			},1000*60*5);

			//更新数据库:
			dbVO={
				$set:{
					updateLocker:userId,
					updateKey:commitKey,
					updateLockExpire:time+1000*60*10,//10分钟后更新锁无效
				}
			};
			await dbDisk.updateOne({_id:diskId},dbVO);

			//返回commitKey，客户端可以开始更新:
			resVO={
				code:200,
				diskId:diskId,
				versionIdx:versionIdx,
				updateKey:commitKey,
				updateLockExpire:time+1000*60*10,//10分钟后更新锁无效
			};
			res.json(resVO);
		};

		//-----------------------------------------------------------------------
		//提交一个更新动作:
		apiMap["diskCommitAct"] = async function (req, res, next) {
			let reqVO,userId,diskId,commitKey,commitVO,commitAct,actVO,time,isVIP;
			let fileVO,filesMap,dataSize,oldSize,dirsSet,path;

			//终止提交:
			function giveUpCommit()
			{
				delete commitMap[commitKey];
				if(commitVO.timer) {
					clearTimeout(commitVO.timer);
					commitVO.timer = null;
				}
				if(commitVO.done){
					return;
				}
				commitVO.timeout=1;
				//改写数据库:
				dbDisk.updateOne({_id:diskId},{$set:{updateKey:"",updateLocker:"",updateLockExpire:0}});
			}

			time=Date.now();
			reqVO=req.body.vo;
			commitKey=reqVO.key;
			commitVO=commitMap[commitKey];
			if(!commitVO){
				res.json({code:-100,info:"Commit key is invalid: "+commitKey});
				return;
			}
			userId=commitVO.user.userId;
			diskId=commitVO.diskId;
			isVIP=commitVO.isVIP;
			filesMap=commitVO.filesMap;
			dirsSet=commitVO.dirsSet;
			commitAct=reqVO.act;
			path=reqVO.path;
			switch (commitAct) {
				case "dir"://创建一个目录:
					if(typeof(path)!=="string"){
						res.json({code:-101,info:"Dir path is invalid: "+path});
						giveUpCommit();
						return;
					}
					dirsSet.add(path);
					actVO={act:commitAct,path:path};
					if(isVIP){
						if(dirsSet.size>2000){
							res.json({code:-101,info:"Too many dirs. Your cloud disk's max dir number is 2000."});
							giveUpCommit();
							return;
						}
					}else{
						if(dirsSet.size>100){
							res.json({code:-101,info:"Too many dirs. Your cloud disk's max dir number is 100. Upgrade to elite member to increase the limit to 2000"});
							giveUpCommit();
							return;
						}
					}
					break;
				case "file"://添加/保存/更新一个文件:
					if(typeof(reqVO.data)!=="string"){
						res.json({code:-101,info:"File data is missing: "+path});
						giveUpCommit();
						return;
					}
					if(typeof(path)!=="string"){
						res.json({code:-101,info:"File path is invalid: "+path});
						giveUpCommit();
						return;
					}
					if(!(reqVO.size>=0)){
						res.json({code:-101,info:"File size is missing: "+path+": "+reqVO.size});
						giveUpCommit();
						return;
					}
					dataSize=reqVO.size;
					if(dataSize>1024 && (dataSize*2<reqVO.data.length)){
						res.json({code:-101,info:"File size is invalid: "+path});
						giveUpCommit();
						return;
					}
					//限制文件尺寸:
					if(isVIP){
						if(dataSize>1024*1024*100){
							res.json({code:-101,info:"File: "+path+" is too big to save on CokeCodes cloud. Your max file size is limited at: "+1024*1024*100+" bytes."});
							giveUpCommit();
							return;
						}
					}else{
						if(dataSize>1024*1024*10){
							res.json({code:-101,info:"File: "+path+" is too big to save on CokeCodes cloud. Normal member's max file size is limited at: "+1024*1024*10+" bytes. Upgrade to Elite member to increase size limit."});
							giveUpCommit();
							return;
						}
					}
					actVO={act:commitAct,path:path,data:reqVO.data,size:reqVO.size,hash:reqVO.hash||"0"};
					fileVO=filesMap[path];
					if(!fileVO){
						fileVO=filesMap[path]={size:0,history:[]};
						commitVO.totalFileNum+=1;
					}
					oldSize=fileVO.size;
					commitVO.totalSize+=dataSize-oldSize;
					commitVO.totalFileNum+=fileVO?0:1;
					//限制磁盘尺寸:
					if(isVIP){
						if(commitVO.totalSize>1024*1024*1024){
							res.json({code:-101,info:"File: "+path+" is too big to save on CokeCodes cloud. Your max file size is limited at: "+1024*1024*1024+" bytes."});
							giveUpCommit();
							return;
						}
						if(commitVO.totalFileNum>10000){
							res.json({code:-101,info:"Too many files in disk, your max file number is 10000 files per disk."});
							giveUpCommit();
							return;
						}
					}else{
						if(commitVO.totalSize>1024*1024*200){
							res.json({code:-101,info:"Total file size is too big to save on CokeCodes cloud. Normal member's max disk size is limited at: "+1024*1024*200+" bytes. Upgrade to Elite member to increase size limit."});
							giveUpCommit();
							return;
						}
						if(commitVO.totalFileNum>1000){
							res.json({code:-101,info:"Too many files in disk, your max file number is 1000 files per disk."});
							giveUpCommit();
							return;
						}
					}
					fileVO.history.push(commitVO.versionIdx);
					fileVO.versionIdx=commitVO.versionIdx;
					fileVO.size=reqVO.size;
					fileVO.hash=reqVO.hash||"0";
					break;
				case "delete"://删除一个项目:
					fileVO=filesMap[path];
					if(fileVO){
						delete filesMap[path];
						commitVO.totalFileNum-=1;
					}else{
						if(dirsSet.has(path)){
							dirsSet.delete(path);
						}else {
							res.json({code: -101, info: "Delete path file missing: " + path + "."});
							giveUpCommit();
							return;
						}
					}
					actVO={act:commitAct,path:path};
					break;
				default:
					res.json({code:-100,info:"Commit action is invalid: "+commitAct});
					giveUpCommit();
					return;
			}

			//推迟过期时间:
			{
				commitVO.expire = time + 60 * 1000 * 5;
				await dbDisk.updateOne({_id: diskId}, {$set: {updateLockExpire: time + 60 * 1000 * 5}});
				if (commitVO.timer) {
					clearTimeout(commitVO.timer);
				}
				commitVO.timer=setTimeout(()=>{
					delete commitMap[commitKey];
					commitVO.timer=null;
					if(commitVO.done){
						return;
					}
					commitVO.timeout=1;
					//改写数据库:
					dbDisk.updateOne({_id:diskId},{$set:{updateKey:"",updateLocker:"",updateLockExpire:0}});
				},1000*60*50+200);
			}

			//保存动作，现在不具体执行，等CommitFin的时候执行
			commitVO.actions.push(actVO);
			res.json({code:200});
		};

		//------------------------------------------------------------------------
		//执行具体提交动作的函数:
		{
			//-----------------------------------------------------------------------
			//执行操作：创建目录:
			DoActDir = async function (vo, act) {
				let path;
				path = vo.path;
				//创建目录:
				await fsp.mkdir(path + "/files_"+act.versionIdx+"/" + act.path, {recursive: true});
				vo.items.dirs.push(act.path);
			};

			//-----------------------------------------------------------------------
			//执行操作：存储文件:
			DoActFile = async function (vo, act) {
				let path, buf, fileVO,filesMap,oldSize;
				path = vo.path;

				//保存文件：
				buf = Buffer.from(act.data, "base64");
				await fsp.writeFile(path + "/files_"+act.versionIdx+"/" + act.path, buf);
				vo.items.files[act.path]=act.data;
			};

			//-----------------------------------------------------------------------
			//执行操作：删除文件/目录:
			DoActDel = async function (vo, act) {
				let path;
				path = vo.path;
				await fsp.rm(path + "/files_"+act.versionIdx+"/" + act.path, {recursive: true, force: true});
				vo.items.deletes.push(act.path);
			};
		}

		//-----------------------------------------------------------------------
		//完成一次版本更新:
		apiMap["diskCommitFin"] = async function (req, res, next) {
			let reqVO,diskId,commitKey,commitVO,actVO,time,list,i,n,updateVO,jsonText;
			let jsonPath,briefVO,briefItems,diskInfoVO,versionIdx,diskPath;
			let resVO,dbVO;
			time=Date.now();
			reqVO=req.body.vo;
			commitKey=reqVO.key;
			commitVO=commitMap[commitKey];
			commitVO.items={dirs:[],files:{},deletes:[]};
			if(!commitVO){
				res.json({code:-100,info:"Commit key is invalid."});
				return;
			}
			diskId=commitVO.diskId;
			briefVO={
				diskId:diskId,
				user:commitVO.user,
				time:commitVO.time,
				version:commitVO.version,
				versionIdx:commitVO.versionIdx,
				items:{dirs:[],files:[],deletes:[]},
			};
			diskPath=commitVO.path;
			versionIdx=commitVO.versionIdx;
			briefItems=briefVO.items;
			await fsp.mkdir(diskPath+"/files_"+versionIdx,{recursive: true});
			if(versionIdx>1) {
				try{
					await fsp.access(diskPath+"/files_"+(versionIdx-1));
					await fsp.cp(diskPath + "/files_" + (versionIdx - 1), diskPath + "/files_" + versionIdx, {
						recursive: true,
						force: true
					});
				}catch(e){
					await fsp.cp(diskPath + "/files", diskPath + "/files_" + versionIdx, {
						recursive: true,
						force: true
					});
				}
			}
			list=commitVO.actions;
			n=list.length;
			for(i=0;i<n;i++){
				actVO=list[i];
				actVO.versionIdx=versionIdx;
				switch(actVO.act){
					case "dir":
						await DoActDir(commitVO,actVO);
						briefItems.dirs.push(actVO.path);
						break;
					case "file":
						await DoActFile(commitVO,actVO);
						briefItems.files.push(actVO.path);
						break;
					case "delete":
						await DoActDel(commitVO,actVO);
						briefItems.deletes.push(actVO.path);
						break;
				}
			}

			//要保存的updateVO:
			updateVO={
				diskId:diskId,
				user:commitVO.user,
				time:commitVO.time,
				version:commitVO.version,
				versionIdx:commitVO.versionIdx,
				items:commitVO.items,
				info:reqVO.info||commitVO.info||""
			};

			briefVO.info=updateVO.info;

			//保存这次更新的json:
			jsonText=JSON.stringify(updateVO);
			jsonPath=commitVO.path+"/updates/"+commitVO.versionIdx+".json";
			await fsp.writeFile(jsonPath,jsonText);

			//保存这次更新的摘要json:
			jsonText=JSON.stringify(briefVO);
			jsonPath=commitVO.path+"/updates/"+commitVO.versionIdx+"_brief.json";
			await fsp.writeFile(jsonPath,jsonText);

			//要保存的diskVO:
			let dirList=Array.from(commitVO.dirsSet.keys());
			dirList.sort((a,b)=>a>b?1:(a===b?0:-1));
			diskInfoVO={
				diskId:commitVO.diskId,
				version:commitVO.version,
				versionIdx:commitVO.versionIdx,
				owner:commitVO.owner,
				lastUpdateUser:commitVO.user,
				time:commitVO.time,
				totalFileNum:commitVO.totalFileNum,
				diskSize:commitVO.totalSize,
				dirs:dirList,
				files:commitVO.filesMap,
			};

			//保存整个disk的索引json:
			jsonText=JSON.stringify(diskInfoVO);
			jsonPath=commitVO.path+"/disk.json";
			await fsp.writeFile(jsonPath,jsonText);
			jsonPath=commitVO.path+"/updates/"+commitVO.versionIdx+"_disk.json";
			await fsp.writeFile(jsonPath,jsonText);

			//更新磁盘的数据库文件:
			dbVO={
				$set:{
					version:commitVO.version,
					versionIdx:commitVO.versionIdx,
					lastUpdateTime:commitVO.time,
					lastUpdateUser:commitVO.user,
					updateLocker:"",
					updateKey:"",
					updateLockExpire:0,
					totalFileNum:commitVO.totalFileNum,
					diskSize:commitVO.totalSize
				}
			};
			await dbDisk.updateOne({_id:commitVO.diskId},dbVO);
			commitVO.done=1;

			//取消超时回调
			if(commitVO.timer){
				clearTimeout(commitVO.timer);
			}
			delete commitMap[commitKey];

			//Zip目录，用于快速checkout:
			child_process.exec("zip -r ../"+commitVO.versionIdx+"files.zip *",{cwd:commitVO.path+"/files_"+versionIdx});

			resVO={
				code:200,
				version: commitVO.version,
				versionIdx: commitVO.versionIdx,
				diskVO:diskInfoVO
			};
			res.json(resVO);
			
			//Delete older files dir:
			if(versionIdx>=3){
				for(let vidx=versionIdx-2; vidx>versionIdx-5 && vidx>0; vidx--) {
					await fsp.rm(commitVO.path + "/files_" + vidx, { force: true, recursive: true });
				}
			}
		};

		//-----------------------------------------------------------------------
		//得到磁盘信息:
		apiMap["diskInfo"] = async function (req, res, next) {
			let reqVO,checkToken,userId,token,diskId,diskInfo,resVO,memberSet;
			let access,list,i,n;
			reqVO=req.body.vo;
			userId=reqVO.userId;
			token=reqVO.token;
			checkToken=0;
			if(reqVO&& token){
				checkToken=await dbUser.count({_id:userId,token:token});
			}
			diskId=reqVO.diskId;
			diskInfo=await dbDisk.findOne({_id:diskId});
			if(!diskInfo) {
				res.json({code:-100,info:"Disk not found."});
				return;
			}
			resVO={
				code:200,diskId:diskId,name:diskInfo.name,userId:diskInfo.userId,user:diskInfo.user,
			};
			if(diskInfo.public){
				access=1;
			}else{
				CheckAccess:{
					access=0;
					list=diskInfo.members;
					n=list.length;
					for(i=0;i<n;i++){
						if(list[i].userId===userId && checkToken){
							access=1;
							break;
						}
					}
					if(!access){
						res.json({code:-101,info:"Access denied, only member can access this disk."});
						return;
					}
				}
			}
			if(access){
				//版本信息:
				resVO.version=diskInfo.version;
				resVO.versionIdx=diskInfo.versionIdx;
				resVO.totoalFileNum=diskInfo.totoalFileNum;
				resVO.diskSize=diskInfo.diskSize;

				resVO.lastUpdate=diskInfo.lastUpdate;
				resVO.lastUpdateUser=diskInfo.lastUpdateUser;
				resVO.members=diskInfo.members.slice(0);
				resVO.descShort=diskInfo.descShort;
				//更多信息:
				resVO.followUserNum=diskInfo.followUserNum;
				resVO.fovNum=diskInfo.fovNum;
				resVO.points=diskInfo.points;
				resVO.package=diskInfo.package||"";
			}
			res.json(resVO);
		};

		//-----------------------------------------------------------------------
		//获得一个磁盘完整映像zip:
		apiMap["diskCheckOut"] = async function (req, res, next) {
			let reqVO,checkToken,userId,token,diskId,diskInfo,resVO,versionIdx;
			let access,list,i,n;

			reqVO=req.body.vo;
			userId=reqVO.userId;
			token=reqVO.token;
			checkToken=0;
			diskId=reqVO.diskId;
			versionIdx=reqVO.versionIdx;
			if(reqVO&& token){
				checkToken=await dbUser.count({_id:userId,token:token});
			}
			diskInfo=await dbDisk.findOne({_id:diskId});
			if(!diskInfo) {
				res.json({code:-100,info:"Disk not found."});
				return;
			}
			resVO={
				code:200,diskId:diskId,name:diskInfo.name,userId:diskInfo.userId
			};
			if(diskInfo.public){
				access=1;
			}else{
				CheckAccess:{
					access=0;
					list=diskInfo.members;
					n=list.length;
					for(i=0;i<n;i++){
						if(list[i].userId===userId && checkToken){
							access=1;
							break;
						}
					}
					if(!access){
						res.json({code:-101,info:"Access denied, only member can access this disk."});
						return;
					}
				}
			}
			if(versionIdx>0){
				//这个是取某一个版本
				if(versionIdx>diskInfo.versionIdx) {
					res.json({code:-102,info:"Version idx error, max version: "+diskInfo.versionIdx});
					return;
				}
				resVO.versionIdx=versionIdx;
				//取指定版本的信息:
			}else{
				//这是取当前版本:
				versionIdx=diskInfo.versionIdx;
				resVO.version=diskInfo.version;
				resVO.versionIdx=versionIdx;
				resVO.lastUpdate=diskInfo.lastUpdate;
				resVO.lastUpdateUser=diskInfo.lastUpdateUser;
				resVO.members=diskInfo.members.slice(0);
				resVO.descShort=diskInfo.descShort;
			}
			//读取diskJSON:
			{
				let jsonPath;
				jsonPath=diskInfo.path+"/updates/"+versionIdx+"_disk.json";
				resVO.diskJSON=await fsp.readFile(jsonPath,{encoding:"utf8"});
			}

			//读取zip:
			{
				let zipPath;
				zipPath=diskInfo.path+"/"+versionIdx+"files.zip";
				resVO.zipData=await fsp.readFile(zipPath,{encoding:"base64"});
			}
			res.json(resVO);
		};

		//-----------------------------------------------------------------------
		//获得一个磁盘的文件版本信息:
		apiMap["diskTreeInfo"] = async function (req, res, next) {
			let reqVO,checkToken,userId,token,diskId,diskInfo,resVO,versionIdx;
			let access,list,i,n;

			reqVO=req.body.vo;
			userId=reqVO.userId;
			token=reqVO.token;
			checkToken=0;
			if(reqVO&& token){
				checkToken=await dbUser.count({_id:userId,token:token});
			}
			diskId=reqVO.diskId;
			diskInfo=await dbDisk.findOne({_id:diskId});
			if(!diskInfo) {
				res.json({code:-100,info:"Disk not found."});
				return;
			}
			versionIdx=reqVO.versionIdx;
			resVO={
				code:200,diskId:diskId,name:diskInfo.name,userId:diskInfo.userId
			};
			if(diskInfo.public){
				access=1;
			}else{
				CheckAccess:{
					access=0;
					list=diskInfo.members;
					n=list.length;
					for(i=0;i<n;i++){
						if(list[i].userId===userId && checkToken){
							access=1;
							break;
						}
					}
					if(!access){
						res.json({code:-101,info:"Access denied, only member can access this disk."});
						return;
					}
				}
			}
			if(versionIdx>0){
				//这个是取某一个版本
				if(versionIdx>diskInfo.versionIdx) {
					res.json({code:-102,info:"Version idx error, max version: "+diskInfo.versionIdx});
					return;
				}
				resVO.versionIdx=versionIdx;
				//取指定版本的信息:
			}else{
				//这是取当前版本:
				versionIdx=diskInfo.versionIdx;
				resVO.version=diskInfo.version;
				resVO.versionIdx=versionIdx;
				resVO.lastUpdate=diskInfo.lastUpdate;
				resVO.lastUpdateUser=diskInfo.lastUpdateUser;
				resVO.members=diskInfo.members.slice(0);
				resVO.descShort=diskInfo.descShort;
			}
			//读取diskJSON:
			{
				let jsonPath;
				jsonPath=diskInfo.path+"/updates/"+versionIdx+"_disk.json";
				resVO.diskJSON=await fsp.readFile(jsonPath,{encoding:"utf8"});
			}
			res.json(resVO);
		};

		//-----------------------------------------------------------------------
		//获得一个磁盘某一个版本的升级内容:
		apiMap["diskGetUpdateInfo"] = async function (req, res, next) {
			let reqVO,checkToken,userId,token,diskId,diskInfo,resVO,versionIdx;
			let access,list,i,n;
			userId=reqVO.userId;
			token=reqVO.token;
			reqVO=req.body.vo;
			checkToken=0;
			if(reqVO&& token){
				checkToken=await dbUser.count({_id:userId,token:token});
			}
			diskId=reqVO.diskId;
			diskInfo=await dbDisk.findOne({_id:diskId});
			if(!diskInfo) {
				res.json({code:-100,info:"Disk not found."});
				return;
			}
			versionIdx=reqVO.versionIdx;
			resVO={
				code:200,diskId:diskId,name:diskInfo.name,userId:diskInfo.userId
			};
			if(diskInfo.public){
				access=1;
			}else{
				CheckAccess:{
					access=0;
					list=diskInfo.members;
					n=list.length;
					for(i=0;i<n;i++){
						if(list[i].userId===userId && checkToken){
							access=1;
							break;
						}
					}
					if(!access){
						res.json({code:-101,info:"Access denied, only member can access this disk."});
						return;
					}
				}
			}
			if(versionIdx>=0 && versionIdx!==diskInfo.versionIdx){
				//这个是取某一个版本
				resVO.versionIdx=versionIdx;
			}else{
				versionIdx=diskInfo.versionIdx;
				resVO.version=diskInfo.version;
				resVO.versionIdx=versionIdx;
				resVO.lastUpdate=diskInfo.lastUpdate;
				resVO.lastUpdateUser=diskInfo.lastUpdateUser;
				resVO.members=diskInfo.members.slice(0);
				resVO.descShort=diskInfo.descShort;
			}

			//读取json:
			{
				let jsonPath;
				jsonPath=diskInfo.path+"/updates/"+versionIdx+"_brief.json";
				resVO.info=await fsp.readFile(jsonPath,{encoding:"utf-8"});
			}
			res.json(resVO);
		};

		//-----------------------------------------------------------------------
		//下载一个磁盘文件，只能下载当前版本的文件:
		apiMap["diskGetFile"] = async function (req, res, next) {
			let reqVO,checkToken,userId,token,diskId,diskInfo,resVO;
			let access,list,i,n,filePath,versionIdx,fileVO;
			reqVO=req.body.vo;
			userId=reqVO.userId;
			token=reqVO.token;
			filePath=reqVO.path;
			if(filePath.startsWith("/")){
				filePath=filePath.substring(1);
			}
			checkToken=0;
			if(reqVO&& token){
				checkToken=await dbUser.count({_id:userId,token:token});
			}
			diskId=reqVO.diskId;
			diskInfo=await dbDisk.findOne({_id:diskId});
			if(!diskInfo) {
				res.json({code:-100,info:"Disk not found."});
				return;
			}
			versionIdx=reqVO.versionIdx||diskInfo.versionIdx;
			resVO={
				code:200,path:filePath
			};
			if(diskInfo.public){
				access=1;
			}else{
				CheckAccess:{
					access=0;
					list=diskInfo.members;
					n=list.length;
					for(i=0;i<n;i++){
						if(list[i].userId===userId && checkToken){
							access=1;
							break;
						}
					}
					if(!access){
						res.json({code:-101,info:"Access denied, only member can access this disk."});
						return;
					}
				}
			}

			//读取文件:
			{
				let dataPath;
				dataPath=diskInfo.path+"/files_"+versionIdx+"/"+filePath;
				try {
					resVO.fileData = await fsp.readFile(dataPath, {encoding: "base64"});
				}catch(e){
					dataPath=diskInfo.path+"/files/"+filePath;
					try {
						resVO.fileData = await fsp.readFile(dataPath, {encoding: "base64"});
					}catch(e){
						res.json({ code: -102, info: "File not found." });
						return;
					}
				}
			}
			res.json(resVO);
		};

		//-----------------------------------------------------------------------
		//修改磁盘信息:
		apiMap["diskSetInfo"] = function (req, res, next) {
			//TODO: Code this:
		};

		//-----------------------------------------------------------------------
		//删除一个磁盘:
		apiMap["diskDropDisk"] = function (req, res, next) {
			//TODO: Code this:
		};

		//-----------------------------------------------------------------------
		//创建Tag
		apiMap["diskMakeTag"] = function (req, res, next) {
			//TODO: Code this:
		};

		//-----------------------------------------------------------------------
		//分享磁盘的当前版本，指定版本号等:
		apiMap["diskShareTag"] = function (req, res, next) {
			//TODO: Code this:
		};

		//-----------------------------------------------------------------------
		//分享磁盘的当前版本为测试:
		apiMap["diskShareTest"] = function (req, res, next) {
			//TODO: Code this:
		};
	}

	//***********************************************************************
	//扩展用户相关磁盘行为:
	//***********************************************************************
	{
		//-----------------------------------------------------------------------
		//关注:
		apiMap["diskFollowDisk"] = function (req, res, next) {
			//TODO: Code this:
		};

		//-----------------------------------------------------------------------
		//评论:
		apiMap["diskCommentPost"] = function (req, res, next) {
			//TODO: Code this:
		};

		//-----------------------------------------------------------------------
		//回复评论:
		apiMap["diskCommentReply"] = function (req, res, next) {
			//TODO: Code this:
		};

		//-----------------------------------------------------------------------
		//申请加入开发:
		apiMap["diskMemberApply"] = function (req, res, next) {
			//TODO: Code this:
		};

		//-----------------------------------------------------------------------
		//邀请加入开发:
		apiMap["diskMemberInvite"] = function (req, res, next) {
			//TODO: Code this:
		};

		//-----------------------------------------------------------------------
		//成员拒绝，退出，移除:
		apiMap["diskMemberReject"] = function (req, res, next) {
			//TODO: Code this:
		};

		//-----------------------------------------------------------------------
		//成员角色:
		apiMap["diskMemberRole"] = function (req, res, next) {
			//TODO: Code this:
		};
	}
};


