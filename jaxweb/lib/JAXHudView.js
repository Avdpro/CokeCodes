import {JAXEnv,$JXV,$V} from "./JAXEnv.js";
import {JAXHudObj} from "./JAXHudObj.js";
import {jaxHudState} from "./JAXHudState.js";

var JAXHudView,__Proto;

JAXHudView=function(jaxEnv)
{
	var statesInView=[];
	var viewOnline=1;
	var ownerView=null;
	var allowValNotify=true;
	var self=this;

	var updateStates;

	if(!jaxEnv){
		return;
	}
	JAXHudObj.call(this,jaxEnv);

	self.isJAXHudView=true;

	//***********************************************************************
	//属性/数据链接相关
	//***********************************************************************
	{
		//-------------------------------------------------------------------
		//当前View是否允许valNotify
		Object.defineProperty(this,"allowValNotify",{
			get:function(){
				var view,ownerView;
				if(!allowValNotify)
					return false;
				ownerView=this.ownerView;
				return ownerView?ownerView.allowValNotify:true;
			},
			set:function(v){
				v=v?true:false;
				if(v!==allowValNotify){
					allowValNotify=v;
					if(v && self.stateObj){
						self.stateObj.update();
					}
				}
			}
		});

		//-------------------------------------------------------------------
		//增加View绑定的HudState
		this.addHudState=function(state){
			statesInView.push(state);
		};

		//-------------------------------------------------------------------
		//更新当前View下面的全部链接
		this.updateStates=updateStates=function(){
			var state;
			for(state of statesInView){
				state.updateState();
			}
		};
	}
};

__Proto=JAXHudView.prototype=new JAXHudObj();

//***************************************************************************
//属性列表/注册创建函数:
//***************************************************************************
{
	//CSS属性列表
	JAXHudView.jaxPptSet=new Set(Array.from(JAXHudObj.jaxPptSet).concat([
		'allowValNotify'
	]));

	//---------------------------------------------------------------------------
	//注册基础Hud类
	JAXHudObj.regHudByType('view', function (env) {
		return new JAXHudView(env);
	});
}

//***************************************************************************
//可继承的成员函数:
//***************************************************************************
{
	//---------------------------------------------------------------
	//ApplyCSS的最后，创建WebObj:
	__Proto.preApplyCSS = function (cssObj) {
		var div, father, self,stateObj;
		let jaxEnv=this.jaxEnv;

		let owner,ownerState;
		father = this.father;
		owner = this.owner;

		this.removeAllChildren();
		if (!this.webObj) {
			div = this.webObj = document.createElement('div');
			div.style.position = cssObj.position||"absolute";
			father = this.father;
			if (father && father.webObj) {
				father.webObj.appendChild(div);
			}
			div.jaxObj = this;
		}
		if (cssObj.faces) {
			cssObj.jaxObjHash = 1;
		}
		if(cssObj.jaxId){
			this["#self"]=this;
			//添加这个Hud
			jaxEnv.addHashObj("#"+cssObj.jaxId, this);
		}
		this.jaxEnv.pushHudView(this);
		//确定StateObj:
		stateObj=cssObj.hudState;
		if(stateObj){
			ownerState=father?father.stateObj:(owner?owner.stateObj:null);
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
	//ApplyCSS把pptList赋值后
	__Proto.finApplyCSS = function (cssObj) {
		var self = this;
		if (this.webObj) {
			this.webObj.id = this.id;
		}
		this.items2Add_ = cssObj.items;
	};

	//---------------------------------------------------------------
	//ApplyCSS的最后，设置WebObj属性:
	__Proto.postApplyCSS = function (cssObj) {
		let list;
		list = this.items2Add_;
		if (Array.isArray(list)) {
			this._applyItems(list);
		}
		this.items2Add_ = null;

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

		let stateObj=this.stateObj_;
		if(stateObj){
			this.jaxEnv.popHudState(stateObj);
		}
		// if(cssObj.jaxObjHash){
		// 	this.jaxEnv.popObjHasher(this);
		// }

		this.jaxEnv.popHudView(this);
	};
}

export {JAXHudView};