import {JAXEnv} from './JAXEnv.js';
import {JAXAni} from "./JAXAni.js";
import {JAXAniHtml} from "./JAXAniHtml.js";

const STATE_NONE=0;
const STATE_READY=1;
const STATE_ANI=2;
const STATE_PAUSED=3;
const STATE_END=4;
const STATE_CANCELED=5;

var JAXAniPose,__Proto;

//---------------------------------------------------------------------------
//淡入/淡出动画:
JAXAniPose=function(env,def,hud)
{
	if(!env){
		return;
	}
	JAXAni.call(this,env,def,hud);
	this.htmlAni=null;
	this.htmlDef=null;
};

__Proto=JAXAniPose.prototype=new JAXAni();

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
	};

	//-----------------------------------------------------------------------
	//开始动画
	__Proto.start = function (time) {
		var self,htmlDef,hud,vo1,vo2,x,y,def,w,h;
		if (this.state !== STATE_READY) {
			this.jaxEnv.logError("Ani not ready!");
			return;
		}
		hud=this.hud;
		self=this;
		vo1={};vo2={};
		def=def||this.def;
		htmlDef={
			keyframes:[vo1,vo2],
			duration:def.duration||time||200
		};
		if("alpha" in def) {
			vo1.opacity = hud.alpha;
			vo2.opacity = def.alpha;
		}
		if("x" in def) {
			x = def.x;
			if(x instanceof Function){
				x=x.call(hud);
			}
			switch(hud.anchorH){
				case 0:
					vo1.left=hud.x+"px";
					vo2.left=x+"px";
					break;
				case 1:
					vo1.left=(hud.x-hud.w*0.5)+"px";
					vo2.left=(x-hud.w*0.5)+"px";
					break;
				case 2:
					vo1.left=(hud.x-hud.w)+"px";
					vo2.left=(x-hud.w)+"px";
					break;
			}
		}
		if("y" in def) {
			y = def.y || hud.y;
			if (y instanceof Function) {
				y = y.call(hud);
			}
			switch(hud.anchorH){
				case 0:
					vo1.top=hud.y+"px";
					vo2.top=y+"px";
					break;
				case 1:
					vo1.top=(hud.y-hud.h*0.5)+"px";
					vo2.top=(y-hud.h*0.5)+"px";
					break;
				case 2:
					vo1.top=(hud.y-hud.h)+"px";
					vo2.top=(y-hud.h)+"px";
					break;
			}
		}
		if("scale" in def){
			vo1.transform='scale('+hud.scale+')';
			vo2.transform='scale('+(def.scale?def.scale:hud.scale)+')';
		}
		if("w" in def) {
			w = def.w;
			if(w instanceof Function){
				w=x.call(hud);
			}
			vo1.width=hud.w+"px";
			vo2.width=w+"px";
		}
		if("h" in def) {
			h = def.h;
			if(h instanceof Function){
				h=x.call(hud);
			}
			vo1.height=hud.h+"px";
			vo2.height=h+"px";
		}
		htmlDef.time=def.time;
		this.htmlDef=htmlDef;
		this.htmlAni=new JAXAniHtml(this.jaxEnv,htmlDef,this.hud);
		//this.hud.setDisplay(1);
		this.htmlAni.start();
		this.htmlAni.OnFinish=function(){
			if("x" in def){
				hud.x = def.x;
			}
			if("y" in def){
				hud.y = def.y;
			}
			if("w" in def){
				hud.w = def.w;
			}
			if("h" in def){
				hud.h = def.h;
			}
			if("alpha" in def){
				hud.alpha = def.alpha;
			}
			if("scale" in def){
				hud.scale = def.scale;
			}
			self.OnFinish&&self.OnFinish();
			self.htmlAni=null;
		};
		this.htmlAni.OnCancel=function(){
			self.OnCancel&&self.OnCancel();
			self.htmlAni=null;
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
	JAXAni.regHudByType("pose",function(env,def,hud){
		return new JAXAniPose(env,def,hud)
	});
}

export {JAXAniPose};