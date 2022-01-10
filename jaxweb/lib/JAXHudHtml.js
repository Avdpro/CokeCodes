import {JAXEnv,$JXV,$V} from "./JAXEnv.js";
import {JAXHudObj} from "./JAXHudObj.js";
import {jaxHudState} from "./JAXHudState.js";
import { JAXApp } from './JAXApp'

let JAXHudHtml=function(env,htmlObj){
	let self,jaxId,id,jaxObjHash,hudView;
	let styleObj;
	let pxChdList,pxStyle;
	let refCount;
	let valJXVMap;
	
	self=this;
	jaxId=null;
	id=htmlObj.id;
	styleObj=htmlObj.style;
	this.jaxEnv=env;
	htmlObj.jaxObj=this;
	this.webObj=htmlObj;
	this.app=env.app;
	this.isJAXHudObj_=1;
	refCount=1;

	valJXVMap=new Map();
	this.$valJXVMap=valJXVMap;
	
	//不枚举的属性:
	Object.defineProperty(this, 'isJAXHudObj_', {enumerable:false,writable:false});
	Object.defineProperty(this, 'jgxEnv', {enumerable:false,writable:false});
	Object.defineProperty(this, 'webObj', {enumerable:false,writable:true});
	Object.defineProperty(this, 'app', {enumerable:false,writable:false});
	Object.defineProperty(this, 'father_', {enumerable:false,writable:true});
	Object.defineProperty(this, 'owner_', {enumerable:false,writable:true});
	Object.defineProperty(this, 'chdHudList_', {enumerable:false,writable:true});
	
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
	
	pxStyle=new Proxy(styleObj,{
		get:function(obj,pName){
			return styleObj[pName];
		},
		set:function(obj,pName,v){
			if(v instanceof $JXV){
				let oldV,mapName;
				mapName='STYLE'+pName;
				oldV = valJXVMap.get(mapName);
				if (oldV) {
					oldV.untrace();
					valJXVMap.delete(mapName);
				}
				if(v.traces!==0) {
					v.trace(this.stateObj, styleObj, pName, hudView);
					valJXVMap.set(mapName, v);
				}
				v=v.val;
			}
			styleObj[pName]=v;
		}
	});
	
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
				if (id !== v) {
					id = v;
					if (htmlObj) {
						htmlObj.id = id;
					}
					if(v){
						jaxEnv.addHashObj("" + v, this);
					}
				}
			},
			enumerable: true,
		});
	}
	
	//-----------------------------------------------------------------------
	//Size and pos:
	{
		//Width
		Object.defineProperty(this, 'w', {
			get: function () {
				return htmlObj.offsetWidth;
			},
			set: function (v) {
			},
			enumerable: true,
			configurable:true
		});
		
		//控件高度
		Object.defineProperty(this, 'h', {
			get: function () {
				return htmlObj.offsetHeight;
			},
			set: function (v) {
			},
			enumerable: true,
			configurable:true
		});
		
		//控件X坐标
		Object.defineProperty(this, 'x', {
			get: function () {
				return htmlObj.offsetLeft;
			},
			set: function (v) {
			},
			enumerable: true,
			configurable:true
		});
		
		//控件Y坐标
		Object.defineProperty(this, 'y', {
			get: function () {
				return htmlObj.offsetTop;
			},
			set: function (v) {
			},
			enumerable: true,
			configurable:true
		});
	}
	
	//-------------------------------------------------------------------
	//控件树:
	{
		//---------------------------------------------------------------
		//父节点控件:
		Object.defineProperty(this,'father',{
			get:function(){
				let pNode=htmlObj.parentElement;
				if(pNode && pNode.jaxObj){
					return pNode.jaxObj;
				}
				return this.father_;
			},
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
			get:function(){
				return this.chdHudList_[0];
			}
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
	
	//***********************************************************************
	//不会被继承的成员函数
	//***********************************************************************
	{
		//-------------------------------------------------------------------
		//生存周期控制:
		{
			//---------------------------------------------------------------
			//增加引用，确保控件不会被提前释放:
			this.hold = function () {
				refCount++;
			};
			
			//---------------------------------------------------------------
			//减少引用，引用为0的时候，删除:
			this.release = function () {
				if (refCount > 0) {
					refCount--;
					if (refCount === 0) {
						this._free();
					}
				}
			};

			//---------------------------------------------------------------
			//Actual free the hud:
			this._free=function()
			{
				let hud,ani;
				if(this.OnFree){
					this.OnFree();
				}
				this.freeHud();
				for(hud of this.chdHudList_){
					hud.release();
				}
				this.deadOut=1;
				this.chdHudList_.splice(0);
				this.webObj.jaxObj=null;
				this.webObj=null;
				//untrace all bounded $JXV:
				{
					let list,val;
					list=valJXVMap.values();
					for(val of list){
						val&&val.untrace();
					}
					valJXVMap.clear();
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
			};

		}

		//-------------------------------------------------------------------
		//Hud tree access:
		{
			//---------------------------------------------------------------
			//Reset all children items:
			this._applyItems=function(list)	{
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
			this.appendNewChild = function (css){
				let hud=JAXHudObj.createHudByType(css.type,this.jaxEnv,this,css);
				if(hud){
					hud.release();
				}
				return hud;
			};
			
			//---------------------------------------------------------------
			//通过CSS插入一个子节点
			this.insertNewChild = function (css,beforeHud){
				let hud=JAXHudObj.createHudByType(css.type,this.jaxEnv,this,css);
				if(hud){
					if(beforeHud){
						this.removeChild(hud);
						this.insertBefore(hud,beforeHud);
					}
					hud.release();
				}
				return hud;
			};
			
			
			//---------------------------------------------------------------
			//添加一个子节点
			this.appendChild = function (hud){
				let view;
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
			};
			
			//-------------------------------------------------------------------
			//添加一个子节点
			this.insertBefore = function (hud, chd){
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
			};
			
			//-------------------------------------------------------------------
			//删除一个子节点
			this.removeChild = function (hud){
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
					hud.release();
				}
			};
			
			//-------------------------------------------------------------------
			//查找一个子节点的序号
			this.getChildHudIdx = function (hud2Find) {
				let list,i,n;
				list=this.chdHudList_;
				return list.indexOf(hud2Find);
			};
			
			//-------------------------------------------------------------------
			//查找一个子节点
			this.findHudById = function (id2Find){
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
				let list, hud,hudWebObj;
				list = this.chdHudList_;
				for (hud of list) {
					hudWebObj=hud.webObj;
					if(hudWebObj && hudWebObj.parentElement){
						hudWebObj.parentElement.removeChild(hudWebObj);
					}
					hud.father_=null;
					hud.release();
				}
				list.splice(0);
			};
			
			//-------------------------------------------------------------------
			//在全部子节点（包含subs）里执行一个函数:
			this.execInTree=function(func){
				let list,i,n;
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
		//Layout:
		{
			//---------------------------------------------------------------
			//Layout by father size:
			this._doLayout=function(){
				//TODO: Code this:
			}
		}
		
		//-------------------------------------------------------------------
		//Sync html and hud:
		{
			this._syncWebObj=function(){
				return;
			}
			
		}
	}
	
};

let jaxHudHtml=JAXHudHtml.prototype={};

//***************************************************************************
//可继承的成员函数:
//***************************************************************************
{
	//-----------------------------------------------------------------------
	//Free this hud item:
	jaxHudHtml.freeHud=function(){
		let father,div;
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
	}
	
	//---------------------------------------------------------------
	//ApplyCSS合并属性之前，创建WebObj:
	jaxHudHtml.preApplyCSS = function (cssObj)
	{
		let father,jaxEnv,owner,ownerState;
		jaxEnv=this.jaxEnv;
		this.removeAllChildren();
		father = this.father;
		owner = this.owner;
		if(cssObj.faces){
			cssObj.jaxObjHash=1;
		}
		if(cssObj.jaxId){
			this["#self"]=this;
			//添加这个Hud
			jaxEnv.addHashObj("#"+cssObj.jaxId, this);
		}
		//确定StateObj:
		let stateObj=cssObj.hudState;
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
	jaxHudHtml.finApplyCSS = function (cssObj)
	{
		if(this.webObj){
			this.webObj.id=this.id;
		}
		this.items2Add_=cssObj.items;
	};
	
	//---------------------------------------------------------------
	//ApplyCSS的最后，设置WebObj属性:
	jaxHudHtml.postApplyCSS = function (cssObj)
	{
		let list;
		list=this.items2Add_;
		if(Array.isArray(list)){
			this._applyItems(list);
		}
		delete this.items2Add_;
		
		if(cssObj.face){
			this.showFace(cssObj.face);
		}
		
		this._syncWebObj();
		
		let stateObj=this.stateObj_;
		if(stateObj){
			this.jaxEnv.popHudState(stateObj);
		}
	};
	
	//---------------------------------------------------------------
	//更新控件内容
	jaxHudHtml.update=function()
	{
		let webObj;
		webObj=this.webObj;
		if(webObj && this.poseChanged) {
			this._syncWebObj();
		}
	};
	
}

export default JAXHudHtml;
export {JAXHudHtml};
