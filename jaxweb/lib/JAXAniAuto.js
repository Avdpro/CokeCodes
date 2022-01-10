import {JAXEnv} from './JAXEnv.js';
import {JAXAni} from "./JAXAni.js";
import {JAXAniFade} from "./JAXAniFade.js";
import {JAXAniPose} from "./JAXAniPose.js";

const STATE_NONE=0;
const STATE_READY=1;
const STATE_ANI=2;
const STATE_PAUSED=3;
const STATE_END=4;
const STATE_CANCELED=5;

var JAXAniAuto,__Proto;

JAXAniAuto=function(env,def,hud){
	if(!env)
		return;
	this.orgDisplay=1;
	this.orgX=0;
	this.orgY=0;
	this.orgW=0;
	this.orgH=0;
	this.orgAlpha=1;
	this.orgScale=1;
	this.orgRotate=0;
	this.aniObj=null;
	JAXAni.call(this,env,def,hud);
};

__Proto=JAXAniAuto.prototype=new JAXAni();
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
		this.OnFinish = def.OnFinish;
		this.OnCancel = def.OnCancel;
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
		this.orgX=hud.x;
		this.orgY=hud.y;
		this.orgW=hud.w;
		this.orgH=hud.h;
		this.orgAlpha=hud.alpha;
		this.orgScale=hud.scale;
		this.orgRotate=hud.rotate;
	};

	//-----------------------------------------------------------------------
	//开始动画
	__Proto.start = function () {
		let div,def,self,hud,aniObj,aniDef;
		if (this.state !== STATE_READY) {
			this.jaxEnv.logError("Ani not ready!");
			return;
		}
		self=this;
		hud=this.hud;
		def=this.def;
		aniObj=null;
		aniDef={};
		if(hud.display && !this.orgDisplay){
			//使用FadeIn
			aniDef.type="in";
			aniDef.dx=def.dx||0;
			aniDef.dy=def.dy||0;
			aniDef.alpha=def.alpha||0;
			aniDef.scale=def.scale||this.orgScale;
			aniDef.time=def.time||200;
			aniObj=new JAXAniFade(this.jaxEnv,aniDef,hud);

		}else if(!hud.display && this.orgDisplay){
			//使用FadeOut
			aniDef.type="out";
			aniDef.dx=def.dx||0;
			aniDef.dy=def.dy||0;
			aniDef.alpha=def.alpha||0;
			aniDef.scale=def.scale||this.orgScale;
			aniDef.time=def.time||200;
			aniObj=new JAXAniFade(this.jaxEnv,aniDef,hud);
		}else if(hud.display){
			//使用Pose
			aniDef.type="pose";
			aniDef.x=hud.x;
			aniDef.y=hud.y;
			aniDef.w=hud.w;
			aniDef.h=hud.h;
			aniDef.alpha=hud.alpha;
			aniDef.scale=hud.scale;
			aniDef.time=def.time||200;
			aniObj=new JAXAniPose(this.jaxEnv,aniDef,hud);
			//TODO: 是否重置Hud状态:
			hud.x=this.orgX;
			hud.y=this.orgY;
			hud.w=this.orgW;
			hud.h=this.orgH;
			hud.alpha=this.orgAlpha;
			hud.scale=this.orgScale;
			hud.rotate=this.orgRotate;
		}else{
			this.jaxEnv.callAfter(()=>{
				self.OnFinish&&self.OnFinish();
				self.aniObj=null;
			});
			return;
		}
		this.aniObj=aniObj;
		if(aniObj){
			aniObj.start(def.time);
			this.aniObj.OnFinish=function(){
				self.OnFinish&&self.OnFinish();
				self.aniObj=null;
			};
			this.aniObj.OnCancel=function(){
				self.OnCancel&&self.OnCancel();
				self.aniObj=null;
			};
		}
		this.state=STATE_ANI;
	};

	//-----------------------------------------------------------------------
	//暂停动画:
	__Proto.pause = function () {
		if(this.state!==STATE_ANI){
			this.jaxEnv.logError("Ani not playing!");
			return;
		}
		this.aniObj.pause();
		this.state=STATE_PAUSED;
	};

	//-----------------------------------------------------------------------
	//恢复动画:
	__Proto.resume = function () {
		if(this.state!==STATE_PAUSED){
			this.jaxEnv.logError("Ani not paused!");
			return;
		}
		this.aniObj.resume();
		this.state=STATE_ANI;
	};

	//-----------------------------------------------------------------------
	//结束动画:
	__Proto.finish = function () {
		if(this.state!==STATE_PAUSED && this.state!==STATE_ANI){
			this.jaxEnv.logError("Can't stop ani!");
			return;
		}
		this.aniObj.finish();
		this.aniObj=null;
		this.state=STATE_END;
	};

	//-----------------------------------------------------------------------
	//取消动画:
	__Proto.cancel = function () {
		if(this.state!==STATE_PAUSED && this.state!==STATE_ANI){
			this.jaxEnv.logError("Can't stop ani!");
			return;
		}
		this.aniObj.cancel();
		this.aniObj=null;
		this.state=STATE_CANCELED;
	};
}
//***************************************************************************
//注册类型:
//***************************************************************************
{
	//-----------------------------------------------------------------------
	//注册动画类型:
	JAXAni.regHudByType("auto",function(env,def,hud){
		return new JAXAniAuto(env,def,hud)
	});
}


export {JAXAniAuto};