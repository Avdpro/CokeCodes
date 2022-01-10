import {JAXDisk} from "/jaxweb/lib/JAXDisk.js";
import {CokeEnv} from "/jaxweb/lib/CokeEnv.js";
import pathLib from "/@path"
let freeFrames=[];
let frameSeq=0;
let liveFrames={};
let hostMsgHooked=0;
let clientMsgHooked=0;

//---------------------------------------------------------------------------
//作为Host，在iframe里执行一个pkg
let jaxExecPackage=function(env,pkgName,htmlPath,line,callback){
	let ifm,seq,stub,textOutMethod;

	if(!hostMsgHooked){
		hostMsgHooked=1;
		window.addEventListener("message",(evt)=>{
			let seq,stub,frame,callback;
			if(evt.data.msgCatalog!=="FrameEXECClient"){
				//其它消息:
				return;
			}

			seq=evt.data.frameSeq;
			stub=liveFrames[seq];
			if(!stub){
				return;
			}
			frame=stub.frame;
			if(!frame){
				return;
			}
			if(!stub.remote) {
				stub.remote = evt.source;
			}
			if(stub.kill) {
				if(!stub.killed){
					evt.source.postMessage({
						msgCatalog:"FrameEXECHost",
						msg:"Kill"
					});
					stub.killed=true;
					delete liveFrames[seq];
					callback&&callback(-100,env.cwd(),{});
					setTimeout(()=>{
						document.body.removeChild(stub.frame);
					},0);
				}
			}else {
				switch (evt.data.msg) {
					case "Ready"://准备就绪，可以执行消息了
						evt.source.postMessage({
							msgCatalog: "FrameEXECHost",
							msg: "Exec",
							cmdLine: stub.line,
							envVals: stub.env.getEnvVals && env.getEnvVals()
						});
						break;
					default:
						stub.env.handleRemoteMsg(evt.data, evt.source);
						break;
					case "TextOut":
						textOutMethod = evt.data.method || "out";
						if (stub.env[textOutMethod]) {
							stub.env[textOutMethod](evt.data.text);
						}
						break;
					case "ExecDone"://执行完毕
						callback = stub.callback;
						delete liveFrames[seq];
						callback && callback(evt.data.code, evt.data.cwd, evt.data.data);
						document.body.removeChild(stub.frame);
						break;
				}
			}
		},false);
	}

	ifm=freeFrames.pop();
	seq="JAXEXECFrame"+(frameSeq++);
	if(!ifm){
		ifm=document.createElement("iframe");
	}
	let ext;
	ext=pathLib.extname(htmlPath).toLowerCase();
	if(ext===".html" || ext===".htm"){
		ifm.src=htmlPath+"?"+seq;
	}else if(ext===".js" || ext===".mjs"){
		ifm.src=`${document.location.origin}//coke/bin/cmd.html?cmdFrameSeq=${seq}&src=${encodeURIComponent(htmlPath)}`;
	}
	ifm.name=seq;
	liveFrames[seq]=stub={
		env:env,seq:seq,pkgName:pkgName,line:line,frame:ifm,callback:callback,remote:null,kill:false,killed:false
	};
	document.body.appendChild(ifm);
	return stub;
};

//---------------------------------------------------------------------------
//Kill a child processes:
let jaxExecKillOne=function(stub){
	let seq,callback;
	seq=stub.seq;
	callback=stub.callback;
	if(stub.remote){
		stub.remote.postMessage({
			msgCatalog:"FrameEXECHost",
			msg:"Kill"
		});
		stub.killed=true;
		delete liveFrames[seq];
		callback&&callback(-100,stub.env.cwd(),{});
		setTimeout(()=>{
			document.body.removeChild(stub.frame);
		},0);
	}else{
		stub.kill=true;
		stub.killed=false;
	}
};

//---------------------------------------------------------------------------
//Kill all child processes:
let jaxExecKillAll=function(){
	let list;
	list=Object.values(liveFrames);
	list.forEach(stub=>{
		jaxExecKillOne(stub);
	})
};

//---------------------------------------------------------------------------
//作为client，执行一个函数:
let jaxClientExec=function(func){
	let seq,host,env;
	seq=window.cmdFrameSeq;
	if(!seq){
		throw "jaxClientExec: No client frame seq for exec!";
	}
	host=window.parent;
	if(!clientMsgHooked){
		clientMsgHooked=1;
		env=null;
		window.addEventListener("message",async (evt)=>{
			if(evt.data.msgCatalog!=="FrameEXECHost"){
				//其它消息:
				return;
			}
			switch(evt.data.msg){
				case "Exec": {//开始执行函数:
					let cmdLine,envVals;
					cmdLine=evt.data.cmdLine;
					envVals=evt.data.envVals;
					env=new CokeEnv(null);
					env.init(cmdLine,envVals,null,host,seq);
					try {
						await func(env, cmdLine);
					}catch(e){
						env.stderr.write("Error: "+e);
					}
					env.host.sendRemoteMsg({msg:"ExecDone",cwd:env.cwd(),code:env.exitCode||0,data:env.exitData||null});
					break;
				}
				case "Kill":{
					//Kill all child process:
					jaxExecKillAll();
				}
				default:{
					if(env){
						env.handleRemoteMsg(evt.data,evt.source);
					}
					break;
				}
			}
		},false);

		host.postMessage({
			msgCatalog:"FrameEXECClient",
			msg:"Ready",
			frameSeq:seq
		});
	}

};

export {jaxExecPackage,jaxClientExec,jaxExecKillOne,jaxExecKillAll};