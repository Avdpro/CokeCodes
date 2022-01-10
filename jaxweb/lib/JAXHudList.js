import {JAXEnv,$JXV,$V} from "./JAXEnv.js";
import {JAXHudObj} from "./JAXHudObj.js";
import {jaxHudState} from "./JAXHudState.js";

var JAXHudList,__Proto;
var JAXHudListNode;

//***************************************************************************
//ListBox里面的一行
//***************************************************************************
{
	JAXHudListNode = function (box, obj, beforeNode)
	{
		var colNum,i,div,columns,css,hud;

		columns=box.columns;
		if(!columns){
			columns=[box.w];
		}
		this.columns=columns;
		colNum = columns.length;


		Object.defineProperty(this, 'w', {
			get: function () {
				return this.curColumn?this.columns[this.curColumn]:this.owner.w;
			},
			enumerable: true
		});

		Object.defineProperty(this, 'h', {
			get: function () {
				return box.rowH;
			},
			enumerable: true
		});

		Object.defineProperty(this, 'clientW', {
			get: function () {
				return this.curColumn?this.columns[this.curColumn]:this.owner.clientW;
			},
			enumerable: true
		});

		Object.defineProperty(this, 'clientH', {
			get: function () {
				return box.rowH;
			},
			enumerable: true
		});

		Object.defineProperty(this, 'stateObj', {
			get: function () {
				return box.stateObj;
			},
			enumerable: true
		});

		Object.defineProperty(this, 'hud', {
			get: function () {
				return this.columnHuds[0];
			},
			enumerable: true
		});

		this.nodeObj = obj;
		this.jaxEnv = box.jaxEnv;
		this.owner = box;
		this.owner_=box;
		this.webObj = this.webDiv = null;
		this.columnDivs=[];
		this.columnHuds=[];
		this.curColumn=0;

		for(i=0;i<colNum;i++) {
			div=this.columnDivs[i]=document.createElement('div');
			if(!beforeNode){
				box.columnDivs[i].appendChild(div);
			}else{
				box.columnDivs[i].insertBefore(div,beforeNode.columnDivs[i]);
			}
			div.style.width = "100%";
			div.style.position = "relative";
			div.style.left = "0px";
			div.style.top = "0px";
			div.style.height=box.rowH+"px";
			css=i?box.columnCSS[i-1](obj,this):box.nodeCSS(obj,this);
			if(css){
				this.webObj=div;
				this.curColumn=i;
				hud = JAXHudObj.createHudByType(css.type, this.jaxEnv, null, css, this);
				this.columnHuds[i]=hud;
				if(hud && hud.webObj){
					div.appendChild(hud.webObj);
				}
			}
		}
		this.curColumn=0;
	};

	JAXHudListNode.prototype = {};

	//---------------------------------------------------------------------------
	//用来创建Hud
	JAXHudListNode.prototype.appendChild = function (hud) {
		hud.father_ = this;
		hud.hold();
		if (hud.webObj) {
			this.webObj.appendChild(hud.webObj);
		}
	};

	//---------------------------------------------------------------------------
	//用来创建Hud
	JAXHudListNode.prototype.removeChild = function (hud) {
		if (hud.father_ !== this)
			return;
		if (hud.webObj) {
			this.webObj.removeChild(hud.webObj);
		}
		hud.release();
		hud.father_ = null;
	};

	//---------------------------------------------------------------------------
	//移除Box
	JAXHudListNode.prototype.freeNode = function () {
		var i,n,hud;
		var columns=this.columns;
		n=columns.length;
		for(i=0;i<n;i++){
			this.owner.columnDivs[i].removeChild(this.columnDivs[i]);
			hud=this.columnHuds[i];
			if(hud){
				hud.release();
				hud.owner_=null;
			}
		}
		this.columnDivs=null;
		this.columnHuds=null;
	};
}

//***************************************************************************
//树结构的Hud控件
//***************************************************************************
__Proto=new JAXHudObj();
JAXHudList=function(jaxEnv)
{
	var self;
	var nodeCSSFunc;
	var colCSSFunc;
	var selNodes;
	var hotNode;
	var columns;
	var columnDivs;
	var multi;
	var nodeGap;
	var oldNodeGap;
	var headSpace,endSpace;
	var nodeList;
	var signUpdate;
	var _attrChanged;
	var rowH;

	self=this;
	JAXHudObj.call(this,jaxEnv);

	var valJXVMap,hudView;
	valJXVMap=this.$valJXVMap;
	hudView=this.hudView;

	this.clip=1;
	this.jaxClassFunc=JAXHudList;

	nodeCSSFunc=null;
	colCSSFunc=null;
	selNodes=new Set();
	hotNode=null;
	multi=0;
	rowH=30;
	nodeGap=0;
	oldNodeGap=0;
	headSpace=0;
	endSpace=50;
	this.nodeList_=nodeList=[];

	columns=this.columns=[];
	columnDivs=this.columnDivs=[];
	this.columnHeadDivs=[];
	this.columnEndDivs=[];

	signUpdate=this.signUpdate;

	_attrChanged=0;

	this.OnHotNodeChange=null;
	this.OnAddNode=null;
	this.OnInsertNode=null;
	this.OnSelNodeChange=null;
	this.OnFreeNode=null;
	this.OnMoveNode=null;


	Object.defineProperty(this,'attrChanged',{
		get:function(){return _attrChanged;},
		set:function(v){_attrChanged=1;},
		enumerable:false
	});

	Object.defineProperty(this,'columnDivs',{
		writable:false
	});

	var pxNodeList=new Proxy(nodeList,{
		get:function(obj,pName){
			switch(pName){
				case "indexOf":
					return obj.indexOf;
			}
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
	//CSS属性:
	//***********************************************************************
	{
		//---------------------------------------------------------------
		//行距:
		Object.defineProperty(this, 'rowH', {
			get: function () {
				return rowH;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('rowH');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('rowH');
					}
					if(v.traces!==0) {
						v.trace(this.$stateObj_, this, 'rowH', hudView);
						valJXVMap.set('rowH', v);
					}
					v=v.val;
				}
				if (v !== rowH) {
					rowH = v;
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		//---------------------------------------------------------------
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
						v.trace(this.$stateObj_, this, 'headSpace', hudView);
						valJXVMap.set('headSpace', v);
					}
					v=v.val;
				}
				if (v !== headSpace) {
					headSpace = v;
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		//---------------------------------------------------------------
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
						v.trace(this.$stateObj_, this, 'endSpace', hudView);
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

		//---------------------------------------------------------------
		//允许多重选择:
		Object.defineProperty(this, 'multiSelect', {
			get: function () {
				return multi;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('intend');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('intend');
					}
					if(v.traces!==0) {
						v.trace(this.$stateObj_, this, 'intend', hudView);
						valJXVMap.set('intend', v);
					}
					v=v.val;
				}
				if(v!==multi){
					multi=v;
					this.clearSelects();
				}
			},
			enumerable: true
		});

		//---------------------------------------------------------------
		//子节点列表控件:
		Object.defineProperty(this,'nodes',{
			get:function(){
				return pxNodeList;
			},
			set:function(list){
				//这里什么都不干
			},
			configurable:true
		});

		//---------------------------------------------------------------
		//生成子节点CSS的函数:
		Object.defineProperty(this,'nodeCSS',{
			get:function(){
				return nodeCSSFunc;
			},
			set:function(v){
				nodeCSSFunc=v;
			},
			configurable:true
		});

		//---------------------------------------------------------------
		//生成子节点CSS的函数:
		Object.defineProperty(this,'columnCSS',{
			get:function(){
				return colCSSFunc;
			},
			set:function(v){
				if(!Array.isArray(v)){
					throw "Error: columnCSS is not array."
				}
				if(v.length<columns.length){
					throw "Error: columnCSS.length is not same with columns.length."
				}
				colCSSFunc=v;
			},
			configurable:true
		});

		//---------------------------------------------------------------
		//当前的焦点节点:
		Object.defineProperty(this, 'hotNode', {
			get: function () {
				return hotNode;
			},
			set: function (v) {
				if (v!==hotNode && v instanceof JAXHudListNode) {
					this.setHotNode(v);
				}
			},
			enumerable: true
		});

		//---------------------------------------------------------------
		//当前的选中节点列表:
		Object.defineProperty(this, 'selected', {
			get: function () {
				return selNodes;
			},
			set: function (v) {
			},
			enumerable: true
		});
	}

	//***********************************************************************
	//不会被继承的函数:
	//***********************************************************************
	{
		//---------------------------------------------------------------
		//删除全部滚动控件
		this.clear=this.removeAllNodes=function()
		{
			let list,i,n,node;
			if(hotNode){
				self.setHotNode(null);
			}
			selNodes.clear();
			list=nodeList;
			n=list.length;
			for(i=0;i<n;i++){
				node=list[i];
				node.freeNode();
			}
			list.splice(0);
		};

		//---------------------------------------------------------------
		//在指定节点下添加节点，如果指定节点不存在，则添加根节点
		this.addNode=function(obj)
		{
			let node;
			if(this.autoLayout){
				this._doLayout();
			}
			//添加根节点
			node = new JAXHudListNode(this,obj,null);
			nodeList.push(node);
			if (self.OnAddNode) {
				self.OnAddNode(obj,node);
			}
			return node;
		};

		//---------------------------------------------------------------
		//在指定节点下添加一组节点，如果指定节点不存在，则添加到根节点
		this.addNodes=function(list)
		{
			let node,css,obj,i,n;
			if(this.autoLayout){
				this._doLayout();
			}
			//添加根节点
			n=list.length;
			for(i=0;i<n;i++) {
				obj=list[i];
				node = new JAXHudListNode(this,obj,null);
				nodeList.push(node);
				if (self.OnAddNode) {
					self.OnAddNode(obj,node);
				}
			}
		};

		//---------------------------------------------------------------
		//在指定节点前插入节点
		this.insertNode=function(obj,beforeNode)
		{
			let node,idx;
			idx=nodeList.indexOf(beforeNode);
			if(idx<0) {
				return this.addNode(obj);
			}
			if(this.autoLayout){
				this._doLayout();
			}
			node = new JAXHudListNode(this,obj,beforeNode);
			nodeList.splice(idx,0,node);
			if (self.OnInsertNode) {
				self.OnInsertNode(idx,obj,node);
			}
			return node;
		};

		//---------------------------------------------------------------
		//在指定节点前插入多个节点
		this.insertNodes=function(list,beforeNode)
		{
			let i,n,obj,node,idx;
			idx = nodeList.indexOf(beforeNode);
			if (idx < 0) {
				return this.addNodes(list);
			}
			if(this.autoLayout){
				this._doLayout();
			}
			n=list.length;
			for(i=0;i<n;i++) {
				obj=list[i];
				node = new JAXHudListNode(this, obj, beforeNode);
				nodeList.splice(idx, 0, node);
				if (self.OnInsertNode) {
					self.OnInsertNode(idx,obj,node);
				}
				idx++;
			}
		};

		//---------------------------------------------------------------
		//删除节点
		this.removeNode=function(nodeNode)
		{
			var node,idx;
			node=nodeNode;
			idx=nodeList.indexOf(node);
			if(idx<0)
				return;
			if(node===hotNode){
				self.setHotNode(null);
			}
			selNodes.delete(nodeNode);
			nodeList.splice(idx,1);
			if(self.OnFreeNode){
				self.OnFreeNode(node);
			}
			node.freeNode();

		};

		//---------------------------------------------------------------
		//得到节点的序号:
		this.indexOfNode=function(node)
		{
			return nodeList.indexOf(node);
		};

		//---------------------------------------------------------------
		//得到节点的Hud控件:
		this.getNodeHud=function(node,column)
		{
			column=column?column:0;
			return node.columnHuds[column];
		};

		//---------------------------------------------------------------
		//得到Obj对应的节点:
		this.getNodeOfObj=function(obj)
		{
			let idx;
			let isNode = (node) => node.nodeObj===obj;
			idx=nodeList.findIndex(isNode);
			if(idx<0)
				return null;
			return nodeList[idx];
		};

		//---------------------------------------------------------------
		//设置当前高亮节点:
		this.setHotNode=function(nodeNode,addSel=0)
		{
			var node,hud;
			node=nodeNode;
			if(hotNode){
				if(selNodes.has(hotNode)){
					for(hud of hotNode.columnHuds){
						hud.face="selected";
					}
				}else{
					for(hud of hotNode.columnHuds){
						hud.face="normal";
					}
				}
			}
			hotNode=node;
			if(node) {
				if (multi && addSel) {
					selNodes.add(node);
				}else{
					this.clearSelects();
					selNodes.add(node);
				}
				for (hud of hotNode.columnHuds) {
					hud.face = "hot";
				}
			}else{
				if (!multi || !addSel) {
					this.clearSelects();
				}
			}
			if (this.OnHotNodeChange) {
				this.OnHotNodeChange(hotNode);
			}
		};

		//---------------------------------------------------------------
		//清除全部的选中节点
		this.clearSelects=function()
		{
			var node,hud;
			for(node of selNodes){
				for(hud of node.columnHuds){
					hud.face="normal";
				}
			}
			selNodes.clear();
			if(hotNode){
				hotNode.face="hot";
			}
			if(self.OnSelNodeChange){
				self.OnSelNodeChange();
			}
		};

		//---------------------------------------------------------------
		//选中节点
		this.selectNode=function(nodeNode)
		{
			var hud;
			selNodes.add(nodeNode);
			if(nodeNode!==hotNode){
				for(hud of nodeNode.columnHuds){
					hud.face="selected";
				}
				if(self.OnSelNodeChange){
					self.OnSelNodeChange();
				}
			}
		};

		//---------------------------------------------------------------
		//取消选中节点
		this.deselectNode=function(nodeNode)
		{
			var hud;
			selNodes.delete(nodeNode);
			if(nodeNode!==hotNode){
				for(hud of nodeNode.columnHuds){
					hud.face="normal";
				}
				if(self.OnSelNodeChange){
					self.OnSelNodeChange();
				}
			}
		};

		//TODO: 添加移动Node的方法:

		//---------------------------------------------------------------
		//找到一个节点
		this.findNode=function(func)
		{
			var node;
			for(node of nodeList){
				if(func(node)){
					return node;
				}
			}
			return null;
		};

		//---------------------------------------------------------------
		//获得节点的总数:
		this.getNodeNum=function(){
			return nodeList.length;
		};

		//---------------------------------------------------------------
		//获得一个节点的序号:
		this.indexOfNode=function(node){
			return nodeList.indexOf(node);
		};

		//-------------------------------------------------------------------
		//同步控件属性:
		this._syncWebObjAttr=function()
		{
			let webObj,subDiv,list,i,n,node;
			webObj=this.webObj;
			if(!webObj) {
				return;
			}
			subDiv=this.subHudDiv;

			//TODO: 看看要不要逐列更新上下留白

			if(oldNodeGap!==nodeGap){
				list=nodeList;
				n=list.length;
				for(i=0;i<n;i++){
					node=list[i];
					node.webDiv.style.marginBottom=nodeGap+"px";
				}
				oldNodeGap=nodeGap;
			}
			_attrChanged=0;
		};

		//-------------------------------------------------------------------
		//在全部子节点（包含subs）里执行一个函数:
		this.execInTree=function(func){
			var list,i,n,hud;
			list=nodeList;
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

		//---------------------------------------------------------------
		//当控件尺寸发生变化，调用这个函数
		this._sizeChanged=function(){
			let list,i,n,hud;
			list=nodeList;
			n=list.length;
			for(i=0;i<n;i++){
				hud=list[i].hud;
				if(hud.autoLayout){
					hud._doLayout();
				}
			}
			self.OnSizeChanged&&self.OnSizeChanged();
		};

	}
};

JAXHudList.prototype=__Proto;

//***************************************************************************
//属性列表/注册创建函数:
//***************************************************************************
{
	//CSS属性列表
	JAXHudList.jaxPptSet=new Set(Array.from(JAXHudObj.jaxPptSet).concat([
		'rowH','headSpace','endSpace','nodeCSS','columnCSS',
		'OnHotNodeChange','OnAddNode','OnInsertNode','OnSelNodeChange',
		'OnFreeNode','OnMoveNode','multiSelect'
	]));

	//---------------------------------------------------------------------------
	//注册基础Hud类
	JAXHudObj.regHudByType('list', function (env) {
		return new JAXHudList(env);
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
		var div, father, subDiv,i,n,columns,colDiv,offset;
		var headDiv,endDiv;
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

			columns=this.columns=[0];
			if(cssObj.columns && Array.isArray(cssObj.columns)){
				columns=this.columns=columns.concat(cssObj.columns);
			}

			Object.defineProperty(this,'columns',{
				writable:false
			});

			//创建滚动框架div:
			subDiv=this.subHudDiv = document.createElement('div');
			div.appendChild(subDiv);
			subDiv.id="DIVListScroll";
			subDiv.style.position="absolute";
			subDiv.style.left="0px";
			subDiv.style.top="0px";
			subDiv.style.width="100%";
			subDiv.style.height="100%";
			subDiv.style.overflowY="scroll";
			subDiv.style.overflowX="hidden";

			//创建列对应的div:
			offset=0;
			n=columns.length;
			for(i=0;i<n;i++){
				colDiv=document.createElement('div');
				subDiv.appendChild(colDiv);
				colDiv.style.position="absolute";
				colDiv.style.left=offset+"px";
				colDiv.style.top="0px";
				colDiv.style.width=i?columns[i]+"px":"100%";
				colDiv.style.overflowX="hidden";
				colDiv.style.pointerEvents=i?"none":"";

				headDiv=document.createElement('div');
				headDiv.style.position="relative";
				headDiv.style.width="100%";
				colDiv.appendChild(headDiv);

				endDiv=document.createElement('div');
				endDiv.style.position="relative";
				endDiv.style.width="100%";
				colDiv.appendChild(endDiv);

				this.columnDivs[i]=colDiv;
				this.columnHeadDivs[i]=headDiv;
				this.columnEndDivs[i]=endDiv;
				offset+=columns[i];
			}
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
		this.nodes2Add_=cssObj.rows;
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
		this.items2Add_=null;
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
		list=this.nodes2Add_;
		if(Array.isArray(list)){
			this.addNodes(list,null);
		}
		delete this.nodes2Add_;

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

export {JAXHudList};
