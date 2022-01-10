import {JAXEnv} from './JAXEnv.js';
import {JAXAni} from "./JAXAni.js";
import {JAXAniHtml} from "./JAXAniHtml.js";

const STATE_NONE=0;
const STATE_READY=1;
const STATE_ANI=2;
const STATE_PAUSED=3;
const STATE_END=4;
const STATE_CANCELED=5;

var JAXAniFade,__Proto;

//---------------------------------------------------------------------------
//淡入/淡出动画:
JAXAniFade=function(env,def,hud)
{
	if(!env){
		return;
	}
	JAXAni.call(this,env,def,hud);
	this.htmlAni=null;
	this.htmlDef=null;
};

__Proto=JAXAniFade.prototype=new JAXAni();

//***************************************************************************
//通用接口:
//***************************************************************************
{
	//-----------------------------------------------------------------------
	//初始化:
	__Proto.initByDef = function (def) {
		if (this.def) {
			this.jaxEnv.logError("Ani already inited.");
			return;
		}
		this.def = def;
		this.OnFinish=def.OnFinish;
		this.OnCancel=def.OnCancel;
		if (this.hud) {
			this.state = STATE_READY;
		}
	};

	//-----------------------------------------------------------------------
	//与Hud绑定:
	__Proto.bind2Hud = function (hud) {
		this.hud = hud;
		if (this.def) {
			this.state = STATE_READY;
		}
		this.orgDisplay=hud.display;
	};

	//-----------------------------------------------------------------------
	//设置/开始渐入
	__Proto.startFadeIn=function(def,time=0){
		var self,htmlDef,hud,vo1,vo2,x,y;
		hud=this.hud;
		self=this;
		vo1={};vo2={};
		def=def||this.def;
		htmlDef={
			keyframes:[vo1,vo2],
			duration:def.time||def.duration||time||200
		};
		vo1.opacity=def.alpha?def.alpha:0;
		vo2.opacity=hud.alpha;
		if("offset" in def){
			x=def.offset[0]||def.offset.x||0;
			y=def.offset[1]||def.offset.y||0;
		}else{
			if("dx" in def){
				x=def.dx
			}
			if("dy" in def){
				y=def.dy
			}
		}
		if(x instanceof Function){
			x=x.call(hud);
		}
		if(y instanceof Function){
			y=y.call(hud);
		}
		vo1.transform='translate('+x+'px, '+y+'px) scale('+(def.scale?def.scale:hud.scale)+')';
		vo2.transform='translate(0,0) scale('+hud.scale+')';
		this.htmlDef=htmlDef;
		this.htmlAni=new JAXAniHtml(this.jaxEnv,htmlDef,this.hud);
		this.hud.display=1;
		this.htmlAni.start();
		this.htmlAni.OnFinish=function(){
			//this.hud.alpha=1;
			self.OnFinish&&self.OnFinish();
			self.htmlAni=null;
		};
		this.htmlAni.OnCancel=function(){
			self.OnCancel&&self.OnCancel();
			self.htmlAni=null;
		};
		this.state=STATE_ANI;
	};

	//-----------------------------------------------------------------------
	//设置/开始渐出:
	__Proto.startFadeOut=function(def,time=0){
		var self,htmlDef,hud,vo1,vo2,x,y;
		self=this;
		hud=self.hud;
		/*if(!this.orgDisplay && !hud.alpha){
			jaxEnv.callAfter(()=>{
				self.OnFinish&&self.OnFinish();
				self.htmlAni=null;
			});
			return;
		}*/
		def=def||this.def;
		vo1={};vo2={};
		htmlDef={
			keyframes:[vo1,vo2],
			duration:def.time||def.duration||time||200
		};
		vo1.opacity=hud.alpha;
		vo2.opacity=def.alpha||0;
		if("offset" in def){
			x=def.offset[0]||def.offset.x||0;
			y=def.offset[1]||def.offset.y||0;
		}else{
			if("dx" in def){
				x=def.dx
			}
			if("dy" in def){
				y=def.dy
			}
		}
		if(x instanceof Function){
			x=x.call(hud);
		}
		if(y instanceof Function){
			y=y.call(hud);
		}
		vo1.transform='translate(0,0) scale('+hud.scale+')';
		vo2.transform='translate('+x+'px, '+y+'px) scale('+(def.scale?def.scale:hud.scale)+')';
		this.htmlDef=htmlDef;
		this.htmlAni=new JAXAniHtml(this.jaxEnv,htmlDef,this.hud);
		this.hud.display=1;
		this.htmlAni.start();
		this.htmlAni.OnFinish=function(){
			self.hud.display=0;
			//self.hud.alpha=def.alpha||0;
			self.OnFinish&&self.OnFinish();
			self.htmlAni=null;
		};
		this.htmlAni.OnCancel=function(){
			self.OnCancel&&self.OnCancel();
			self.htmlAni=null;
		};
		this.state=STATE_ANI;
	};

	//-----------------------------------------------------------------------
	//开始动画
	__Proto.start = function () {
		let div,def,self;
		if (this.state !== STATE_READY) {
			this.jaxEnv.logError("Ani not ready!");
			return;
		}
		def=this.def;
		switch(def.type){
			case "fadeIn":
			case "in":
			case 1:
				this.startFadeIn();
				break;
			case "fadeOUt":
			case "out":
			case 0:
				this.startFadeOut();
				break;
		}
	};

	//-----------------------------------------------------------------------
	//暂停动画:
	__Proto.pause = function () {
		if(this.state!==STATE_ANI){
			this.jaxEnv.logError("Ani not playing!");
			return;
		}
		this.htmlAni.pause();
		this.state=STATE_PAUSED;
	};

	//-----------------------------------------------------------------------
	//恢复动画:
	__Proto.resume = function () {
		if(this.state!==STATE_PAUSED){
			this.jaxEnv.logError("Ani not paused!");
			return;
		}
		this.htmlAni.resume();
		this.state=STATE_ANI;
	};

	//-----------------------------------------------------------------------
	//结束动画:
	__Proto.finish = function () {
		if(this.state!==STATE_PAUSED && this.state!==STATE_ANI){
			this.jaxEnv.logError("Can't stop ani!");
			return;
		}
		this.htmlAni.finish();
		this.htmlAni=null;
		this.state=STATE_END;
	};

	//-----------------------------------------------------------------------
	//取消动画:
	__Proto.cancel = function () {
		if(this.state!==STATE_PAUSED && this.state!==STATE_ANI){
			this.jaxEnv.logError("Can't stop ani!");
			return;
		}
		this.htmlAni.cancel();
		this.htmlAni=null;
		this.state=STATE_CANCELED;
	};
}

//***************************************************************************
//注册类型:
//***************************************************************************
{
	//-----------------------------------------------------------------------
	//注册动画类型:
	JAXAni.regHudByType("fadeIn",function(env,def,hud){
		return new JAXAniFade(env,def,hud)
	});
	JAXAni.regHudByType("fadeOut",function(env,def,hud){
		return new JAXAniFade(env,def,hud)
	});
	JAXAni.regHudByType("in",function(env,def,hud){
		return new JAXAniFade(env,def,hud)
	});
	JAXAni.regHudByType("out",function(env,def,hud){
		return new JAXAniFade(env,def,hud)
	});
}

export {JAXAniFade};