import {JAXEnv,$JXV} from "./JAXEnv.js";
import {JAXHudObj} from "./JAXHudObj.js";
import {jaxHudState} from "./JAXHudState.js";

var JAXHudBox,__Proto;

__Proto=new JAXHudObj();

JAXHudBox=function(jaxEnv)
{
	var colorBox,colorBorder;
	var border,borderStyle,coner,coners;
	var shadowObj,pxShadow;
	var _attrChanged;
	var signUpdate;
	var gradient,curGradient;

	JAXHudObj.call(this,jaxEnv);

	var valJXVMap,hudView;
	valJXVMap=this.$valJXVMap;
	hudView=this.hudView;

	this.jaxClassFunc=JAXHudBox;

	signUpdate=this.signUpdate;

	colorBox=[128,128,128,255];
	colorBorder=[0,0,0,1];
	border=0;
	borderStyle=0;//0:Solid, 1:dashed, 2:dotted, 3:outset...
	coner=0;
	coners=null;
	_attrChanged=0;
	shadowObj={use:0,x:2,y:2,blur:3,spread:0,color:[0,0,0,0.5]};
	gradient=null;
	curGradient=null;

	Object.defineProperty(this,'attrChanged',{
		get:function(){return _attrChanged;},
		set:function(v){_attrChanged=1;},
		enumerable:false
	});

	//***********************************************************************
	//CSS属性:
	//***********************************************************************
	{
		//填充颜色:
		Object.defineProperty(this, 'color', {
			get: function () {
				return colorBox;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('color');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('color');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'color', hudView);
						valJXVMap.set('color', v);
					}
					v=v.val;
				}
				if (Array.isArray(v)) {
					colorBox[0] = v[0];
					colorBox[1] = v[1];
					colorBox[2] = v[2];
					colorBox[3] = v[3];
				} else if (typeof (v) === 'string') {
					[colorBox[0],colorBox[1],colorBox[2],colorBox[3]]=JAXEnv.parseColor(v);
				} else if (typeof (v) === 'number') {
					//TODO: 支持0xFFDDFFAA:
				}
				_attrChanged = 1;
				signUpdate();
			},
			enumerable: true
		});

		//边框尺寸:
		Object.defineProperty(this, 'border', {
			get: function () {
				return border;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('border');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('border');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'border', hudView);
						valJXVMap.set('border', v);
					}
					v=v.val;
				}
				if (v!==border) {
					border=v;
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		//边框样式:
		Object.defineProperty(this, 'borderStyle', {
			get: function () {
				return borderStyle;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('borderStyle');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('borderStyle');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'borderStyle', hudView);
						valJXVMap.set('borderStyle', v);
					}
					v=v.val;
				}
				if (v!==borderStyle) {
					borderStyle=v;
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		//边框颜色:
		Object.defineProperty(this, 'borderColor', {
			get: function () {
				return colorBorder;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('borderColor');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('borderColor');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'borderColor', hudView);
						valJXVMap.set('borderColor', v);
					}
					v=v.val;
				}
				if (Array.isArray(v)) {
					colorBorder[0] = v[0];
					colorBorder[1] = v[1];
					colorBorder[2] = v[2];
					colorBorder[3] = v[3];
				} else if (typeof (v) === 'string') {
					[colorBorder[0],colorBorder[1],colorBorder[2],colorBorder[3]]=JAXEnv.parseColor(v);
				} else if (typeof (v) === 'number') {
					//TODO: 支持0xAARRGGBB模式:
				}
				_attrChanged = 1;
				signUpdate();
			},
			enumerable: true
		});

		//圆角尺寸:
		Object.defineProperty(this, 'coner', {
			get: function () {
				return coner;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('coner');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('coner');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'coner', hudView);
						valJXVMap.set('coner', v);
					}
					v=v.val;
				}
				if (v!==coner) {
					coner=v;
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		//分别指定的圆角尺寸:
		Object.defineProperty(this, 'coners', {
			get: function () {
				return coners;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('coner');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('coner');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'coner', hudView);
						valJXVMap.set('coner', v);
					}
					v=v.val;
				}
				if (v!==coners) {
					coners=v;
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		//影子的Proxy定义:
		pxShadow=new Proxy(this.chdHudList_,{
			get:function(obj,pName){
				if(pName in shadowObj){
					return shadowObj[pName];
				}
				return undefined;
			},
			set:function(obj,pName,v){
				if(pName in shadowObj) {
					let oldV;
					oldV=shadowObj[pName];
					if(v!==oldV){
						shadowObj[pName]=v;
						_attrChanged = 1;
						signUpdate();
					}
				}
				return true;
			}
		});

		//影子的属性定义:
		Object.defineProperty(this, 'shadow', {
			get:function(){
				return pxShadow;
			},
			set:function(v){
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('shadow');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('shadow');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'shadow', hudView);
						valJXVMap.set('shadow', v);
					}
					v=v.val;
				}
				if(typeof(v)==="object"){
					let attr;
					for(attr in v){
						pxShadow[attr]=v[attr];
					}
					if(! ("use" in v)){
						pxShadow.use=1;
					}
				}else{
					v=v?1:0;
					if(shadowObj.use!==v) {
						shadowObj.use = v ? 1 : 0;
						_attrChanged = 1;
						signUpdate();
					}
				}
			}
		});

		//影子X位移:
		Object.defineProperty(this, 'shadowX', {
			get:function(){
				return pxShadow;
			},
			set:function(v){
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('shadowX');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('shadowX');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'shadowX', hudView);
						valJXVMap.set('shadowX', v);
					}
					v=v.val;
				}
				if(shadowObj.x!==v) {
					shadowObj.x = v;
					_attrChanged = 1;
					signUpdate();
				}
			}
		});

		//影子Y位移:
		Object.defineProperty(this, 'shadowY', {
			get:function(){
				return pxShadow;
			},
			set:function(v){
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('shadowY');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('shadowY');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'shadowY', hudView);
						valJXVMap.set('shadowY', v);
					}
					v=v.val;
				}
				if(shadowObj.y!==v) {
					shadowObj.y = v;
					_attrChanged = 1;
					signUpdate();
				}
			}
		});

		//影子Blur模糊:
		Object.defineProperty(this, 'shadowBlur', {
			get:function(){
				return pxShadow;
			},
			set:function(v){
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('shadowBlur');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('shadowBlur');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'shadowBlur', hudView);
						valJXVMap.set('shadowBlur', v);
					}
					v=v.val;
				}
				if(shadowObj.blur!==v) {
					shadowObj.blur = v;
					_attrChanged = 1;
					signUpdate();
				}
			}
		});

		//影子Spread扩散:
		Object.defineProperty(this, 'shadowSpread', {
			get:function(){
				return pxShadow;
			},
			set:function(v){
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('shadowSpread');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('shadowSpread');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'shadowSpread', hudView);
						valJXVMap.set('shadowSpread', v);
					}
					v=v.val;
				}
				if(shadowObj.spread!==v) {
					shadowObj.spread = v;
					_attrChanged = 1;
					signUpdate();
				}
			}
		});

		//影子颜色:
		Object.defineProperty(this, 'shadowColor', {
			get:function(){
				return pxShadow;
			},
			set:function(v){
				let color=shadowObj.color;
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('shadowColor');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('shadowColor');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'shadowColor', hudView);
						valJXVMap.set('shadowColor', v);
					}
					v=v.val;
				}
				if(Array.isArray(v)) {
					color[0] = v[0];
					color[1] = v[1];
					color[2] = v[2];
					color[3] = v[3];
					_attrChanged = 1;
					signUpdate();
				}else if(typeof(v)==="string"){
					[color[0],color[1],color[2],color[3]]=JAXEnv.parseColor(v);
				}
			}
		});

		//渐变填充:
		Object.defineProperty(this, 'gradient', {
			get: function () {
				return gradient;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('gradient');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('gradient');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'gradient', hudView);
						valJXVMap.set('gradient', v);
					}
					v=v.val;
				}
				if (v!==gradient) {
					gradient=v;
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		//控件客户区域宽度
		Object.defineProperty(this, 'clientW', {
			get: function () {
				return this.size[0]-border*2;
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
				return this.size[1]-border*2;
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
				//关于渐变的:
				if(curGradient!==gradient){
					if(gradient) {
						style.background = gradient ? gradient : "";
						curGradient = gradient;
					}
				}
				if(!curGradient){
					style.backgroundColor = "rgba(" + colorBox + ")";
				}
				if(coners){
					//style.borderRadius = "" + coner[0]+"px";
					style.borderRadius = '${coners[0]}px ${coners[1]}px ${coners[2]}px ${coners[3]}px';
				}else {
					style.borderRadius = "" + coner + "px";
				}
				switch(borderStyle){
					case 0:
					default:
						style.borderStyle="solid";
						break;
					case 1:
						style.borderStyle="dashed";
						break;
					case 2:
						style.borderStyle="dotted";
						break;
				}
				style.borderWidth=""+border+"px";
				style.borderColor="RGBA("+colorBorder+")";

				//关于影子的:
				if(shadowObj.use){
					style.boxShadow=""+shadowObj.x+"px "+shadowObj.y+"px "+shadowObj.blur+"px "+shadowObj.spread+"px rgba("+shadowObj.color[0]+", "+shadowObj.color[1]+", "+shadowObj.color[2]+", "+shadowObj.color[3]+")";
				}else{
					style.boxShadow="none";
				}
			}
			_attrChanged=0;
		}
	}
};

JAXHudBox.prototype=__Proto;

//***************************************************************************
//属性列表/注册创建函数:
//***************************************************************************
{
	//CSS属性列表
	JAXHudBox.jaxPptSet=new Set(Array.from(JAXHudObj.jaxPptSet).concat([
		'color','border','borderStyle','borderColor','coner','coners',
		'shadow','shadowX','shadowY','shadowBlur','shadowSpread','shadowColor',
		'gradient'
	]));

	//---------------------------------------------------------------------------
	//注册基础Hud类
	JAXHudObj.regHudByType('box', function (env) {
		return new JAXHudBox(env);
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
			div.style.position = cssObj.position||"absolute";
			father = this.father;
			if (father && father.webObj) {
				father.webObj.appendChild(div);
			}
			div.style.boxSizing="border-box";
			div.jaxObj = this;
		}
		if(cssObj.faces){
			cssObj.jaxObjHash=1;
		}
		if(cssObj.jaxId){
			this["#self"]=this;
			//添加这个Hud
			jaxEnv.addHashObj("#"+cssObj.jaxId, this);
		}
		//确定StateObj:
		var stateObj=cssObj.hudState;
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
		// if(cssObj.jaxObjHash){
		// 	this.jaxEnv.popObjHasher(this);
		// }
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

export {JAXHudBox};