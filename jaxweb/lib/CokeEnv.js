import {JAXDisk} from "/jaxweb/lib/JAXDisk.js";
import CokeTTY from "/jaxweb/lib/CokeTTY.js"
import process from "/@process";
import {EventEmitter} from "/@events";
import pathApi from "/@path"
import {fsPromises as fsp} from "/@fs";
import {jaxExecPackage,jaxExecKillOne} from "/jaxweb/lib/JAXExecPkg.js";

let CokeEnv,cokeEnv;
let HostEnv,hostEnv;
//***************************************************************************
//CokeEnv:
//***************************************************************************
{
	CokeEnv = function (jaxEnv) {
		if (jaxEnv===undefined) {
			return;
		}
		EventEmitter.call(this);
		this.jaxEnv = jaxEnv;
		this.argLine = null;
		this.argv = [];
		this.stdin = null;
		this.stdout = null;
		this.stderr = null;
		this.tty = null;
		this.host = null;
		this.envVals = {
			get curPath () {
				return JAXDisk.appPath;
			},
			set curPath (path) {
				return JAXDisk.appPath = path;
			},
			//curPath:this.curDiskPath,
		};
		this.execPath = null;
		this.exitCode = 0;
		this.exitData=null;
		
		this.waitCmd=false;
		this.inCmd=false;
		this.curCmd=null;
		this.cmdProcessStub=null;
		this.cmdTextList=[];
		this.cmdTextIdx=-1;
		
		this.OnToolKey=this.OnToolKey.bind(this);
		this.OnExecKey=this.OnExecKey.bind(this);
		
		this.quickCmdMap={};
		if(!process.cokeEnv){
			process.cokeEnv=this;
		}
	};
	
	cokeEnv = CokeEnv.prototype = new EventEmitter();

	//-----------------------------------------------------------------------
	//Init env:
	cokeEnv.init = function (argLine, envVals, ttyDiv = null, host = null, seq = "") {
		argLine = argLine || "";
		this.argLine = argLine;
		this.argv = argLine.split(" ");
		this.host = host?(new HostEnv(this,host,seq)):null;
		Object.assign(this.envVals, envVals);
		this.execPath = JAXDisk.appPath;
		
		//初始化tty，取得stdin/stdout/stderr:
		this.tty = new CokeTTY(ttyDiv, this.host);
		this.stdin = this.tty.stdin;
		this.stdout = this.tty.stdout;
		this.stderr = this.tty.stdout;
	}

	//-----------------------------------------------------------------------
	//Exit env:
	cokeEnv.exit = function (code) {
		this.exitCode = code;
	};
	
	//------------------------------------------------------------------------
	//Register a quick command, quick command will exec in current page scope:
	cokeEnv.regQuickCmd=function(name,cmdFunc){
		this.quickCmdMap[name]=cmdFunc;
	};

	//-----------------------------------------------------------------------
	//Get current path
	CokeEnv.cwd=cokeEnv.cwd = function () {
		return JAXDisk.appPath;
	};
	
	//-----------------------------------------------------------------------
	//Get current path's diskName:
	CokeEnv.diskName=cokeEnv.diskName = function (path) {
		let pts;
		path=path||JAXDisk.appPath;
		pts=path.split("/");
		return pts[1];
	};
	
	//-----------------------------------------------------------------------
	//Get current path's related path to it's disk:
	CokeEnv.pathByDisk=cokeEnv.pathByDisk =cokeEnv.cwdDiskPath = function (path) {
		let pts;
		path=path||JAXDisk.appPath;
		pts=path.split("/");
		pts.splice(0,2);
		if(pts.length) {
			return pts.join("/");
		}
		return "";
	};
	
	//-----------------------------------------------------------------------
	//Set current path:
	CokeEnv.chdir=cokeEnv.chdir = function (dirPath) {
		if(dirPath[0]!=="/") {
			dirPath = pathApi.join(JAXDisk.appPath, dirPath);
		}
		JAXDisk.appPath = dirPath;
	}

	//-----------------------------------------------------------------------
	//Set a env variable
	cokeEnv.set = function (key, val) {
		this.envVals[key] = val;
	};

	//-----------------------------------------------------------------------
	//Get a env variable
	cokeEnv.get = function (key) {
		return this.envVals[key];
	};
	
	//-----------------------------------------------------------------------
	//Get a clone of current env variables' VO:
	cokeEnv.getEnvVals=function(){
		let vo={};
		Object.assign(vo,this.envVals);
		return vo;
	};
	
	//***********************************************************************
	//Process(Web pages/iFrames) interactive/ communicate:
	//***********************************************************************
	{
		//-------------------------------------------------------------------
		//Send message to [client] process:
		cokeEnv.postRemoteMsg=function(client,msg){
			msg.msgCatalog="FrameEXECHost";
			client.postMessage(msg);
		};
		
		//-------------------------------------------------------------------
		//Handle client的 message:
		cokeEnv.handleRemoteMsg = function (data,client) {
			let msg;
			msg=data.msg;
			switch(msg){
				case "StartInput":{
					this.tty.startInput(data.prefix,data.password||false,data.initText);
					this.tty.once("LineInput",(text)=>{
						this.postRemoteMsg(client,{msg:"LineInput",text:text});
					});
					break;
				}
				case "LineInput":{
					this.tty.endInput(data.text);
					break;
				}
				case "tty":
					this.tty[data.func].apply(this.tty,data.args);
					break;
			}
		};
	}
	
	//***********************************************************************
	//Execute command related functions:
	//***********************************************************************
	{
		//------------------------------------------------------------------------
		//Execute a command:
		cokeEnv.execCmd=async function(cmdText){
			let items,cmd,cmdFunc,stdout,retVO;
			
			this.inCmd=true;
			this.cmdTextList.push(cmdText);
			stdout=this.stdout;
			
			items=cmdText.split(" ");
			items=items.map(item=>item.trim()).filter(item=>!!item);
			cmd=items[0];
			this.curCmd=cmd;
			if(!cmd){
				this.inCmd=false;
				return;
			}
			cmdFunc=await this.getCmdFunc(cmd,cmdText);
			if(!cmdFunc){
				stdout.write("CokeEnv: "+cmd+": command not found.");
				this.inCmd=false;
				this.cmdProcessStub=null;
				return;
			}
			if(cmdFunc){
				try{
					this.inCmd=true;
					this.emit("ExecCmdStart",cmd);
					retVO=await cmdFunc(this,items,cmdText);
					this.inCmd=false;
					this.emit("ExecCmdDone",retVO);
				}catch(e){
					stdout.write("CokeEnv: "+cmd+": error in exec command: "+e);
				}
				this.cmdProcessStub=null;
				this.curCmd=null;
				this.inCmd=false;
				return retVO;
			}
			return null;
		};
		
		//------------------------------------------------------------------------
		//得到一个命令对应的函数:
		cokeEnv.getCmdFunc=async function(cmd,cmdText){
			let vo;
			//看看指令对应的Package是否存在
			vo=await this.checkPkg(cmd);
			if(vo && vo.main){
				if(vo.type==="cmd"){
					return (env,items,cmdText)=>{
						return new Promise(resolve=>{
							this.cmdProcessStub=jaxExecPackage(this,cmd,vo.main,cmdText,(code,cwd,data)=>{
								if(cwd){
									this.chdir(cwd);
								}
								resolve();
							});
						})
					};
				}else if(vo.type==="app"){
					return (env,items,cmdText)=> {
						let urlVO={
							cmd:cmdText,
							path:JAXDisk.appPath,
							cwd:JAXDisk.appPath,
							vals:this.envVals
						}
						//Open a new page add cmdText and path in the URL:
						window.open(`${vo.main}?cokeExecCmd=${encodeURIComponent(JSON.stringify(urlVO))}`);
					}
				}
			}
			return this.quickCmdMap[cmd]||null;
		};
		
		//------------------------------------------------------------------------
		//检查一个模块是不是存在:
		cokeEnv.checkPkg=async function(pkgName){
			let res,binJSON;
			//Check local disk bin for json:
			try{
				let disk;
				disk=this.diskName();
				if(disk){
					binJSON=await fsp.readFile(`/${disk}/bin/${pkgName}.json`,"utf8");
					binJSON=JSON.parse(binJSON);
					if(binJSON.main){
						return {
							type:binJSON.type||"cmd",
							main:document.location.origin+"/"+binJSON.main
						};
					}
				}
			}catch(err){
			}
			
			//Check system disk bin for json:
			try{
				binJSON=await fsp.readFile(`/coke/bin/${pkgName}.json`,"utf8");
				binJSON=JSON.parse(binJSON);
				if(binJSON.main){
					return {
						type:binJSON.type||"cmd",
						main:document.location.origin+"/"+binJSON.main
					}
				}
			}catch(err){
			}
			return false;
		};
	}
	
	//***********************************************************************
	//Advanced user interactions:
	//***********************************************************************
	{
		//------------------------------------------------------------------------
		//Input and exec command:
		cokeEnv.cmdInput=async function(execCmd=true,loop=true){
			let text;
			do{
				this.cmdTextIdx=this.cmdTextList.length;
				this.tty.on("ToolKey",this.OnToolKey);
				this.emit("StartInput");
				this.waitCmd=true;
				text=await this.tty.readLine();
				this.tty.off("ToolKey",this.OnToolKey);
				if(execCmd) {
					this.waitCmd=false;
					if(text) {
						this.tty.on("KeyInExec", this.OnExecKey);
						await this.execCmd(text);
						this.tty.off("KeyInExec", this.OnExecKey);
					}
				}else if(!loop){
					return text;
				}
			}while(!this.inCmd);
		};
		
		//------------------------------------------------------------------------
		//Hand tool keys while execing command:
		cokeEnv.OnExecKey=function(key) {
			if (this.inCmd) {
				if (key === "BreakCmd") {
					//Kill sub process:
					if (this.cmdProcessStub) {
						jaxExecKillOne(this.cmdProcessStub)
						this.cmdProcessStub = false;
						this.inCmd = false;
						this.curCmd = null;
					}
					this.stdout.write("\n^C\n");
				}
				return;
			}
		}
		
		//------------------------------------------------------------------------
		//Hand tool keys while command input :
		cokeEnv.OnToolKey=function(key){
			switch(key){
				case "ArrowUp":{
					let text;
					if(this.cmdTextIdx>0){
						this.cmdTextIdx-=1;
						text=this.cmdTextList[this.cmdTextIdx];
						this.tty.setInputText(text);
					}
					break;
				}
				case "ArrowDown":{
					let text;
					if(this.cmdTextIdx<this.cmdTextList.length){
						this.cmdTextIdx+=1;
						text=this.cmdTextList[this.cmdTextIdx]||"";
						this.tty.setInputText(text);
					}
					break;
				}
				case "BreakCmd": {
					break;
				}
				case "Tab":{
					let line,text,pts,path,pos,lead;
					line=this.tty.getInputText();
					pts=line.split(" ");
					text=pts[pts.length-1]||"";
					if(!text){
						return;
					}
					pos=text.lastIndexOf("/");
					if(pos===0){
						path="/";
						lead=text.substring(1);
					}else if(pos>0){
						path=text.substring(0,pos);
						lead=text.substring(pos+1);
						if(!path.startsWith("/")) {
							path = pathApi.join(this.cwd(), path);
						}
					}else{
						path=this.cwd();
						lead=text;
					}
					//得到目录下全部的entry
					fsp.readdir(path).then(list=>{
						list=list.filter(item=>item.startsWith(lead));
						if(list.length===1){
							//补全文件名
							this.tty.setInputText(line+list[0].substring(lead.length));
						}
					});
					break;
				}
			}
		};
	}
}

//***************************************************************************
//HostEnv:
//***************************************************************************
{
	HostEnv=function(env,host,seq){
		this.env=env;
		this.host=host;
		this.seq=seq;
	};
	hostEnv=HostEnv.prototype={};
	
	//-------------------------------------------------------------------
	//向Host发消息:
	hostEnv.sendRemoteMsg=function(msg){
		msg.msgCatalog = "FrameEXECClient";
		msg.frameSeq = this.seq;
		this.host.postMessage(msg);
	};
}


CokeEnv.instance=null;
export default CokeEnv;
export {CokeEnv}