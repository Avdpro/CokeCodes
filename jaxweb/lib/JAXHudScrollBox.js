import {JAXEnv,$JXV,$V} from "./JAXEnv.js";
import {JAXHudObj} from "./JAXHudObj.js";
import {jaxHudState} from "./JAXHudState.js";

var JAXHudScrollBox,__Proto;
var JAXHudScrollCell;

//***************************************************************************
//ScrollBox里面的一行
//***************************************************************************
JAXHudScrollCell=function(box,column=0)
{
	var self;
	self=this;
	this.jaxEnv=box.jaxEnv;
	this.owner=box;
	this.owner_=box;
	this.hud=null;
	this.webObj=this.webDiv=document.createElement('div');
	box.webObj.appendChild(this.webDiv);
	this.webDiv.style.width="100%";
	this.webDiv.style.position="relative";
	this.webDiv.style.marginBottom=box.subGap+"px";

	this.sizeObserver=new ResizeObserver(entries=>{
		let div;
		div=entries[0].target;
		self.webDiv.style.height=div.offsetHeight + "px";
	});

	Object.defineProperty(this, 'w', {
		get: function () {
			return box.w/(box.column>0?box.column:1);
		},
		enumerable: true
	});

	Object.defineProperty(this, 'h', {
		get: function () {
			return box.h;
		},
		enumerable: true
	});
	Object.defineProperty(this, 'clientW', {
		get: function () {
			return box.clientW/(box.column>0?box.column:1);
		},
		enumerable: true
	});

	Object.defineProperty(this, 'clientH', {
		get: function () {
			return box.clientH;
		},
		enumerable: true
	});

	Object.defineProperty(this, 'stateObj', {
		get: function () {
			return box.stateObj;
		},
		enumerable: true
	});


};

JAXHudScrollCell.prototype={};
//---------------------------------------------------------------------------
//设置Box的内容:
JAXHudScrollCell.prototype.setItem=function(obj)
{
	var hud;
	if(this.hud){
		this.sizeObserver.unobserve(this.hud.webObj);
		this.hud.release();
		this.hud.owner_=null;
	}
	if(obj.isJAXHudObj_){
		hud=obj;
	}else{
		hud=JAXHudObj.createHudByType(obj.type,this.jaxEnv,null,obj,this);
	}
	if(hud){
		this.hud=hud;
		if(hud.webObj) {
			this.webDiv.appendChild(hud.webObj);
			this.webDiv.style.height=hud.h+"px";
			this.sizeObserver.observe(hud.webObj);
		}
		this.hud.owner_=this;
	}
	return hud;
};

//---------------------------------------------------------------------------
//用来创建Hud
JAXHudScrollCell.prototype.appendChild=function(hud)
{
	hud.father_ = this;
	hud.hold();
	if(hud.webObj) {
		this.webDiv.appendChild(hud.webObj);
	}
};

//---------------------------------------------------------------------------
//用来创建Hud
JAXHudScrollCell.prototype.removeChild=function(hud)
{
	if(hud.father_!==this)
		return;
	if(hud.webObj) {
		this.webDiv.removeChild(hud.webObj);
	}
	hud.release();
	hud.father_ = null;
};

//---------------------------------------------------------------------------
//移除Box
JAXHudScrollCell.prototype.freeCell=function(obj)
{
	var hud;
	this.webDiv.parentNode.removeChild(this.webDiv);
	this.webDiv=null;
	if(this.hud){
		this.hud.release();
		this.hud.owner_=null;
		this.hud=null;
	}
	this.sizeObserver.disconnect();
};

//***************************************************************************
//ScrollBox定义
//***************************************************************************
__Proto=new JAXHudObj();
JAXHudScrollBox=function(jaxEnv)
{
	var subGap,self;
	var headSpace,endSpace;
	var _attrChanged;
	var signUpdate;
	var oldSubGap;
	var column=-1,columnSet=0;

	self=this;
	this.subHudList_=[];
	this.subFrameDiv=null;
	this.subInnerDiv=null;

	//this.headSpaceDiv=null;
	//this.endSpaceDiv=null;
	this.subColumnDivs=[];

	var pxSubList=new Proxy(this.subHudList_,{
		get:function(obj,pName){
			switch(pName){
			case "push": {
				return function(css){
					var idx,hud;
					[idx,hud]=self.addSub(css);
					return hud;
				};
			}
			case "pop":
				return function(){
					self.removeSub(self.subHudList_.length-1,1);
				};
			case "splice":
				return function(idx,n,hud){
					if(n>0){
						self.removeSub(idx,n);
					}
					if(hud){
						self.insertSub(hud,idx);
					}
				};
			case "insert":
				return function(css,idx){
					return self.insertSub(css,idx);
				};
			case "moveUp":
				return function(idx){
					return self.subMoveUp(idx);
				};
			case "clear":
				return function(){
					self.removeSub(0,self.subHudList_.length);
				};
			case "indexOf":
				return function(hud){
					let list,i,n;
					list=self.subHudList_;
					n=list.length;
					for(i=0;i<n;i++){
						if(list[i].hud===hud)
							return i;
					}
					return -1;
				};
			}
			if(pName>=0 && pName<obj.length){
				return obj[pName].hud;
			}else if(pName==='length'){
				return obj.length;
			}
			return undefined;
		},
		set:function(obj,pName,v){}
	});


	JAXHudObj.call(this,jaxEnv);

	var valJXVMap,hudView;
	valJXVMap=this.$valJXVMap;
	hudView=this.hudView;

	this.clip=1;

	this.jaxClassFunc=JAXHudScrollBox;

	signUpdate=this.signUpdate;

	subGap=0;
	oldSubGap=0;
	headSpace=0;
	endSpace=50;
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
		//-------------------------------------------------------------------
		//列的数量:
		Object.defineProperty(this,'column',{
			get:function () {
				return column;
			},
			set:function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('column');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('column');
					}
					if(v.traces!==0) {
						v.trace(this.$stateObj_, this, 'column', hudView);
						valJXVMap.set('column', v);
					}
					v=v.val;
				}
				var list,i,n,columnW;
				if(column===v)
					return;
				if(v<=0){
					console.warn("Colum number error: "+v);
					return;
				}
				list=this.subHudList_.slice(0);
				n=list.length;
				for(i=0;i<n;i++){
					list[i]=list[i].hud;
					list[i].hold();
				}
				this.clear();

				n=this.subColumnDivs.length;
				for(i=0;i<n;i++){
					this.subInnerDiv.removeChild(this.subColumnDivs[i]);
				}

				columnW=this.w/v;
				this.subColumnDivs=[];
				for(i=0;i<v;i++){
					let subDiv;
					subDiv=document.createElement('div');
					this.subInnerDiv.appendChild(subDiv);
					subDiv.style.position="relative";
					subDiv.style.width=columnW+"px";
					subDiv.style.height="auto";
					//subDiv.style.overflowX="hidden";
					this.subColumnDivs.push(subDiv);
				}

				n=list.length;
				for(i=0;i<n;i++){
					this.addSub(list[i]);
					list[i].release();
				}
				column=v;
				return v;
			},
			enumerable: true
		});
		//-------------------------------------------------------------------
		//顶部留白:
		Object.defineProperty(this, 'headSpace', {
			get: function () {
				return headSpace;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('headSpace');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('headSpace');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'headSpace', hudView);
						valJXVMap.set('headSpace', v);
					}
					v=v.val;
				}
				if (v!==headSpace) {
					headSpace=v;
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		//-------------------------------------------------------------------
		//底部留白:
		Object.defineProperty(this, 'endSpace', {
			get: function () {
				return endSpace;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('endSpace');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('endSpace');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'endSpace', hudView);
						valJXVMap.set('endSpace', v);
					}
					v=v.val;
				}
				if (v!==endSpace) {
					endSpace=v;
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		//-------------------------------------------------------------------
		//行间距:
		Object.defineProperty(this, 'subGap', {
			get: function () {
				return subGap;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('subGap');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('subGap');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'subGap', hudView);
						valJXVMap.set('subGap', v);
					}
					v=v.val;
				}
				if (v!==subGap) {
					subGap=v;
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		//-------------------------------------------------------------------
		//子节点列表控件:
		Object.defineProperty(this,'subs',{
			get:function(){
				return pxSubList;
			},
			set:function(list){
			},
			configurable:true
		});
	}

	//***********************************************************************
	//不会被继承的方法:
	//***********************************************************************
	{
		//---------------------------------------------------------------
		//删除全部滚动控件
		this.clear=this.removeAllSubs=function()
		{
			let list,i,n,box;
			list=this.subHudList_;
			n=list.length;
			for(i=0;i<n;i++){
				box=list[i];
				box.freeCell();
			}
			list.splice(0);
		};

		//---------------------------------------------------------------
		//添加滚动控件
		this.addSub=function(obj)
		{
			let cell,idx,list,i,n,columnDiv,h,minColumn,minH;
			idx=this.subHudList_.length;
			if(Array.isArray(obj)){
				let list,i,n;
				list=obj;
				n=list.length;
				for(i=0;i<n;i++){
					this.addSub(list[i]);
				}
				return [idx,n];
			}
			idx=this.subHudList_.length;
			cell=new JAXHudScrollCell(this);

			//选一个列:
			list=this.subColumnDivs;
			minColumn=list[0];
			minH=10000000;
			n=list.length;
			for(i=0;i<n;i++){
				columnDiv=list[i];
				h=columnDiv.lastChild?(columnDiv.lastChild.offsetTop+columnDiv.lastChild.offsetHeight):0;
				if(h<minH){
					minH=h;
					minColumn=columnDiv;
				}
			}
			minColumn.appendChild(cell.webDiv);
			cell.setItem(obj);
			this.subHudList_.push(cell);
			return [idx,cell.hud];
		};

		//---------------------------------------------------------------
		//插入滚动控件
		this.insertSub=function(obj,idx)
		{
			let cell,oldCell,hud;
			if(idx<0)
				idx=0;
			if(Array.isArray(obj)){
				let list,i,n;
				list=obj;
				n=list.length;
				for(i=0;i<n;i++){
					this.insertSub(list[i],idx+i);
				}
				return n;
			}
			oldCell=this.subHudList_[idx];
			cell=new JAXHudScrollCell(this);
			if(oldCell) {
				cell=new JAXHudScrollCell(this);
				oldCell.webDiv.parentNode.insertBefore(cell.webDiv,oldCell.webDiv);
				cell.setItem(obj);
				this.subHudList_.splice(idx,0,cell);
				return cell.hud;
			}
			[hud,idx]=this.addSub(obj);
			return hud;
		};

		//---------------------------------------------------------------
		//移除滚动控件
		this.removeSub=function(idx,n)
		{
			let list,cell;
			if(n>1){
				let i;
				for(i=0;i<n;i++){
					this.removeSub(idx);
				}
				return;
			}
			list=this.subHudList_;
			if(idx<0 ||idx>=list.length)
				return;
			cell=list[idx];
			cell.freeCell();
			list.splice(idx,1);
		};

		//---------------------------------------------------------------
		//根据Id获得滚动控件
		this.findSubById=function(subId)
		{
			let list,cell,i,n;
			list=this.subHudList_;
			n=list.length;
			for(i=0;i<n;i++){
				cell=list[i];
				if(cell && cell.hud && cell.hud.id===subId)
				{
					return cell.hud;
				}
			}
			return null;
		};

		//---------------------------------------------------------------
		//获得滚动控件的序号
		this.indexOfSub=function(hud)
		{
			let list,cell,i,n;
			list=this.subHudList_;
			n=list.length;
			for(i=0;i<n;i++){
				cell=list[i];
				if(cell && cell.hud===hud){
					return i;
				}
			}
			return -1;
		};

		//---------------------------------------------------------------
		//获得指定序号的滚动控件
		this.subAtIdex=function(idx)
		{
			let list,cell,i,n;
			list=this.subHudList_;
			if(idx<0 || idx>=list.length)
				return null;
			cell=list[idx];
			if(cell)
				return cell.hud;
			return null;
		};

		//---------------------------------------------------------------
		//一个Sub向上移动:
		this.subMoveUp=function(idx){
			var cell,list,preCell;
			list=this.subHudList_;
			if(idx<=0 || idx>=list.length){
				return 0;
			}
			cell=list[idx];
			preCell=list[idx-1];
			list.splice(idx,1);
			list.splice(idx-1,0,cell);
			cell.webDiv.parentNode.removeChild(cell.webDiv);
			preCell.webDiv.parentNode.insertBefore(cell.webDiv,preCell.webDiv);
			return 1;
		};

		//---------------------------------------------------------------
		//重新排列Subs:
		this.relayoutSubs=function(start=0){
			var list,i,n;
			list=this.subHudList_.slice(0);
			n=list.length;
			start=start>0?start:0;
			for(i=start;i<n;i++){
				list[i]=list[i].hud;
				list[i].hold();
			}
			if(start>0){
				this.removeSub(start,n-start);
			}else {
				this.clear();
			}
			for(i=start;i<n;i++){
				this.addSub(list[i]);
				list[i].release();
			}
		};

		//---------------------------------------------------------------
		//更新滚动控件
		this._applySubHuds=function(list)
		{
			this.clear();
			this.addSub(list);
		};

		//-------------------------------------------------------------------
		//同步控件属性:
		this._syncWebObjAttr=function()
		{
			let webObj,subDiv,list,i,n,cell;
			webObj=this.webObj;
			if(!webObj) {
				return;
			}
			subDiv=this.subFrameDiv;
			subDiv.style.paddingTop=this.headSpace+"px";
			subDiv.style.paddingBottom=this.endSpace+"px";
			this.subInnerDiv.style.width=this.size[0]+"px";
			if(oldSubGap!==subGap){
				list=this.subHudList_;
				n=list.length;
				for(i=0;i<n;i++){
					cell=list[i];
					cell.webDiv.style.marginBottom=subGap+"px";
				}
				oldSubGap=subGap;
			}
			_attrChanged=0;
		};

		//-------------------------------------------------------------------
		//在全部子节点（包含subs）里执行一个函数:
		this.execInTree=function(func){
			var list,i,n,hud;
			list=this.subHudList_;
			n=list.length;
			for(i=0;i<n;i++){
				hud=list[i].hud;
				if(hud && func(hud)){
					return;
				}
			}
			list=this.chdHudList_;
			n=list.length;
			for(i=0;i<n;i++){
				if(func(list[i])){
					return;
				}
			}
		};

	}
};

JAXHudScrollBox.prototype=__Proto;

//***************************************************************************
//属性列表/注册创建函数:
//***************************************************************************
{
	//CSS属性列表
	JAXHudScrollBox.jaxPptSet=new Set(Array.from(JAXHudObj.jaxPptSet).concat([
		'column','headSpace','endSpace','subGap','subs',
	]));

	//---------------------------------------------------------------------------
	//注册基础Hud类
	JAXHudObj.regHudByType('scroll', function (env) {
		return new JAXHudScrollBox(env);
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
		var div, father, subDiv,innerDiv;
		let jaxEnv=this.jaxEnv;

		let owner,ownerState;
		father = this.father;
		owner = this.owner;

		this.removeAllChildren();
		if(!this.webObj) {
			div = this.webObj = document.createElement('div');
			div.style.position = cssObj.position||"absolute";
			father = this.father;
			if (father && father.webObj) {
				father.webObj.appendChild(div);
			}
			div.jaxObj = this;

			//创建滚动框架div:
			subDiv=this.subFrameDiv = document.createElement('div');
			div.appendChild(subDiv);
			subDiv.style.position="absolute";
			subDiv.style.left="0px";
			subDiv.style.top="0px";
			subDiv.style.width="100%";
			subDiv.style.height="100%";
			subDiv.style.overflowY="scroll";
			subDiv.style.overflowX="hidden";
			subDiv.style.boxSizing="border-box";

			//创建内部框架:
			innerDiv=this.subInnerDiv = document.createElement('div');
			subDiv.appendChild(innerDiv);
			innerDiv.style.position="relative";
			innerDiv.style.width="100%";
			innerDiv.style.height="auto";
			innerDiv.style.display="flex";

			//监视innerDiv的尺寸:
			let showScrollBar=0;
			this.innerSizeObserver=new ResizeObserver(entries=>{
				let div,h;
				div=entries[0].target;
				h=div.offsetHeight;
				if(h>subDiv.offsetHeight){
					if(!showScrollBar) {
						subDiv.style.overflowY = "scroll";
						showScrollBar = 1;
					}
				}else if(showScrollBar){
					showScrollBar=0;
					subDiv.style.overflowY="hidden";
					subDiv.scrollTop=0;
				}
			});
			this.innerSizeObserver.observe(innerDiv);
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
		this.subs2Add_=cssObj.subs;
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
		delete this.items2Add_;
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

		//确保有列div:
		if(!cssObj.column>=1){
			this.column=1;
		}

		list=this.subs2Add_;
		if(Array.isArray(list)){
			this._applySubHuds(list);
		}
		delete this.subs2Add_;

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

export {JAXHudScrollBox,JAXHudScrollCell};