import {EventEmitter} from "./JAXEvents.js";

var CokeFrame,cokeFrame,liveFrames,nextSeq;

liveFrames={};
nextSeq=1;
//***************************************************************************
//Coke Frame
//***************************************************************************
{
	CokeFrame=function(){
		let ifm,seq;
		EventEmitter.call(this);
		seq=""+(nextSeq++);
		this.frame=ifm=document.createElement("iframe");
		ifm.src=`${document.location.origin}//-terminal/frame.html?${seq}`;
		this.frameStub=liveFrames[seq]={
			cokeFrame:this,seq:seq,frame:ifm,client:null
		};
		this.inCmd=false;
	};
	cokeFrame=CokeFrame.prototype=new EventEmitter();
	
	//-----------------------------------------------------------------------
	//Bind CokeFrame to a div:
	cokeFrame.createFrame=function(div){
		let ifm;
		ifm=this.frame;
		this.frameDiv=div;
		ifm.style.position="absolute";
		ifm.style.left="0px";
		ifm.style.top="0px";
		//ifm.style.width=div.offsetWidth+"px";
		//ifm.style.height=div.offsetHeight+"px";
		ifm.style.width="100%";
		ifm.style.height="100%";
		ifm.style.border="none";
		div.appendChild(ifm);
	};
	
	//-----------------------------------------------------------------------
	//Exec a command line in client iframe:
	cokeFrame.execCmd=function(text){
		return new Promise((resolve,reject)=>{
			let doneCbk,errorCbk;
			doneCbk=function(data){
				this.inCmd=false;
				resolve(data);
				this.off("ExecCommandDone",doneCbk);
				this.off("ExecCommandError",errorCbk);
			}
			errorCbk=function(data){
				this.inCmd=false;
				resolve(data);
				this.off("ExecCommandDone",doneCbk);
				this.off("ExecCommandError",errorCbk);
			}
			if(this.inCmd){
				reject(new Error("CokeFrame is executing another command."));
				return;
			}
			if(!this.frameStub.client){
				reject(new Error("CokeFrame is not ready yet."));
				return;
			}
			this.inCmd=true;
			this.on("ExecCommandDone",doneCbk);
			this.on("ExecCommandError",errorCbk);
			this.frameStub.client.postMessage({
				msgCatalog:"CokeFrameH2C",
				msg:"ExecCommand",
				cmd:text
			});
			
		});
	};
	
	//-----------------------------------------------------------------------
	//Start user input command:
	cokeFrame.startInputCmd=function(){
		this.inCmd=true;
		this.frameStub.client.postMessage({
			msgCatalog:"CokeFrameH2C",
			msg:"StartInputCmd",
		});
	};
	
	//-----------------------------------------------------------------------
	//Handle client2Host messages:
	window.addEventListener("message",async (evt)=>{
		let seq,stub,frame;
		//Filter messages:
		if(evt.data.msgCatalog!=="CokeFrameC2H"){
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
		switch(evt.data.msg){
			case "ClientReady": {
				stub.client=evt.source;
				stub.cokeFrame.emit("ClientReady")
				break;
			}
			case "ExecCommandDone": {
				if(stub.cokeFrame.execError) {
					stub.cokeFrame.emit("ExecCommandError",evt.data.msg.error);
				}else {
					stub.cokeFrame.emit("ExecCommandDone",evt.data.msg.result);
				}
				break;
			}
		}
	},false);
}

//---------------------------------------------------------------------------
//Make a i-frame inside [div] that runs a cokeEnv with tty:
var makeCokeFrame=function(div){
	return new Promise((resolve,reject)=>{
		let cfm;
		cfm=new CokeFrame();
		cfm.on("ClientReady",()=>{
			resolve(cfm);
		});
		cfm.createFrame(div);
	});
};


export {makeCokeFrame};