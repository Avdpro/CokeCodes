import {JAXEnv,$JXV} from "./JAXEnv.js";
import {JAXHudObj} from "./JAXHudObj.js";
import {jaxHudState} from "./JAXHudState.js";

var JAXHudGroup,__Proto;

__Proto=new JAXHudObj();

JAXHudGroup=function(jaxEnv)
{
	var _attrChanged;
	var signUpdate;

	JAXHudObj.call(this,jaxEnv);

	var valJXVMap,hudView;
	valJXVMap=this.$valJXVMap;
	hudView=this.hudView;

	this.jaxClassFunc=JAXHudGroup;
	signUpdate=this.signUpdate;
	this.x=0;this.y=0;this.w=0;this.h=0;
	this.anchorV=0;this.anchorH=0;

	_attrChanged=0;

	Object.defineProperty(this,'attrChanged',{
		get:function(){return _attrChanged;},
		set:function(v){_attrChanged=1;},
		enumerable:false
	});

	//***********************************************************************
	//CSS属性:
	//***********************************************************************
	{
		//控件宽度
		Object.defineProperty(this, 'w', {
			get: function () {
				return 0;
			},
			set: function (v) {
				return true;
			},
			enumerable: true,
			configurable:true
		});

		//控件高度
		Object.defineProperty(this, 'h', {
			get: function () {
				return 0;
			},
			set: function (v) {
				return true;
			},
			enumerable: true,
			configurable:true
		});

		//控件X锚点:
		Object.defineProperty(this, 'anchorH', {
			get: function () {
				return 0;
			},
			set: function (v) {
				return true;
			},
			enumerable: true,
			configurable:true
		});

		//控件Y锚点:
		Object.defineProperty(this, 'anchorV', {
			get: function () {
				return 0;
			},
			set: function (v) {
				return true;
			},
			enumerable: true,
			configurable:true
		});

		//控件客户区域宽度
		Object.defineProperty(this, 'clientW', {
			get: function () {
				let owner;
				owner=this.father_||this.owner_;
				return owner?owner.clientW:0;
			},
			set: function (v) {
				return v;
			},
			enumerable: true,
			configurable:true
		});

		//控件客户区域宽度
		Object.defineProperty(this, 'clientH', {
			get: function () {
				let owner;
				owner=this.father_||this.owner_;
				return owner?owner.clientH:0;
			},
			set: function (v) {
				return v;
			},
			enumerable: true,
			configurable:true
		});
	}

	//***********************************************************************
	//不会被继承的方法:
	//***********************************************************************
	{
		this._syncWebObjAttr=function(){
			let webObj,style;
			webObj=this.webObj;
			if(webObj){
				style=webObj.style;
			}
			_attrChanged=0;
		}
	}
};

JAXHudGroup.prototype=__Proto;

//***************************************************************************
//属性列表/注册创建函数:
//***************************************************************************
{
	//CSS属性列表
	JAXHudGroup.jaxPptSet=new Set(Array.from(JAXHudObj.jaxPptSet).concat([
	]));

	//---------------------------------------------------------------------------
	//注册基础Hud类
	JAXHudObj.regHudByType('group', function (env) {
		return new JAXHudGroup(env);
	});
}

//***************************************************************************
//可继承的成员函数:
//***************************************************************************
{
	//---------------------------------------------------------------
	//ApplyCSS的开始，创建WebObj:
	__Proto.preApplyCSS = function (cssObj)
	{
		var div, father;
		let jaxEnv=this.jaxEnv;
		this.removeAllChildren();

		let owner,ownerState;
		father = this.father;
		owner = this.owner;

		if(!this.webObj) {
			div = this.webObj = document.createElement('div');
			div.style.position = "absolute";
			father = this.father;
			if (father && father.webObj) {
				father.webObj.appendChild(div);
			}
			div.jaxObj = this;
		}
		if(cssObj.faces){
			cssObj.jaxObjHash=1;
		}
		//确定StateObj:
		var stateObj=cssObj.hudState;
		if(stateObj){
			ownerState=father?father.stateObj:(owner?owner.stateObj:null);
			if(cssObj.jaxId){
				this["#self"]=this;
				//添加这个Hud
				jaxEnv.addHashObj("#"+cssObj.jaxId, this);
			}
			if(!stateObj.isJAXHudState) {
				stateObj = jaxHudState(this.jaxEnv, stateObj);
			}
			this.jaxEnv.pushHudState(stateObj);
			this.stateObj=stateObj;
			this.stateObj_=stateObj;
			stateObj.setupState(this,ownerState,this.hudView);
			if(cssObj.jaxId){
				//添加这个State对象
				jaxEnv.addHashObj("%"+cssObj.jaxId, stateObj);
			}
		}else{
			this.stateObj=this.jaxEnv.getCurHudState();
		}
	};

	//---------------------------------------------------------------
	//ApplyCSS的最后，设置WebObj属性:
	__Proto.postApplyCSS = function (cssObj)
	{
		let list;
		list=this.items2Add_;
		if(Array.isArray(list)){
			this._applyItems(list);
		}
		{
			let hudPose, aniPose;
			hudPose = this.hudPose;
			aniPose = this.aniPose;
			aniPose.x = 0;
			aniPose.y = 0;
			aniPose.alpha = hudPose.alpha;
			aniPose.scale = hudPose.scale;
			aniPose.rot = hudPose.rot;
		}
		if(cssObj.face){
			this.showFace(cssObj.face);
		}
		this._syncWebObj();
		this._syncWebObjAttr();

		let stateObj=this.stateObj_;
		if(stateObj){
			this.jaxEnv.popHudState(stateObj);
		}
	};

	//---------------------------------------------------------------
	//更新控件内容
	__Proto.update=function()
	{
		let webObj;
		let x,y,aniPose,hudPose;

		hudPose=this.hudPose;
		aniPose=this.aniPose;
		aniPose.x=0;
		aniPose.y=0;
		aniPose.alpha=hudPose.alpha;
		aniPose.scale=hudPose.scale;
		aniPose.rot=hudPose.rot;

		webObj=this.webObj;
		if(webObj) {
			if(this.attrChanged){
				this._syncWebObjAttr();
			}
			if(this.poseChanged) {
				this._syncWebObj();
			}
		}
	};
}

export {JAXHudGroup};