import {JAXEnv} from './JAXEnv.js';
import {JAXAni} from "./JAXAni.js";

var JAXAniHtml,__Proto;
const STATE_NONE=0;
const STATE_READY=1;
const STATE_ANI=2;
const STATE_PAUSED=3;
const STATE_END=4;
const STATE_CANCELED=5;

//---------------------------------------------------------------------------
//基于Html的animation:
JAXAniHtml=function(env,def=null,hud=null)
{
	if(!env)
		return;
	JAXAni.call(this,env,def,hud);
	this.aniObj=null;//Html Animation对象
};

__Proto=JAXAniHtml.prototype=new JAXAni();

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
	__Proto.start = function () {
		let div,def,self;
		if (this.state !== STATE_READY) {
			this.jaxEnv.logError("Ani not ready!");
			return;
		}
		self=this;
		def=this.def;
		div=this.hud.webObj;
		this.startTime = Date.now();
		this.state = STATE_ANI;
		this.aniObj=div.animate(def.keyframes,def.options||def.duration);
		//设置回调:
		this.aniObj.onfinish=function(){
			self.OnFinish&&self.OnFinish();
		};
		this.aniObj.oncancel=function(){
			self.OnCancel&&self.OnCancel();
		};
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
		this.aniObj.play();
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
	//
	JAXAni.regHudByType("html",function(env,def,hud){
		return new JAXAniHtml(env,def,hud)
	});
}

export {JAXAniHtml};