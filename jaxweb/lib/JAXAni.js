import {JAXEnv} from "./JAXEnv.js";
var JAXAni,__Proto;

const STATE_NONE=0;
const STATE_READY=1;
const STATE_ANI=2;
const STATE_PAUSED=3;
const STATE_END=4;
const STATE_CANCELED=5;

//---------------------------------------------------------------------------
//JAX中的动画，动画都是与时间相关的
JAXAni=function(env,def=null,hud=null)
{
	if(!env)
		return;
	this.jaxEnv=env;
	this.startTime=0;
	this.endTime=0;
	this.state=0;
	this.hud=null;
	this.state=STATE_NONE;
	this.OnFinish=null;
	this.OnCanel=null;
	if(def){
		this.initByDef(def);
	}
	if(hud){
		this.bind2Hud(hud);
	}
};
__Proto=JAXAni.prototype={};

//***************************************************************************
//注册Ani类型/创建Ani:
//***************************************************************************
{
	var HudTypeHash = {};

	//---------------------------------------------------------------------------
	//注册Hud控件类型
	JAXAni.regHudByType = function (typeName, func) {
		HudTypeHash[typeName] = func;
	};

	//---------------------------------------------------------------------------
	//根据类型创建Ani
	JAXAni.createAniByType = function (typeName, env, css,hud) {
		let typeType,func,ani;
		typeType=typeof(typeName);
		if(typeType==="string") {
			func = HudTypeHash[typeName];
		}
		ani=func(env,css,hud);
		return ani;
	};
}

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
		if (this.state !== STATE_READY) {
			this.jaxEnv.logError("Ani not ready!");
			return;
		}
		this.startTime = Date.now();
		this.state = STATE_ANI;
	};

	//-----------------------------------------------------------------------
	//暂停动画:
	__Proto.pause = function () {
		//TODO: Code this:
	};

	//-----------------------------------------------------------------------
	//恢复动画:
	__Proto.resume = function () {
		//TODO: Code this:
	};

	//-----------------------------------------------------------------------
	//停止动画:
	__Proto.finish = function () {
		//TODO: Code this:
	};

	//-----------------------------------------------------------------------
	//取消动画:
	__Proto.cancel = function () {
		//TODO: Code this:
	};
}


export {JAXAni};
