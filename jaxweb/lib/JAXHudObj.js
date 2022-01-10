import {JAXEnv,$JXV} from "./JAXEnv.js";
import {JAXAni} from "./JAXAni.js";
import {JAXApp} from "./JAXApp.js";
import {jaxHudState} from "./JAXHudState.js";

var JAXHudObj,__Proto;


//---------------------------------------------------------------------------
//阻止消息传递的函数:
var StopEventFunc=function(e)
{
	e.stopPropagation();
	e.preventDefault();
};

__Proto={};
//---------------------------------------------------------------------------
//JAX的Hud控件基类
JAXHudObj=function(jaxEnv)
{
	var self,valJXVMap;
	var signUpdate_,signUpdate,isSignedUpdate;
	var jaxId,position,pos,size,autoLayout;
	var display,uiEvent,id,jaxObjHash,anchorH,anchorV,clip;
	var layoutXFunc_,layoutYFunc_,layoutWFunc_,layoutHFunc_;
	var oldW,oldH;
	var hudPose,aniPose,_poseChanged;
	var refCount,pxChdList;
	var grayScale;
	var curFaceVO,curFace,facesVO;
	var hudView;
	var attach;
	var cursor;

	if(!jaxEnv){
		return;
	}

	this.jaxClassFunc=JAXHudObj;

	self=this;
	jaxId="";
	jaxObjHash=null;

	valJXVMap=new Map();
	this.$valJXVMap=valJXVMap;

	id="";
	position="absolute";
	pos=[0,0,0];
	size=[0,0,0];
	this.jaxAcceptMsg=1;

	isSignedUpdate=0;
	signUpdate_=jaxEnv.signUpdate.bind(jaxEnv,this);
	signUpdate=function(){
		if(!isSignedUpdate){
			signUpdate_();
			isSignedUpdate=1;
		}
	};
	this.signUpdate=signUpdate;

	autoLayout=0;

	attach=1;

	layoutXFunc_=null;
	layoutYFunc_=null;
	layoutWFunc_=null;
	layoutHFunc_=null;
	oldW=0;
	oldH=0;

	display=1;
	uiEvent=1;
	anchorH=0;
	anchorV=0;
	grayScale=0;
	clip=0;
	_poseChanged=0;
	hudPose={scale:1,alpha:1,rot:0};
	aniPose={x:0,y:0,scale:1,alpha:1,rot:0};
	cursor="auto";

	curFaceVO=null;
	curFace="";
	facesVO=null;

	refCount=1;


	this.jaxEnv=jaxEnv;
	this.webObj=null;		//对应的HTML节点
	this.app=jaxEnv.app;
	this.anis=[];
	this.items2Add_=null;
	this.isJAXHudObj_=1;

	//消息相关变量:
	this.OnClickFunc_=null;
	this.OnTreeClickFunc_=null;
	this.OnScrollFunc_=null;
	this.OnLayoutFunc_=null;
	this.OnMouseInOutFunc_=null;

	//不枚举的属性:
	Object.defineProperty(this, 'isJAXHudObj_', {enumerable:false,writable:false});
	Object.defineProperty(this, 'jgxEnv', {enumerable:false,writable:false});
	Object.defineProperty(this, 'webObj', {enumerable:false,writable:true});
	Object.defineProperty(this, 'app', {enumerable:false,writable:false});
	Object.defineProperty(this, 'father_', {enumerable:false,writable:true});
	Object.defineProperty(this, 'owner_', {enumerable:false,writable:true});
	Object.defineProperty(this, 'chdHudList_', {enumerable:false,writable:true});
	Object.defineProperty(this, 'anis', {enumerable:false,writable:false});
	Object.defineProperty(this, 'aniPose', {
		value:aniPose,
		enumerable:false,writable:false
	});
	Object.defineProperty(this, 'hudPose', {
		value:hudPose,
		enumerable:false,writable:false
	});
	Object.defineProperty(this, 'poseChanged', {
		get:function(){return _poseChanged;},
		set:function(v){_poseChanged=v;},
		enumerable:false
	});


	this.father_=null;
	this.owner_=null;
	this.chdHudList_=[];

	pxChdList=new Proxy(this.chdHudList_,{
		get:function(obj,pName){
			if(pName>=0 && pName<obj.length){
				return obj[pName];
			}else if(pName==='length'){
				return obj.length
			}
			return undefined;
		},
		set:function(obj,pName,v){}
	});

	//***********************************************************************
	//控件CSS控制属性
	//***********************************************************************
	{
		//-------------------------------------------------------------------
		//ID/名称/索引等:
		{
			//控件jaxID快查表，这个用来
			Object.defineProperty(this, 'jaxObjHash', {
				get: function () {
					return this.jaxId;
				},
				set: function (v) {
					if (v) {
						jaxObjHash = typeof (v) === 'object' ? v : this;
						jaxEnv.pushObjHasher(jaxObjHash);
					}
				},
				enumerable: true,
			});

			//控件jaxID，这个用来
			Object.defineProperty(this, 'jaxId', {
				get: function () {
					return jaxId;
				},
				set: function (v) {
					jaxId = v;
					jaxEnv.addHashObj("#"+v, this);
				},
				enumerable: true,
			});

			//控件ID，随时同步
			Object.defineProperty(this, 'id', {
				get: function () {
					return id;
				},
				set: function (v) {
					if(v instanceof $JXV){
						let oldV;
						oldV = valJXVMap.get('id');
						if (oldV) {
							oldV.untrace();
							valJXVMap.delete('id');
						}
						if(v.traces!==0) {
							v.trace(this.stateObj, this, 'id', hudView);
							valJXVMap.set('id', v);
						}
						v=v.val;
					}
					if (id !== v) {
						id = v;
						if (this.webObj) {
							this.webObj.id = id;
						}
						if(v){
							jaxEnv.addHashObj("" + v, this);
						}
					}
				},
				enumerable: true,
			});
		}

		//-------------------------------------------------------------------
		//尺寸/坐标/对齐:
		{
			//Position:
			Object.defineProperty(this,'position',{
				get:function(){
					return position;
				},
				set:function(v){
					if(v!==position){
						let webObj;
						position=v;
						webObj=self.webObj;
						if(webObj){
							webObj.style.position=v;
						}
					}
				},
				enumerable: true,
				configurable:true
			});
			//控件是否自动排版
			Object.defineProperty(this, 'autoLayout', {
				get:function(){
					return autoLayout
				},
				set:function(v){
					if(v instanceof $JXV){
						let oldV;
						oldV = valJXVMap.get('autoLayout');
						if (oldV) {
							oldV.untrace();
							valJXVMap.delete('autoLayout');
						}
						if(v.traces!==0) {
							v.trace(this.stateObj, this, 'autoLayout', hudView);
							valJXVMap.set('autoLayout', v);
						}
						v=v.val;
					}
					if(v!==autoLayout){
						autoLayout=v;
						if(v){
							this._doLayout();
						}
					}
				},
				enumerable: true
			});

			//控件的坐标，为了性能未必和真实Web元素一样，在一次Update之后才能同步
			Object.defineProperty(this, 'pos', {
				value: pos,
				writable: false,
				enumerable: false
			});

			//控件的尺寸，为了性能未必和真实Web元素一样，在一次Update之后才能同步
			Object.defineProperty(this, 'size', {
				value: size,
				writable: false,
				enumerable: false
			});

			//控件宽度
			Object.defineProperty(this, 'w', {
				get: function () {
					return this.size[0];
				},
				set: function (v) {
					if(v instanceof $JXV){
						let oldV;
						oldV = valJXVMap.get('w');
						if (oldV) {
							oldV.untrace();
							valJXVMap.delete('w');
						}
						if(v.traces!==0) {
							v.trace(this.stateObj, this, 'w', hudView);
							valJXVMap.set('w', v);
						}
						v=v.val;
					}
					if(typeof(v)==="string"){
						var func,father;
						func=new Function("FW","FH","return ("+v+")");
						father=this.father_||this.owner_;
						layoutWFunc_=func;
						if(father) {
							v = func(father.clientW, father.clientH);
							if (size[0] !== v) {
								size[0] = v;
								_poseChanged = 1;
								signUpdate();
							}
						}
					}else{
						if (size[0] !== v) {
							size[0] = v;
							_poseChanged = 1;
							layoutWFunc_=null;
							signUpdate();
						}
					}
				},
				enumerable: true,
				configurable:true
			});

			//控件高度
			Object.defineProperty(this, 'h', {
				get: function () {
					return this.size[1];
				},
				set: function (v) {
					if(v instanceof $JXV){
						let oldV;
						oldV = valJXVMap.get('h');
						if (oldV) {
							oldV.untrace();
							valJXVMap.delete('h');
						}
						if(v.traces!==0) {
							v.trace(this.stateObj, this, 'h', hudView);
							valJXVMap.set('h', v);
						}
						v=v.val;
					}
					if(typeof(v)==="string"){
						var func,father;
						func=new Function("FW","FH","return ("+v+")");
						father=this.father_||this.owner_;
						layoutHFunc_=func;
						if(father) {
							v = func(father.clientW, father.clientH);
							if (size[1] !== v) {
								size[1] = v;
								_poseChanged = 1;
								signUpdate();
							}
						}
					}else{
						if (size[1] !== v) {
							size[1] = v;
							_poseChanged = 1;
							signUpdate();
						}
					}
				},
				enumerable: true,
				configurable:true
			});

			//控件X坐标
			Object.defineProperty(this, 'x', {
				get: function () {
					return this.pos[0];
				},
				set: function (v) {
					if(v instanceof $JXV){
						let oldV;
						oldV = valJXVMap.get('x');
						if (oldV) {
							oldV.untrace();
							valJXVMap.delete('x');
						}
						if(v.traces!==0) {
							v.trace(this.stateObj, this, 'x', hudView);
							valJXVMap.set('x', v);
						}
						v=v.val;
					}
					if(typeof(v)==="string"){
						var func,father;
						func=new Function("FW","FH","return ("+v+")");
						father=this.father_||this.owner_;
						layoutXFunc_=func;
						if(father) {
							v = func(father.clientW, father.clientH);
							if (pos[0] !== v) {
								pos[0] = v;
								_poseChanged = 1;
								signUpdate();
							}
						}
					}else{
						if (v !== pos[0]) {
							pos[0] = v;
							_poseChanged = 1;
							signUpdate();
						}
					}
				},
				enumerable: true,
				configurable:true
			});

			//控件Y坐标
			Object.defineProperty(this, 'y', {
				get: function () {
					return this.pos[1];
				},
				set: function (v) {
					if(v instanceof $JXV){
						let oldV;
						oldV = valJXVMap.get('y');
						if (oldV) {
							oldV.untrace();
							valJXVMap.delete('y');
						}
						if(v.traces!==0) {
							v.trace(this.stateObj, this, 'y', hudView);
							valJXVMap.set('y', v);
						}
						v=v.val;
					}
					if(typeof(v)==="string"){
						var func,father;
						func=new Function("FW","FH","return ("+v+")");
						father=this.father_||this.owner;
						layoutYFunc_=func;
						if(father) {
							v = func(father.clientW, father.clientH);
							if (pos[1] !== v) {
								pos[1] = v;
								_poseChanged = 1;
								signUpdate();
							}
						}
					}else{
						if (v !== pos[1]) {
							pos[1] = v;
							_poseChanged = 1;
							signUpdate();
						}
					}
				},
				enumerable: true,
				configurable:true
			});

			//Z-Index:
			Object.defineProperty(this, 'zIndex', {
				get: function () {
					return this.pos[1];
				},
				set: function (v) {
					if(v instanceof $JXV){
						let oldV;
						oldV = valJXVMap.get('zIndex');
						if (oldV) {
							oldV.untrace();
							valJXVMap.delete('zIndex');
						}
						if(v.traces!==0) {
							v.trace(this.stateObj, this, 'zIndex', hudView);
							valJXVMap.set('zIndex', v);
						}
						v=v.val;
					}
					if(this.webObj){
						this.webObj.style.zIndex=""+v;
					}
				},
				enumerable: true
			});

			//控件X方向锚点位置
			Object.defineProperty(this, 'anchorH', {
				get: function () {
					return anchorH;
				},
				set: function (v) {
					if(v instanceof $JXV){
						let oldV;
						oldV = valJXVMap.get('anchorH');
						if (oldV) {
							oldV.untrace();
							valJXVMap.delete('anchorH');
						}
						if(v.traces!==0) {
							v.trace(this.stateObj, this, 'anchorH', hudView);
							valJXVMap.set('anchorH', v);
						}
						v=v.val;
					}
					if (v !== anchorH) {
						anchorH = v;
						_poseChanged = 1;
						signUpdate();
					}
				},
				enumerable: true,
				configurable:true
			});

			//控件Y方向锚点位置
			Object.defineProperty(this, 'anchorV', {
				get: function () {
					return anchorV;
				},
				set: function (v) {
					if(v instanceof $JXV){
						let oldV;
						oldV = valJXVMap.get('anchorV');
						if (oldV) {
							oldV.untrace();
							valJXVMap.delete('anchorV');
						}
						if(v.traces!==0) {
							v.trace(this.stateObj, this, 'anchorV', hudView);
							valJXVMap.set('anchorV', v);
						}
						v=v.val;
					}
					if (v !== anchorV) {
						anchorV = v;
						_poseChanged = 1;
						signUpdate();
					}
				},
				enumerable: true,
				configurable:true
			});

			//控件客户区域宽度
			Object.defineProperty(this, 'clientW', {
				get: function () {
					return this.size[0];
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
					return this.size[1];
				},
				set: function (v) {
					return v;
				},
				enumerable: true,
				configurable:true
			});

			//计算出的宽度W:
			Object.defineProperty(this,'ofW',{
				set:function(v){
					var func,father;
					func=new Function("FW","FH","return ("+v+")");
					father=this.father;
					father=father?father:this.owner;
					layoutWFunc_=func;
					this.w=func(father.clientW,father.clientH);
				},
				enumerable: false
			});

			//计算出的高度H:
			Object.defineProperty(this,'ofH',{
				set:function(v){
					var func,father;
					func=new Function("FW","FH","return ("+v+")");
					father=this.father;
					father=father?father:this.owner;
					layoutHFunc_=func;
					this.h=func(father.clientW,father.clientH);
				},
				enumerable: false
			});

			//计算出的X:
			Object.defineProperty(this,'ofX',{
				set:function(v){
					var func,father;
					func=new Function("FW","FH","return ("+v+")");
					father=this.father;
					father=father?father:this.owner;
					layoutXFunc_=func;
					this.x=func(father.clientW,father.clientH);
				},
				enumerable: false
			});

			//计算出的Y:
			Object.defineProperty(this,'ofY',{
				set:function(v){
					var func,father;
					func=new Function("FW","FH","return ("+v+")");
					father=this.father;
					father=father?father:this.owner;
					layoutYFunc_=func;
					this.y=func(father.clientW,father.clientH);
				},
				enumerable: false
			});

			//重新排版的回调:
			Object.defineProperty(this, 'OnLayout', {
				get: function () {
					return this.OnLayoutFunc_;
				},
				set: function (v) {
					var self=this;
					if (this.OnLayoutFunc_ !== v) {
						this.OnLayoutFunc_ = v;
					}
				},
				enumerable: true,
				configurable:true,
			});

		}

		//-------------------------------------------------------------------
		//可见/剪裁/颜色/放缩:
		{
			//控件是否可见，在一次Update之后才能同步
			Object.defineProperty(this, 'display', {
				get: function () {
					return display;
				},
				set: function (v) {
					if(v instanceof $JXV){
						let oldV;
						oldV = valJXVMap.get('display');
						if (oldV) {
							oldV.untrace();
							valJXVMap.delete('display');
						}
						if(v.traces!==0) {
							v.trace(this.stateObj, this, 'display', hudView);
							valJXVMap.set('display', v);
						}
						v=v.val;
					}
					if (display !== v) {
						display = v;
						_poseChanged=1;
						signUpdate();
					}
				},
				enumerable: true,
				configurable:true,
			});

			//控件是否裁剪子控件:
			Object.defineProperty(this, 'clip', {
				get: function () {
					return clip;
				},
				set: function (v) {
					if(v instanceof $JXV){
						let oldV;
						oldV = valJXVMap.get('clip');
						if (oldV) {
							oldV.untrace();
							valJXVMap.delete('clip');
						}
						if(v.traces!==0) {
							v.trace(this.stateObj, this, 'clip', hudView);
							valJXVMap.set('clip', v);
						}
						v=v.val;
					}
					if (clip !== v) {
						clip = v?1:0;
						if(this.webObj) {
							if (clip) {
								this.webObj.style.overflow="hidden";
							}else{
								this.webObj.style.overflow="visible";
							}
						}
					}
				},
				enumerable: true,
				configurable:true,
			});

			//控件的透明度
			Object.defineProperty(this,'alpha',{
				get:function(){
					return hudPose.alpha;
				},
				set:function(v){
					if(v instanceof $JXV){
						let oldV;
						oldV = valJXVMap.get('alpha');
						if (oldV) {
							oldV.untrace();
							valJXVMap.delete('alpha');
						}
						if(v.traces!==0) {
							v.trace(this.stateObj, this, 'alpha', hudView);
							valJXVMap.set('alpha', v);
						}
						v=v.val;
					}
					if(v===hudPose.alpha){
						return;
					}
					hudPose.alpha=v;
					_poseChanged=1;
					signUpdate();
				},
				configurable:true,
				enumerable:true
			});

			//控件的放缩
			Object.defineProperty(this,'scale',{
				get:function(){
					return hudPose.scale;
				},
				set:function(v){
					if(v instanceof $JXV){
						let oldV;
						oldV = valJXVMap.get('scale');
						if (oldV) {
							oldV.untrace();
							valJXVMap.delete('scale');
						}
						if(v.traces!==0) {
							v.trace(this.stateObj, this, 'scale', hudView);
							valJXVMap.set('scale', v);
						}
						v=v.val;
					}
					if(v===hudPose.scale){
						return;
					}
					hudPose.scale=v;
					_poseChanged=1;
					signUpdate();
				},
				configurable:true,
				enumerable:true
			});

			//控件的旋转:
			Object.defineProperty(this,'rotate',{
				get:function(){
					return hudPose.rot;
				},
				set:function(v){
					if(v instanceof $JXV){
						let oldV;
						oldV = valJXVMap.get('rotate');
						if (oldV) {
							oldV.untrace();
							valJXVMap.delete('rotate');
						}
						if(v.traces!==0) {
							v.trace(this.stateObj, this, 'rotate', hudView);
							valJXVMap.set('rotate', v);
						}
						v=v.val;
					}
					if(v===hudPose.rot){
						return;
					}
					hudPose.rot=v;
					_poseChanged=1;
					signUpdate();
				},
				configurable:true,
				enumerable:true
			});

			//控件灰度化
			Object.defineProperty(this,'grayScale',{
				get:function(){
					return grayScale;
				},
				set:function(v){
					if(v instanceof $JXV){
						let oldV;
						oldV = valJXVMap.get('grayScale');
						if (oldV) {
							oldV.untrace();
							valJXVMap.delete('grayScale');
						}
						if(v.traces!==0) {
							v.trace(this.stateObj, this, 'grayScale', hudView);
							valJXVMap.set('grayScale', v);
						}
						v=v.val;
					}
					v=v?1:0;
					if(v===grayScale){
						return;
					}
					grayScale=v;
					_poseChanged=1;
					signUpdate();
				},
				configurable:true,
				enumerable:true
			});

			//控件光标:
			Object.defineProperty(this, 'cursor', {
				get: function () {
					return cursor;
				},
				set: function (v) {
					if(v instanceof $JXV){
						let oldV;
						oldV = valJXVMap.get('clip');
						if (oldV) {
							oldV.untrace();
							valJXVMap.delete('clip');
						}
						if(v.traces!==0) {
							v.trace(this.stateObj, this, 'clip', hudView);
							valJXVMap.set('clip', v);
						}
						v=v.val;
					}
					if (cursor !== v) {
						cursor=v;
						if(this.webObj) {
							if (cursor) {
								this.webObj.style.cursor=v;
							}else{
								this.webObj.style.cursor="auto";
							}
						}
					}
				},
				configurable:true,
				enumerable: true,
			});

		}

		//-------------------------------------------------------------------
		//控件树:
		{
			//---------------------------------------------------------------
			//父节点控件:
			Object.defineProperty(this,'father',{
				get:function(){return this.father_;},
				enumerable: false,
			});

			//---------------------------------------------------------------
			//拥有者节点控件:
			Object.defineProperty(this,'owner',{
				get:function(){return this.owner_;},
				enumerable: false,
			});

			//-------------------------------------------------------------------
			//当前控件的上一级View
			Object.defineProperty(this,"ownerView",{
				get:function(){
					var cur,nxt;
					cur=this;
					nxt=cur.father_?cur.father_:cur.owner_;
					while(nxt){
						cur=nxt;
						if(cur.isJAXHudView){
							return cur;
						}
						nxt=cur.father_?cur.father_:cur.owner_;
					}
					return null;
				},
				set:function(v){
				}
			});

			//-------------------------------------------------------------------
			//当前控件的View, 如果当前控件就是HudView，返回当前控件
			Object.defineProperty(this,"hudView",{
				get:function(){
					var cur;
					if(hudView!==undefined){
						return hudView;
					}
					cur=this;
					while(cur){
						if(cur.isJAXHudView){
							hudView=cur;
							return cur;
						}
						cur=cur.father_?cur.father_:cur.owner_;
					}
					return undefined;
				},
				set:function(v){
				}
			});

			//---------------------------------------------------------------
			//第一个子节点节点控件:
			Object.defineProperty(this,'firstChild',{
				get:function(){return this.chdHudList_[0];}
			});

			//---------------------------------------------------------------
			//得到前一个hud
			Object.defineProperty(this,'preHud',{
				get:function(){
					let father,list,idx,pre;
					father=this.father_;
					if(father){
						list=father.chdHudList_;
						idx=list.indexOf(this);
						if(idx>0){
							pre=list[idx-1];
							return pre?pre:null;
						}
					}
					return null;
				}
			});

			//---------------------------------------------------------------
			//得到后一个hud
			Object.defineProperty(this,'nextHud',{
				get:function(){
					let father,list,idx,nxt;
					father=this.father_;
					if(father){
						list=father.chdHudList_;
						idx=list.indexOf(this);
						if(idx>=0){
							nxt=list[idx+1];
							return nxt?nxt:null;
						}
					}
					return null;
				}
			});


			//---------------------------------------------------------------
			//子节点列表控件:
			Object.defineProperty(this,'items',{
				get:function(){
					return pxChdList;
				},
				set:function(list){
				},
				configurable:true
			});

		}

		//-------------------------------------------------------------------
		//交互事件:
		{
			//控件是否阻断UI的消息，在一次Update之后才能同步
			Object.defineProperty(this, 'uiEvent', {
				get: function () {
					return uiEvent;
				},
				set: function (v) {
					if(v instanceof $JXV){
						let oldV;
						oldV = valJXVMap.get('uiEvent');
						if (oldV) {
							oldV.untrace();
							valJXVMap.delete('uiEvent');
						}
						if(v.traces!==0) {
							v.trace(this.stateObj, this, 'uiEvent', hudView);
							valJXVMap.set('uiEvent', v);
						}
						v=v.val;
					}
					if (uiEvent !== v) {
						uiEvent = v;
						if(this.webObj){
							this.webObj.style.pointerEvents=v<0?"none":"auto";
						}
					}
				},
				enumerable: true,
				configurable:true,
			});

			//控件是否阻断UI的消息，在一次Update之后才能同步
			Object.defineProperty(this, 'isGenEvent', {
				get: function () {
					var hud;
					hud=this;
					while(hud){
						if(!(hud.uiEvent>0)){
							return 0;
						}
						hud=hud.father?hud.father:hud.owner;
					}
					return 1;
				},
				enumerable: false,
			});

			//控件的鼠标点击消息:
			Object.defineProperty(this, 'OnClick', {
				get: function () {
					return this.OnClickFunc_;
				},
				set: function (v) {
					var self=this;
					if (this.OnClickFunc_ !== v) {
						this.OnClickFunc_ = v;
						if (this.webObj) {
							this.webObj.onclick = v?function(e){self.OnMouseClick(e);}:null;
						}
					}
				},
				enumerable: true,
				configurable:true,
			});

			//控件的鼠标点击消息:
			Object.defineProperty(this, 'OnTreeClick', {
				get: function () {
					return this.OnTreeClickFunc_;
				},
				set: function (v) {
					var self=this;
					if (this.OnTreeClickFunc_ !== v) {
						this.OnTreeClickFunc_ = v;
						if (this.webObj) {
							this.webObj.onclick = v?function(e){self.OnMouseClick(e);}:null;
						}
					}
				},
				enumerable: true,
				configurable:true,
			});

			let WillCallInOut=0;
			let isMouseIn=0;
			let calledMouseIn=0;

			let CallMouseInOut=function(){
				//console.log("Mouse Call: "+isMouseIn+" vs "+calledMouseIn);
				if(calledMouseIn!==isMouseIn) {
					self.OnMouseInOutFunc_(isMouseIn);
					calledMouseIn=isMouseIn;
				}
				WillCallInOut=0;
			};
			let OnMouseOver=function(e)
			{
				//console.log("Mouse In");
				isMouseIn=1;
				if(!WillCallInOut){
					jaxEnv.callAfter(CallMouseInOut);
					WillCallInOut=1;
				}
			};
			let OnMouseOut=function(e)
			{
				//console.log("Mouse Out");
				isMouseIn=0;
				if(!WillCallInOut){
					jaxEnv.callAfter(CallMouseInOut);
					WillCallInOut=1;
				}
			};

			//控件鼠标移入移出的消息:
			Object.defineProperty(this, 'OnMouseInOut', {
				get: function () {
					return this.OnMouseInOutFunc_;
				},
				set: function (v) {
					var self=this;
					if (this.OnMouseInOutFunc_ !== v) {
						this.OnMouseInOutFunc_ = v;
						if (this.webObj) {
							if(v){
								this.webObj.addEventListener('mouseover', OnMouseOver, true);
								this.webObj.addEventListener('mouseleave', OnMouseOut, true);
							}else{
								this.webObj.removeEventListener('mouseover', OnMouseOver, true);
								this.webObj.removeEventListener('mouseleave', OnMouseOut, true);
							}
						}
					}
				},
				enumerable: true,
				configurable:true,
			});
			//TODO: Code this:
		}

		//-------------------------------------------------------------------
		//Face相关:
		{
			//faces:
			Object.defineProperty(this,'faces',{
				get:function(){
					return facesVO;
				},
				set:function(v){
					if(facesVO){
						throw "Error JAXHudObj's faces can not be reset!";
					}
					facesVO=v;
					return v;
				},
				enumerable:false
			});

			//当前的face:
			Object.defineProperty(self,'face',{
				get:function(){
					return curFace;
				},
				set:function(v){
					self.showFace(v);
					return v;
				},
				enumerable:false
			});
		}
	}

	//***********************************************************************
	//不会被继承的成员函数
	//***********************************************************************
	{
		//-------------------------------------------------------------------
		//生存周期控制:
		{
			//---------------------------------------------------------------
			//增加引用，确保控件不会被提前释放:
			this.hold=function()
			{
				refCount++;
			};

			//---------------------------------------------------------------
			//减少引用，引用为0的时候，删除:
			this.release=function()
			{
				if(refCount>0) {
					refCount--;
					if (refCount === 0) {
						this._free();
					}
				}
			};

			//---------------------------------------------------------------
			//释放资源:
			this._free=function()
			{
				let hud,ani;
				this.freeHud();
				if(this.OnFree){
					this.OnFree();
				}
				for(hud of this.chdHudList_){
					hud.release();
				}
				this.deadOut=1;
				this.chdHudList_.splice(0);
				this.webObj=null;
				//untrace记录的$JXV:
				{
					let list,val;
					list=valJXVMap.values();
					for(val of list){
						val&&val.untrace();
					}
				}
				if(this.stateObj_ && this.stateObj_.freeState){
					this.stateObj_.freeState();
					this.stateObj_=null;
				}
			};

			//---------------------------------------------------------------
			//根据CSS创建WebObj:
			this.applyCSS=function(cssObj)
			{
				JAXEnv.applyCSS(this,cssObj,JAXApp.jgxPptSet);
				if(this.OnCreate){
					this.OnCreate();
				}
				if(this.AfCreate){
					this.jaxEnv.callAfter(this.AfCreate.bind(this));
				}
			};
		}

		//-------------------------------------------------------------------
		//更新/同步WEB控件:
		{
			this._doLayout=function(){
				var owner,ow,oh,func;
				owner=this.father_||this.owner_;
				if(owner){
					ow=owner.clientW;
					oh=owner.clientH;
					if(layoutXFunc_){
						func=layoutXFunc_;
						this.x=layoutXFunc_(ow,oh);
						layoutXFunc_=func;
					}
					if(layoutYFunc_){
						func=layoutYFunc_;
						this.y=layoutYFunc_(ow,oh);
						layoutYFunc_=func;
					}
					if(layoutWFunc_){
						func=layoutWFunc_;
						this.w=layoutWFunc_(ow,oh);
						layoutWFunc_=func;
					}
					if(layoutHFunc_){
						func=layoutHFunc_;
						this.h=layoutHFunc_(ow,oh);
						layoutHFunc_=func;
					}
					if(this.OnLayoutFunc_){
						this.OnLayoutFunc_(ow,oh);
					}
					this.update();
				}
			};

			//---------------------------------------------------------------
			//如果需要更新，那就触发一次更新
			this.maybeUpdate=function()
			{
				if(isSignedUpdate){
					isSignedUpdate=0;
					this.update();
				}
			};

			//---------------------------------------------------------------
			//由JAXEnv调用的更新函数
			this._update=function()
			{
				if(isSignedUpdate) {
					isSignedUpdate = 0;
					this.update();
				}
			};

			//---------------------------------------------------------------
			//更新控件的动画
			this._updateAni=function()
			{
				let anis,ani,i,n,moreUpdate;
				moreUpdate=0;
				anis=this.anis;
				n=anis.length;
				for(i=0;i<n;i++){
					ani=anis[i];
					if(ani.alive){
						ani.update(aniPose);
						_poseChanged=1;
						moreUpdate=1;
					}
				}
				return moreUpdate;
			};

			//---------------------------------------------------------------
			//更新子节点:
			this.updateChildren=function()
			{
				let hud,list;
				list=this.chdHudList_;
				for(hud of list){
					hud.update();
				}
			};

			//---------------------------------------------------------------
			//当控件尺寸发生变化，调用这个函数，在这里什么都不做
			this._sizeChanged=function(){
				self.OnSizeChanged&&self.OnSizeChanged();
			};

			//---------------------------------------------------------------
			//摘除
			this.detach=function(){
				if(attach) {
					attach = 0;
					_poseChanged = 1;
					signUpdate();
				}
			};

			//---------------------------------------------------------------
			//置回:
			this.attach=function(){
				if(!attach) {
					attach = 1;
					_poseChanged = 1;
					signUpdate();
				}
			};

			//---------------------------------------------------------------
			//同步/更新WebObj的位置状态:
			this._syncWebObj=function()
			{
				let webObj,x,y,style;
				webObj=this.webObj;
				style=webObj.style;
				if(webObj && _poseChanged) {
					x=pos[0]+aniPose.x;
					y=pos[1]+aniPose.y;
					switch(anchorH)
					{
						case 0:
						default:
							switch(anchorV)
							{
								case 0:
									style.transformOrigin="left top";
									break;
								case 1:
									style.transformOrigin="left center";
									y-=size[1]*0.5;
									break;
								case 2:
									style.transformOrigin="left bottom";
									y-=size[1];
									break;
							}
							break;
						case 1:
							x-=size[0]*0.5;
							switch(anchorV)
							{
								case 0:
									style.transformOrigin="center top";
									break;
								case 1:
									style.transformOrigin="center center";
									y-=size[1]*0.5;
									break;
								case 2:
									style.transformOrigin="center bottom";
									y-=size[1];
									break;
							}
							break;
						case 2:
							x-=size[0];
							switch(anchorV)
							{
								case 0:
									style.transformOrigin="right top";
									break;
								case 1:
									style.transformOrigin="right center";
									y-=size[1]*0.5;
									break;
								case 2:
									style.transformOrigin="right bottom";
									y-=size[1];
									break;
							}
							break;
					}
					style.left=""+x+"px";
					style.top=""+y+"px";
					style.width=""+size[0]+"px";
					style.height=""+size[1]+"px";
					//style.scale="("+aniPose.scale+")";
					if(aniPose.scale!==1.0){
						if(aniPose.rot!==0){
							style.transform="scale("+aniPose.scale+") rotate("+(aniPose.rot)+"deg)";
						}else{
							style.transform="scale("+aniPose.scale+") rotate(0deg)";
						}
					}else{
						if(aniPose.rot!==0){
							style.transform="rotate("+(aniPose.rot)+"deg)";
						}else{
							style.transform="";
						}
					}
					style.display=(this.display&&attach)?"block":"none";
					style.filter=grayScale?"grayscale(1)":"none";
					style.opacity=""+hudPose.alpha;
					if(size[0]!==oldW || size[1]!==oldH){
						let list,i,n,chd;
						oldW=size[0];
						oldH=size[1];
						list=this.chdHudList_;
						n=list.length;
						for(i=0;i<n;i++){
							chd=list[i];
							if(chd.autoLayout){
								chd._doLayout();
							}
						}
						this._sizeChanged();
						if(this.OnResize){
							this.OnResize();
						}
					}
					_poseChanged=0;
				}
			};
		}

		//-------------------------------------------------------------------
		//控件树:
		{
			//---------------------------------------------------------------
			this._applyItems=function(list)
			{
				let css,hud;
				this.removeAllChildren();
				for(css of list){
					hud=JAXHudObj.createHudByType(css.type,this.jaxEnv,this,css);
					if(hud){
						hud.release();
					}
				}
			};

			//---------------------------------------------------------------
			//通过CSS添加一个新子节点
			this.appendNewChild = function (css)
			{
				let hud=JAXHudObj.createHudByType(css.type,this.jaxEnv,this,css);
				if(hud){
					hud.release();
				}
				signUpdate();
				return hud;
			};

			//---------------------------------------------------------------
			//通过CSS插入一个子节点
			this.insertNewChild = function (css,beforeHud)
			{
				let hud=JAXHudObj.createHudByType(css.type,this.jaxEnv,this,css);
				if(hud){
					if(beforeHud){
						this.removeChild(hud);
						this.insertBefore(hud,beforeHud);
					}
					hud.release();
				}
				signUpdate();
				return hud;
			};


			//---------------------------------------------------------------
			//添加一个子节点
			this.appendChild = function (hud)
			{
				var view;
				if (hud.father_) {
					throw "Error: 控件已有父节点，不能添加至当前节点."
				}
				view=hud.hudView;
				if(view!==undefined && view!==this.hudView && view!==hud){
					throw "Error: 控件不能绑定不同的View."
				}
				hud.father_ = this;
				hud.hold();
				this.chdHudList_.push(hud);
				//Link webObjs:
				if(hud.webObj && this.webObj){
					this.webObj.appendChild(hud.webObj);
				}
				if(hud.autoLayout){
					hud._doLayout();
				}
				signUpdate();
			};

			//-------------------------------------------------------------------
			//添加一个子节点
			this.insertBefore = function (hud, chd)
			{
				let list, i, n;
				if (hud.father_) {
					throw "Error: 控件已有父节点，不能添加至当前节点"
				}
				if (chd.father_ !== this) {
					throw "Error: 控件的父节点不是当前控件，不能插入子节点。"
				}
				list = this.chdHudList_;
				n = list.length;
				findChd:{
					for (i = 0; i < n; i++) {
						if (list[i] === chd) {
							list.splice(i, 0, hud);
							hud.hold();
							break findChd;
						}
					}
				}
				hud.father_ = this;
				//Link webObjs:
				if(hud.webObj && this.webObj && chd.webObj){
					this.webObj.insertBefore(hud.webObj,chd.webObj);
				}
				if(hud.autoLayout){
					hud._doLayout();
				}
				signUpdate();
			};

			//-------------------------------------------------------------------
			//删除一个子节点
			this.removeChild = function (hud)
			{
				let list, i,hudWebObj;
				if (hud.father_ !== this) {
					throw "Error: 控件的父节点不是当前控件，不能删除子节点。"
				}
				hud.father_ = null;
				list = this.chdHudList_;
				i=list.indexOf(hud);
				if(i>=0){
					list.splice(i,1);
					hudWebObj=hud.webObj;
					if(hudWebObj && hudWebObj.parentElement){
						hudWebObj.parentElement.removeChild(hudWebObj);
					}
					//hud.webObj=null;
					/*if(this.webObj && hud.webObj){
						this.webObj.removeChild(hud.webObj);
					}*/
					hud.release();
				}
				signUpdate();
			};

			//-------------------------------------------------------------------
			//查找一个子节点的序号
			this.getChildHudIdx = function (hud2Find) {
				let list,i,n;
				list=this.chdHudList_;
				return list.indexOf(hud2Find);
				/*
				n=list.length;
				for(i=0;i<n;i++){
					if(list[i]===hud2Find){
						return i;
					}
				}
				return -1;*/
			};

			//-------------------------------------------------------------------
			//查找一个子节点
			this.findHudById = function (id2Find)
			{
				let hud, fnd;
				if (id2Find === id) {
					return this;
				}
				let list, i, n;
				list = this.chdHudList_;
				n = list.length;
				for (i = 0; i < n; i++) {
					hud = list[i];
					fnd = hud.findHudById(id2Find);
					if (fnd)
						return fnd;
				}
				return null;
			};

			//-------------------------------------------------------------------
			//查找一个子节点
			this.findObjById = function (id2Find)
			{
				let hud, fnd;
				if (id2Find === id) {
					return this;
				}
				let list, i, n;
				list = this.chdHudList_;
				n = list.length;
				for (i = 0; i < n; i++) {
					hud = list[i];
					fnd = hud.findObjById(id2Find);
					if (fnd)
						return fnd;
				}
				return null;
			};

			//-------------------------------------------------------------------
			//删除全部子节点
			this.removeAllChildren = function ()
			{
				let list, hud,webObj,hudWebObj;
				webObj=this.webObj;
				list = this.chdHudList_;
				for (hud of list) {
					hudWebObj=hud.webObj;
					if(hudWebObj && hudWebObj.parentElement){
						hudWebObj.parentElement.removeChild(hudWebObj);
					}
					//hud.webObj=null;
					/*if(webObj && hudWebObj){
						webObj.removeChild(hudWebObj);
					}*/
					hud.father_=null;
					hud.release();
				}
				list.splice(0);
				signUpdate();
			};

			//-------------------------------------------------------------------
			//在全部子节点（包含subs）里执行一个函数:
			this.execInTree=function(func){
				var list,i,n;
				list=this.chdHudList_;
				n=list.length;
				for(i=0;i<n;i++){
					if(func(list[i])){
						return;
					}
				}
			};
		}

		//-------------------------------------------------------------------
		//坐标转换:
		{
			//---------------------------------------------------------------
			//得到相对于某控件的坐标:
			this.findRelatedPos=function(x,y,hud=null){
				var tgtDiv,curDiv,hudObj,dx,dy,scale;
				tgtDiv=hud?hud.webObj:window.document.body;//this.jaxEnv.jaxDiv;
				curDiv=this.webObj;
				
				if(curDiv.offsetParent){
					let cw,w,h;
					let cRect=curDiv.getBoundingClientRect();
					let tRect=tgtDiv.getBoundingClientRect();
					hudObj=curDiv.jaxObj;
					cw=cRect.width;
					w=size[0];
					h=size[1];
					dx=cRect.x-tRect.x;
					dy=cRect.y-tRect.y;
					switch(hudObj.anchorH){
						case 0:
							break;
						case 1:
							dx+=hudObj.w*0.5;
							break;
						case 2:
							dx+=hudObj.w;
							break;
					}
					switch(hudObj.anchorV){
						case 0:
							break;
						case 1:
							dy+=hudObj.h*0.5;
							break;
						case 2:
							dy+=hudObj.h;
							break;
					}
					return [x+dx,y+dy];
				}
				
				if(curDiv && curDiv!==tgtDiv){
					hudObj=curDiv.jaxObj;
					if(hudObj){
						hudObj.maybeUpdate();
						dx=hudObj.x;
						dy=hudObj.y;
						scale=hudObj.scale;
						x+=dx;
						y+=dy;
					}else{
						dx=curDiv.offsetLeft;
						dy=curDiv.offsetTop;
						x+=dx;
						y+=dy;
					}
					curDiv=curDiv.offsetParent||curDiv.parentNode;
				}
				while(curDiv && curDiv!==tgtDiv){
					hudObj=curDiv.jaxObj;
					if(hudObj){
						hudObj.maybeUpdate();
						scale=hudObj.scale;
						switch(hudObj.anchorH){
							case 0:
								dx=0;
								break;
							case 1:
								dx=-hudObj.w*0.5;
								break;
							case 2:
								dx=-hudObj.w;
								break;
						}
						switch(hudObj.anchorV){
							case 0:
								dy=0;
								break;
							case 1:
								dy=-hudObj.h*0.5;
								break;
							case 2:
								dy=-hudObj.h;
								break;
						}
						dx*=scale;dy*=scale;
						dx+=hudObj.x+curDiv.clientLeft*scale;
						dy+=hudObj.y+curDiv.clientTop*scale;
						x=x*scale+dx;
						y=y*scale+dy;
					}else{
						dx=curDiv.offsetLeft+curDiv.clientLeft;
						dy=curDiv.offsetTop+curDiv.clientTop;
						x+=dx;
						y+=dy;
					}
					curDiv=curDiv.offsetParent||curDiv.parentNode;
				}
				return [x,y];
			};
		}

		//-------------------------------------------------------------------
		//Ani控制:
		{
			//---------------------------------------------------------------
			//播放一个/多个动画:
			this.animate=function(def,play=1){
				let ani;
				if(Array.isArray(def)){
					let anis=[];
					for(let subDef of def){
						anis.push(this.animate(subDef,play));
					}
					return anis;
				}
				ani=JAXAni.createAniByType(def.type,jaxEnv,def,this);
				if(play) {
					ani.start();
				}
				return ani;
			};
		}

		//-------------------------------------------------------------------
		//交互事件:
		{
			//TODO: Code this:
		}

		//-------------------------------------------------------------------
		//Faces:
		{
			//---------------------------------------------------------------
			//展示一个Face
			this.showFace=function(faceName,vo)
			{
				var faceVO,showFunc,oldFace;
				if(!facesVO){
					return;
				}
				//如果是数组，对每一项执行showFace
				if(Array.isArray(faceName)){
					for(let subName of faceName){
						this.showFace(subName,null);
					}
					return;
				}
				faceVO=typeof(faceName)==='string'?facesVO[faceName]:faceName;
				if(!faceVO){
					//throw "Face not found: "+faceName;
					return;
				}
				showFunc=typeof(faceVO)==='function'?faceVO:faceVO.show;
				if(!showFunc){
					//faceVO就是AttrVO:
					this._applyFaceVO(faceVO,vo);
					return;
				}
				showFunc(this,vo,oldFace);
			};

			//---------------------------------------------------------------
			//切换至一个Face
			this.switchFace=function(faceName,vo)
			{
				var faceVO,showFunc,oldFace;

				if(!this.faces){
					return;
				}
				faceVO=typeof(faceName)==='string'?this.faces[faceName]:faceName;
				if(!faceVO){
					//console.log("Face not found: "+faceName);
					return;
				}

				oldFace=curFace;
				if(curFaceVO && curFaceVO.hide){
					curFaceVO.hide(faceName);
				}

				showFunc=typeof(faceVO)==='function'?faceVO:faceVO.show;

				curFaceVO=faceVO;
				curFace=faceName;
				if(!showFunc){
					//faceVO就是AttrVO:
					this._applyFaceVO(faceVO,vo);
					return;
				}
				showFunc(this,vo,oldFace);
			};

			//---------------------------------------------------------------
			//应用Face的属性列表:
			this._applyFaceVO=function(faceVO,vo){
				let itemId,hudId,hud,attrs,attrName,attr,val,stateObj,attrType,tgtObj;
				if(Array.isArray(faceVO)){
					let vo;
					for(vo of faceVO){
						this._applyFaceVO(vo);
					}
					return;
				}
				if(typeof(faceVO)==='function'){
					faceVO.call(this,vo);
					return;
				}
				for(itemId in faceVO){
					hudId=itemId;
					attrs=faceVO[hudId];
					attrType=typeof(attrs);
					if(attrType==="function") {
						attrs.call(this,vo);
					}else if(hudId.startsWith("@")){
						let time,self;
						//FaceTime:
						self=this;
						time=parseInt(hudId.substring(1));
						if(time>0){
							window.setTimeout(()=>{
								self._applyFaceVO(attrs);
							},time);
						}
					}else {
						if (hudId in this) {
							hud = this[hudId];
						} else {
							hud = this[hudId] = this.findObjById(hudId);
						}
						if (hud) {
							let anis;
							stateObj=hud.stateObj_;
							if(attrs===0){
								hud.display = 0;
							}else if(attrs===1) {
								hud.display = 1;
							}else{
								anis=attrs.ani;
								if(anis){
									anis=hud.animate(anis,0);
								}
								for (attrName in attrs) {
									attr = attrName;
									val = attrs[attr];
									attrType = typeof (val);
									if(attr!=="ani"){
										if (attr.startsWith("%")) {
											tgtObj = hud.hudState || hud.stateObj_ || hud;
											attr = attr.substring(1);
										} else {
											tgtObj = hud;
										}
										if (val !== undefined) {
											if(val instanceof Function){
												tgtObj[attr] = val.call(self);
											}else {
												tgtObj[attr] = val;
											}
										}
									}
								}
								if(anis){
									if(anis instanceof JAXAni){
										anis.start();
									}else{
										for(let ani of anis){
											ani.start();
										}
									}
								}
							}
						}
					}
				}
			};

			//TODO: Code this:
		}
	}
};

JAXHudObj.prototype=__Proto;


//***************************************************************************
//静态Class成员函数:
//***************************************************************************
{
	//CSS属性列表
	JAXHudObj.jaxPptSet=new Set([
		'id','jaxObjHash','jaxId',
		'autoLayout',
		'position','x','y','w','h','anchorH','anchorV',"zIndex",
		'ofX','ofY','ofW','ofH',
		'display','clip','alpha','scale','rotate','cursor',
		'uiEvent','items',
		'OnLayout','OnClick','OnTreeClick','OnMouseInOut',
		'faces'
	]);
	var HudTypeHash = {};

	//---------------------------------------------------------------------------
	//注册Hud控件类型
	JAXHudObj.regHudByType = function (typeName, func) {
		HudTypeHash[typeName] = func;
	};

	//---------------------------------------------------------------------------
	//根据类型创建Hud控件
	JAXHudObj.createHudByType = function (typeName, env, father,css,owner) {
		let typeType,func,hud,obj,isGear=0;
		if(css.skipCreate){
			return null;
		}
		typeType=typeof(typeName);
		if(typeType==="string") {
			func = HudTypeHash[typeName];
		}
		if(!func){
			obj=css;
			while(typeof(obj)==="object"){
				func = HudTypeHash[obj.type];
				if (func) {
					isGear=1;
					break;
				}
				obj=obj.css||obj.type;
			}
			if(!func) {
				console.error("JAXError hud-type '" + typeName + "' has no creator function.");
				return null;
			}
		}
		hud=func(env);
		if(hud){
			if(father){
				father.appendChild(hud);
			}else if(owner){
				owner.appendChild(hud);
				hud.owner_=owner;
			}
			if(css) {
				JAXEnv.applyCSS(hud,css);
			}
			if(typeof(hud.OnCreate)==='function'){
				hud.OnCreate();
			}
			if(typeof(hud.AfCreate)==='function'){
				hud.jaxEnv.callAfter(hud.AfCreate.bind(hud));
			}
			//应该在这里弹出HashObj:
			hud.jaxEnv.popObjHasher(hud);
			if(owner){
				owner.removeChild(hud);
			}
		}
		return hud;
	};

	//---------------------------------------------------------------------------
	//注册基础Hud类
	JAXHudObj.regHudByType('hud', function (env) {
		return new JAXHudObj(env);
	});
	JAXHudObj.regHudByType('item', function (env) {
		return new JAXHudObj(env);
	});
}

//***************************************************************************
//可继承的成员函数:
//***************************************************************************
{
	//---------------------------------------------------------------
	//ApplyCSS合并属性之前，创建WebObj:
	__Proto.preApplyCSS = function (cssObj)
	{
		var div,father,self,jaxEnv,owner,ownerState;
		jaxEnv=this.jaxEnv;
		this.removeAllChildren();
		father = this.father;
		owner = this.owner;
		if(!this.webObj) {
			div = this.webObj = document.createElement('div');
			div.style.position = cssObj.position||"absolute";
			if (father && father.webObj) {
				father.webObj.appendChild(div);
			}
			div.jaxObj=this;
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
	//ApplyCSS把pptList赋值后
	__Proto.finApplyCSS = function (cssObj)
	{
		var self=this;
		if(this.webObj){
			this.webObj.id=this.id;
		}
		this.items2Add_=cssObj.items;
	};

	//---------------------------------------------------------------
	//ApplyCSS的最后，设置WebObj属性:
	__Proto.postApplyCSS = function (cssObj)
	{
		let list,hudPose,aniPose;
		list=this.items2Add_;
		if(Array.isArray(list)){
			this._applyItems(list);
		}
		delete this.items2Add_;

		hudPose=this.hudPose;
		aniPose=this.aniPose;
		aniPose.x=0;
		aniPose.y=0;
		aniPose.alpha=hudPose.alpha;
		aniPose.scale=hudPose.scale;
		aniPose.rot=hudPose.rot;

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
	};

	//---------------------------------------------------------------
	//更新控件内容
	__Proto.update=function()
	{
		let moreUpdate,webObj;
		let x,y,aniPose,hudPose;

		hudPose=this.hudPose;
		aniPose=this.aniPose;
		aniPose.x=0;
		aniPose.y=0;
		aniPose.alpha=hudPose.alpha;
		aniPose.scale=hudPose.scale;
		aniPose.rot=hudPose.rot;

		webObj=this.webObj;
		moreUpdate=0;
		//Ani系统将独立于Hud系统进行Update:
		//moreUpdate=this._updateAni(aniPose);
		if(webObj && this.poseChanged) {
			this._syncWebObj();
		}
	};

	//---------------------------------------------------------------
	//控件被点击消息:
	__Proto.OnMouseClick=function(e)
	{
		if(this.isGenEvent){
			if(e.srcElement===this.webObj && this.OnClickFunc_) {
				e.stopPropagation();
				this.OnClickFunc_.call(this, e);
			}else if(this.OnTreeClickFunc_){
				e.stopPropagation();
				this.OnTreeClickFunc_.call(this, e);
			}
		}
	};

	//-----------------------------------------------------------------------
	//释放资源:
	__Proto.freeHud=function(){
		var father,div;
		this.removeAllChildren();
		father=this.father;
		div=this.webObj;
		if(div && father && father.webObj){
			father=div.parentNode;
			if(father){
				father.removeChild(div);
			}
			this.webObj=null;
		}
	};
}

export {JAXHudObj};