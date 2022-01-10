import {JAXEnv,$JXV,$V} from "./JAXEnv.js";
import {JAXHudObj} from "./JAXHudObj.js";
import {jaxHudState} from "./JAXHudState.js";

var JAXHudTree,__Proto;
var JAXHudTreeNode;

//***************************************************************************
//TreeBox里面的一行
//***************************************************************************
{
	JAXHudTreeNode = function (box, obj, intend_, ownerNode)
	{
		var intend,self;

		self=this;
		intend = intend_;
		this.ownerNode=ownerNode;
		this.nodeObj = obj;
		this.jaxEnv = box.jaxEnv;
		this.owner = box;
		this.owner_=box;
		this.hud = null;
		this.webObj = this.webDiv = document.createElement('div');
		box.webObj.appendChild(this.webDiv);
		this.webDiv.id="TreeNode";
		this.webDiv.style.width = "100%";
		this.webDiv.style.position = "relative";
		this.webDiv.style.marginBottom=box.nodeGap+"px";
		//this.webDiv.style.left=(intend*box.intend)+"px";
		this.subIntend=0;
		if(ownerNode) {
			this.intendW = ownerNode.intendW + (ownerNode.subIntend ? ownerNode.subIntend : box.intend);
		}else{
			this.intendW=0;
		}
		this.isOpen=0;
		this.sizeObserver=new ResizeObserver(entries=>{
			let hud;
			hud=entries[0].target;
			self.webDiv.style.height=hud.offsetHeight + "px";
			box.checkScroll();
		});

		Object.defineProperty(this, 'w', {
			get: function () {
				return box.w;
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
				return box.clientW;
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

		Object.defineProperty(this, 'intend', {
			get: function () {
				return intend;
			},
			set: function (v) {
				intend = v;
				this.webDiv.style.left = (intend * box.intend) + "px";
			},
			enumerable: true
		});
	};

	JAXHudTreeNode.prototype = {};
	//---------------------------------------------------------------------------
	//设置Box的内容:
	JAXHudTreeNode.prototype.setItem = function (obj) {
		var hud;
		if(this.hud){
			this.sizeObserver.unobserve(this.hud.webObj);
			this.hud.release();
			hud.owner_=null;
		}
		if (obj.isJAXHudObj_) {
			hud = obj;
			hud.hold();
			hud.owner_=this;
		} else {
			hud = JAXHudObj.createHudByType(obj.type, this.jaxEnv, null, obj, this);
		}
		if (hud) {
			this.hud = hud;
			if (hud.webObj) {
				this.webDiv.appendChild(hud.webObj);
				this.webDiv.style.height = hud.h + "px";
			}
			if(hud.autoLayout){
				hud._doLayout();
			}
			this.sizeObserver.observe(hud.webObj);
		}
	};

	//---------------------------------------------------------------------------
	//用来创建Hud
	JAXHudTreeNode.prototype.appendChild = function (hud) {
		hud.father_ = this;
		hud.hold();
		if (hud.webObj) {
			this.webDiv.appendChild(hud.webObj);
		}
	};

	//---------------------------------------------------------------------------
	//用来创建Hud
	JAXHudTreeNode.prototype.removeChild = function (hud) {
		if (hud.father_ !== this)
			return;
		if (hud.webObj) {
			this.webDiv.removeChild(hud.webObj);
		}
		hud.release();
		hud.father_ = null;
	};

	//---------------------------------------------------------------------------
	//移除Box
	JAXHudTreeNode.prototype.freeNode = function () {
		//回调函数:
		if(this.owner.OnFreeNode){
			this.owner.OnFreeNode(this);
		}
		//移除Node:
		this.owner.subHudDiv.removeChild(this.webDiv);
		this.webDiv = null;
		if (this.hud) {
			this.hud.release();
			this.hud.owner_ = null;
			this.hud = null;
		}
		this.sizeObserver.disconnect();
		this.owner=null;
	};

	//---------------------------------------------------------------------------
	//暂时脱离控件树
	JAXHudTreeNode.prototype.detach = function () {
		this.owner.subHudDiv.removeChild(this.webDiv);
	};

	//---------------------------------------------------------------------------
	//重新加回控件树
	JAXHudTreeNode.prototype.attachBack = function (beforeNode) {
		if(beforeNode){
			this.owner.subHudDiv.insertBefore(this.webDiv,beforeNode.webDiv);
		}else{
			this.owner.subHudDiv.appendChild(this.webDiv);
		}
	};
}

//***************************************************************************
//树结构的Hud控件
//***************************************************************************
__Proto=new JAXHudObj();
JAXHudTree=function(jaxEnv)
{
	var self;
	var nodeCSSFunc;
	var subObjsFunc;
	var selNodes;
	var hotNode;
	var multi;
	var nodeGap;
	var oldNodeGap;
	var headSpace,endSpace;
	var nodeList;
	var signUpdate;
	var intend;
	var oldIntend;
	var colCSSFunc;
	var _attrChanged;
	var showScroll;

	self=this;
	JAXHudObj.call(this,jaxEnv);

	var valJXVMap,hudView;
	valJXVMap=this.$valJXVMap;
	hudView=this.hudView;

	this.clip=1;
	this.jaxClassFunc=JAXHudTree;

	nodeCSSFunc=null;
	subObjsFunc=null;
	selNodes=new Set();
	hotNode=null;
	multi=0;
	intend=30;
	oldIntend=30;
	nodeGap=0;
	oldNodeGap=0;
	headSpace=0;
	endSpace=50;
	this.nodeList_=nodeList=[];
	signUpdate=this.signUpdate;
	showScroll=0;

	this.OnHotNodeChange=null;
	this.OnNodeOpen=null;
	this.OnNodeClose=null;
	this.OnAddNode=null;
	this.OnInsertNode=null;
	this.OnSelNodeChange=null;
	this.OnFreeNode=null;
	this.OnMoveNode=null;

	_attrChanged=0;

	Object.defineProperty(this,'attrChanged',{
		get:function(){return _attrChanged;},
		set:function(v){_attrChanged=1;},
		enumerable:false
	});

	var pxNodeList=new Proxy(nodeList,{
		get:function(obj,pName){
			switch(pName){
				case "indexOf":
				case "every":
				case "filter":
				case "find":
				case "findIndex":
				case "forEach":
					return obj[pName];
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
		//顶部留白:
		Object.defineProperty(this, 'intend', {
			get: function () {
				return intend;
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
				if (v !== intend) {
					intend = v;
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		//---------------------------------------------------------------
		//项目间距:
		Object.defineProperty(this, 'nodeGap', {
			get: function () {
				return nodeGap;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('nodeGap');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('nodeGap');
					}
					if(v.traces!==0) {
						v.trace(this.$stateObj_, this, 'nodeGap', hudView);
						valJXVMap.set('nodeGap', v);
					}
					v=v.val;
				}
				if (v !== nodeGap) {
					nodeGap = v;
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
						v.trace(this.stateObj, this, 'headSpace', hudView);
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
		//获得子节点列表的CSS的函数:
		Object.defineProperty(this,'getSubObjs',{
			get:function(){
				return subObjsFunc;
			},
			set:function(v){
				subObjsFunc=v;
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
				if (v!==hotNode && v instanceof JAXHudTreeNode) {
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

		//控件客户区域宽度
		Object.defineProperty(this, 'clientW', {
			get: function () {
				return this.subHudDiv?this.subHudDiv.clientWidth:this.size[0];
			},
			set: function (v) {
				return v;
			},
			enumerable: true,
			configurable:true
		});
	}

	//***********************************************************************
	//不会被继承的函数:
	//***********************************************************************
	{
		//*******************************************************************
		//节点管理/访问:
		//*******************************************************************
		{
			let pauseSelCallback=0;
			let willOpenNodes=[];
			//---------------------------------------------------------------
			//删除全部滚动控件
			this.clear = this.removeAllNodes = function () {
				let list, i, n, node;
				hotNode = null;
				n=selNodes.size;
				selNodes.clear();
				if(n>0){
					if(!pauseSelCallback) {
						this.OnSelNodeChange && this.OnSelNodeChange();
					}
				}
				list = nodeList;
				n = list.length;
				for (i = 0; i < n; i++) {
					node = list[i];
					//this.subHudDiv.removeChild(node.webDiv);
					node.freeNode();
				}
				list.splice(0);
				this.checkScroll();
			};

			//---------------------------------------------------------------
			//在指定节点下添加节点，如果指定节点不存在，则添加根节点
			this.addNode = function (obj, upNode, hud) {
				let node, idx, css, i, n, intend, nextNode;
				//添加一个节点，先看看有没有父节点:
				if (!upNode) {
					//添加根节点
					node = new JAXHudTreeNode(this, obj, 0, null);
					this.subHudDiv.insertBefore(node.webDiv, this.endSpaceDiv);
					css = hud ? hud : nodeCSSFunc(obj, node, this);
					node.setItem(css);
					nodeList.push(node);
					if (this.OnAddNode) {
						this.OnAddNode(obj, node, hud, upNode);
					}
					return node;
				}

				//在指定父节点下面添加子控件:
				idx = nodeList.indexOf(upNode);
				if (idx < 0) {
					return this.addNode(obj, null, hud);
				}
				intend = upNode.intend + 1;
				n = nodeList.length;
				findIdx:{
					for (i = idx + 1; i < n; i++) {
						if (nodeList[i].intend < intend) {
							idx = i;
							break findIdx;
						}
					}
					idx = -1;
				}

				//插入Node:
				nextNode = nodeList[idx];
				node = new JAXHudTreeNode(this, obj, intend, upNode);
				if (nextNode) {
					nodeList.splice(idx, 0, node);
					this.subHudDiv.insertBefore(node.webDiv, nextNode.webDiv);
				} else {
					nodeList.push(node);
					this.subHudDiv.insertBefore(node.webDiv, this.endSpaceDiv);
				}
				css = hud ? hud : nodeCSSFunc(obj, node, this);
				node.setItem(css);
				if (this.OnAddNode) {
					this.OnAddNode(obj, node, upNode);
				}
				return node;
			};

			//---------------------------------------------------------------
			//在指定节点下添加一组节点，如果指定节点不存在，则添加到根节点
			this.addNodes = function (list, upNode) {
				let node, idx, css, obj, i, n, intend, nextNode,openNodes;
				node=null;
				//添加一个节点，先看看有没有父节点:
				if (!upNode) {
					//添加根节点
					n = list.length;
					for (i = 0; i < n; i++) {
						obj = list[i];
						if(obj===true){//刚刚加入的节点要打开
							if(node){
								this.openNode(node);
							}
						}else {
							node = new JAXHudTreeNode(this, obj, 0, upNode);
							this.subHudDiv.insertBefore(node.webDiv, this.endSpaceDiv);
							css = nodeCSSFunc(obj, node, this);
							node.setItem(css);
							nodeList.push(node);
							if (this.OnAddNode) {
								this.OnAddNode(obj, node, upNode);
							}
						}
					}
					return;
				}

				//在指定父节点下面添加子控件:
				idx = nodeList.indexOf(upNode);
				if (idx < 0) {
					return this.addNodes(list, null);
				}
				intend = upNode.intend + 1;
				n = nodeList.length;
				findIdx:{
					for (i = idx + 1; i < n; i++) {
						if (nodeList[i].intend !== intend) {
							idx = i;
							break findIdx;
						}
					}
					idx = -1;
				}

				node=null;
				willOpenNodes.splice(0);
				//插入Node:
				nextNode = nodeList[idx];
				n = list.length;
				for (i = 0; i < n; i++) {
					obj = list[i];
					if(obj===true){
						if(node) {
							willOpenNodes.push(node);
						}
					}else {
						node = new JAXHudTreeNode(this, obj, intend, upNode);
						if (nextNode) {
							nodeList.splice(idx, 0, node);
							this.subHudDiv.insertBefore(node.webDiv, nextNode.webDiv);
						} else {
							nodeList.push(node);
							this.subHudDiv.insertBefore(node.webDiv, this.endSpaceDiv);
						}
						css = nodeCSSFunc(obj, node, this);
						node.setItem(css);
						idx++;
						if (this.OnAddNode) {
							this.OnAddNode(obj, node, upNode);
						}
					}
				}
				n=willOpenNodes.length;
				for(i=0;i<n;i++){
					this.openNode(willOpenNodes[i]);
				}
				willOpenNodes.splice(0);
			};

			//---------------------------------------------------------------
			//在指定节点(upNode)下的指定子节点位置(idx)插入对象为obj的一个节点,
			this.insertNode = function (idx, obj, upNode, hud) {
				let node, css, i, n, intend, nextNode, stIdx, atIdx, cnt;
				//添加一个节点，先看看有没有父节点:
				if (!upNode) {
					//添加根节点
					nextNode = nodeList[idx];
					node = new JAXHudTreeNode(this, obj, 0, null);
					if (!nextNode) {
						this.subHudDiv.insertBefore(node.webDiv, this.endSpaceDiv);
						nodeList.push(node);
					} else {
						this.subHudDiv.insertBefore(node.webDiv, nextNode.webDiv);
						nodeList.splice(idx, 0, node);
					}
					css = hud ? hud : nodeCSSFunc(obj, node, this);
					node.setItem(css);
					if (this.OnInsertNode) {
						this.OnInsertNode(idx, obj, node, upNode);
					}
					return node;
				}

				//在指定父节点下面添加子控件:
				stIdx = nodeList.indexOf(upNode);
				if (stIdx < 0) {
					return this.insertNode(idx, obj, null, hud);
				}
				if (!upNode.isOpen) {
					this.openNode(upNode);
				}
				intend = upNode.intend + 1;
				n = nodeList.length;
				cnt = 0;
				if (idx > 0) {
					findIdx:{
						for (i = stIdx + 1; i < n; i++) {
							if (nodeList[i].intend === intend) {
								cnt++;
								if (cnt === idx + 1) {
									atIdx = i;
									break findIdx;
								}
							}
							if (nodeList[i].intend < intend) {
								atIdx = i;
								break findIdx;
							}
						}
						atIdx = i;
					}
				} else {
					atIdx = stIdx + 1;
				}

				//插入Node:
				nextNode = nodeList[atIdx];
				node = new JAXHudTreeNode(this, obj, intend, upNode);
				if (nextNode) {
					nodeList.splice(atIdx, 0, node);
					this.subHudDiv.insertBefore(node.webDiv, nextNode.webDiv);
				} else {
					nodeList.push(node);
					this.subHudDiv.insertBefore(node.webDiv, this.endSpaceDiv);
				}
				css = hud ? hud : nodeCSSFunc(obj, node, this);
				node.setItem(css);
				if (this.OnInsertNode) {
					this.OnInsertNode(idx, obj, node, upNode);
				}
				return node;
			};

			//---------------------------------------------------------------
			//在指定节点前的位置插入对象为obj的一个同级节点,
			this.insertNodeBefore = function (obj, beforeNode, hud) {
				let idx,upNode,node, css, i, n, intend, nextNode, stIdx, atIdx, cnt;
				//添加一个节点，先看看有没有父节点:
				upNode=beforeNode.ownerNode;
				nextNode=beforeNode;
				idx=nodeList.indexOf(beforeNode);
				if (!upNode) {
					//添加根节点
					node = new JAXHudTreeNode(this, obj, 0, null);
					if (!nextNode) {
						this.subHudDiv.insertBefore(node.webDiv, this.endSpaceDiv);
						nodeList.push(node);
					} else {
						this.subHudDiv.insertBefore(node.webDiv, nextNode.webDiv);
						nodeList.splice(idx, 0, node);
					}
					css = hud ? hud : nodeCSSFunc(obj, node, this);
					node.setItem(css);
					if (this.OnInsertNode) {
						this.OnInsertNode(idx, obj, node, upNode);
					}
					return node;
				}

				intend = upNode.intend + 1;

				//插入Node:
				node = new JAXHudTreeNode(this, obj, intend, upNode);
				if (nextNode) {
					nodeList.splice(idx, 0, node);
					this.subHudDiv.insertBefore(node.webDiv, nextNode.webDiv);
				} else {
					nodeList.push(node);
					this.subHudDiv.insertBefore(node.webDiv, this.endSpaceDiv);
				}
				css = hud ? hud : nodeCSSFunc(obj, node, this);
				node.setItem(css);
				if (this.OnInsertNode) {
					this.OnInsertNode(idx, obj, node, upNode);
				}
				return node;
			};

			//---------------------------------------------------------------
			//替换节点
			this.replaceNode = function (newNodeObj, oldNode, hud) {
				let idx, ownerNode, intend, node, css;
				idx = nodeList.indexOf(oldNode);
				if (idx < 0) {
					//TODO:
					throw "Old node is not in tree!.";
				}
				ownerNode = oldNode.ownerNode;
				intend = ownerNode.intend + 1;
				node = new JAXHudTreeNode(this, newNodeObj, intend, ownerNode);
				this.subHudDiv.insertBefore(node.webDiv, oldNode.webDiv);
				css = hud ? hud : nodeCSSFunc(newNodeObj, node, this);
				node.setItem(css);
				if (oldNode === hotNode) {
					this.setHotNode(node);
				}
				if (selNodes.has(oldNode)) {
					selNodes.delete(oldNode);
					selNodes.add(node);
					node.hud.showFace("selected");
					if(!pauseSelCallback) {
						this.OnSelNodeChange && this.OnSelNodeChange();
					}
				}
				nodeList.splice(idx, 1, node);
				oldNode.freeNode();
				this.checkScroll();
				return node;
			};

			//---------------------------------------------------------------
			//删除节点
			this.removeNode = function (nodeNode) {
				var node, idx;
				node = nodeNode;
				idx = nodeList.indexOf(node);
				if (idx < 0)
					return;
				if (node === hotNode) {
					this.setHotNode(null);
				}
				this.closeNode(nodeNode);
				if(selNodes.has(nodeNode)) {
					selNodes.delete(nodeNode);
					if(!pauseSelCallback) {
						this.OnSelNodeChange && this.OnSelNodeChange();
					}
				}
				nodeList.splice(idx, 1);
				node.freeNode();
				this.checkScroll();
			};

			//---------------------------------------------------------------
			//得到节点的Hud控件:
			this.getNodeHud = function (node) {
				return node.hud;
			};

			//---------------------------------------------------------------
			//得到Obj对应的节点:
			this.getNodeOfObj = function (obj) {
				let idx;
				let isNode = (node) => node.nodeObj === obj;
				idx = nodeList.findIndex(isNode);
				if (idx < 0)
					return null;
				return nodeList[idx];
			};

			//---------------------------------------------------------------
			//打开一个节点:
			this.openNode = function (nodeNode) {
				let list, obj, nodeObj;
				if (!subObjsFunc)
					return;
				if (nodeNode.isOpen)
					return;
				nodeObj = nodeNode.nodeObj;
				list = subObjsFunc(nodeObj, nodeNode);
				if (!Array.isArray(list) || !list.length) {
					nodeNode.isOpen = 1;
					nodeNode.hud.showFace("open");
					return;
				}
				nodeNode.isOpen = 1;
				this.addNodes(list, nodeNode);
				nodeNode.hud.showFace("open");
			};

			//---------------------------------------------------------------
			//关闭一个节点:
			this.closeNode = function (nodeNode) {
				let idx, node, n, intend;
				n = nodeList.length;
				node = nodeNode;
				idx = nodeList.indexOf(node);
				if (idx < 0)
					return;
				nodeNode.isOpen = 0;
				nodeNode.hud.showFace("close");
				intend = node.intend + 1;
				idx += 1;
				node = nodeList[idx];
				if (!node || node.intend !== intend) {
					//没有打开
					return;
				}
				for (; idx < n; idx++) {
					node = nodeList[idx];
					if (node && node.intend >= intend) {
						nodeList.splice(idx, 1);
						if (node === hotNode) {
							this.setHotNode(null);
						}
						if(selNodes.has(node)) {
							selNodes.delete(node);
							if(!pauseSelCallback) {
								this.OnSelNodeChange && this.OnSelNodeChange();
							}
						}
						node.freeNode();
						idx--;
						n--;
					} else {
						this.checkScroll();
						return;
					}
				}
				this.checkScroll();
			};

			//---------------------------------------------------------------
			//设置当前高亮节点:
			this.setHotNode = function (node,addSel=0) {
				if (node === hotNode) {
					return;
				}
				if (hotNode) {
					if (selNodes.has(hotNode)) {
						hotNode.hud.face = "selected";
					} else {
						hotNode.hud.face = "normal";
					}
				}
				hotNode = node;
				if (node) {
					if (multi && addSel) {
						selNodes.add(node);
						if(!pauseSelCallback) {
							this.OnSelNodeChange && this.OnSelNodeChange();
						}
					} else {
						pauseSelCallback++;
						this.clearSelects();
						pauseSelCallback--;
						selNodes.add(node);
						if(!pauseSelCallback) {
							this.OnSelNodeChange && this.OnSelNodeChange();
						}
					}
					node.hud.face = "hot";
				} else {
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
			this.clearSelects = function () {
				var node;
				for (node of selNodes) {
					node.hud.face = "normal";
				}
				if(selNodes.size>0) {
					selNodes.clear();
					if (hotNode) {
						hotNode.face = "hot";
					}
					if(!pauseSelCallback){
						this.OnSelNodeChange&&this.OnSelNodeChange();
					}
				}
			};

			//---------------------------------------------------------------
			//选中节点
			this.selectNode = function (nodeNode) {
				selNodes.add(nodeNode);
				if (nodeNode !== hotNode) {
					nodeNode.hud.face = "selected";
				}
				if(!pauseSelCallback){
					this.OnSelNodeChange&&this.OnSelNodeChange();
				}
			};

			//---------------------------------------------------------------
			//取消选中节点
			this.deselectNode = function (nodeNode) {
				if(selNodes.has(nodeNode)) {
					selNodes.delete(nodeNode);
					if (nodeNode !== hotNode) {
						nodeNode.hud.face = "normal";
					}
					if(!pauseSelCallback){
						this.OnSelNodeChange&&this.OnSelNodeChange();
					}
				}
			};

			//---------------------------------------------------------------
			//节点是否被选中
			this.isNodeSelected=function(node){
				return selNodes.has(node);
			};

			//---------------------------------------------------------------
			//找到一个节点
			this.findNode = function (func) {
				var node;
				for (node of nodeList) {
					if (func(node)) {
						return node;
					}
				}
				return null;
			};

			//---------------------------------------------------------------
			//获得节点的总数:
			this.getNodeNum = function () {
				return nodeList.length;
			};

			//---------------------------------------------------------------
			//获得一个节点的序号:
			this.indexOfNode = function (node) {
				return nodeList.indexOf(node);
			};

			//---------------------------------------------------------------
			//向上移动一个节点:
			this.moveNodeUp = function (node) {
				var idx, intend, preNode, preIdx, isOpen;
				var nxtIdx, nxtNode;
				idx = nodeList.indexOf(node);
				preIdx = idx - 1;
				nxtIdx = idx + 1;
				preNode = nodeList[preIdx];
				if (!preNode) {
					return 0;
				}
				isOpen = node.isOpen;
				intend = node.intend;
				//移动的节点先关闭
				this.closeNode(node);
				while (preNode.intend > intend) {
					preIdx--;
					preNode = nodeList[preIdx];
				}
				if (preNode.intend !== intend) {
					return 0;
				}
				node.detach();
				nodeList.splice(idx, 1);
				node.attachBack(preNode);
				nodeList.splice(preIdx, 0, node);
				//把子节点也上移
				if (isOpen) {
					nxtNode = nodeList[nxtIdx];
					while (nxtNode && nxtNode.intend > intend) {
						preIdx += 1;
						nxtNode.detach();
						nodeList.splice(nxtIdx, 1);
						nxtNode.attachBack(node);
						nodeList.splice(preIdx, 0, nxtNode);
						node = nxtNode;
						nxtIdx += 1;
						nxtNode = nodeList[nxtIdx];
					}
				}
				if(this.OnMoveNode){
					this.OnMoveNode();
				}
				return 1;
			};

			//---------------------------------------------------------------
			//在全部子节点（包含subs）里执行一个函数:
			this.execInTree = function (func) {
				var list, i, n, node, hud;
				list = nodeList;
				n = list.length;
				for (i = 0; i < n; i++) {
					hud = list[i].hud;
					if (hud && func(hud)) {
						return;
					}
				}
				list = this.chdHudList_;
				n = list.length;
				for (i = 0; i < n; i++) {
					if (func(list[i])) {
						return;
					}
				}
			};
		}

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


		//---------------------------------------------------------------
		//CheckScroll
		this.checkScroll=function(){
			var div,h;
			div=this.endSpaceDiv;
			h=div.offsetTop+div.offsetHeight;
			if(h>this.webObj.offsetHeight){
				if(!showScroll){
					this.subHudDiv.style.overflowX="hidden";
					this.subHudDiv.style.overflowY="scroll";
					showScroll=1;
					this._sizeChanged();
				}
			}else if(showScroll){
				this.subHudDiv.style.overflowX="hidden";
				this.subHudDiv.style.overflowY="hidden";
				showScroll=0;
				this.subHudDiv.scrollTop=0;
				this._sizeChanged();
			}
		};

		//---------------------------------------------------------------
		//同步控件属性:
		this._syncWebObjAttr = function () {
			let webObj, subDiv, list, i, n, node;
			webObj = this.webObj;
			if (!webObj) {
				return;
			}
			subDiv = this.subHudDiv;
			this.endSpaceDiv.style.height = this.endSpace + "px";
			this.headSpaceDiv.style.height = this.headSpace + "px";
			this.checkScroll();
			if (oldNodeGap !== nodeGap) {
				list = nodeList;
				n = list.length;
				for (i = 0; i < n; i++) {
					node = list[i];
					node.webDiv.style.marginBottom = nodeGap + "px";
				}
				oldNodeGap = nodeGap;
			}
			if (oldIntend !== intend) {
				list = nodeList;
				n = list.length;
				for (i = 0; i < n; i++) {
					node = list[i];
					node.intend = intend;
				}
				oldIntend = intend;
			}
			_attrChanged = 0;
		};

	}
};

JAXHudTree.prototype=__Proto;

//***************************************************************************
//属性列表/注册创建函数:
//***************************************************************************
{
	//CSS属性列表
	JAXHudTree.jaxPptSet=new Set(Array.from(JAXHudObj.jaxPptSet).concat([
		'intend','nodeGap','headSpace','endSpace','nodeCSS','getSubObjs','multiSelect',
		'OnHotNodeChange','OnNodeOpen','OnNodeClose','OnAddNode','OnInsertNode','OnSelNodeChange',
		'OnFreeNode','OnMoveNode',
	]));

	//---------------------------------------------------------------------------
	//注册基础Hud类
	JAXHudObj.regHudByType('tree', function (env) {
		return new JAXHudTree(env);
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
		var div, father, subDiv;
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
			subDiv=this.subHudDiv = document.createElement('div');
			div.appendChild(subDiv);
			subDiv.style.position="absolute";
			subDiv.style.left="0px";
			subDiv.style.top="0px";
			subDiv.style.width="100%";
			subDiv.style.height="100%";
			subDiv.style.overflowY="hidden";
			subDiv.style.overflowX="hidden";

			this.headSpaceDiv = document.createElement('div');
			this.headSpaceDiv.style.position="relative";
			this.headSpaceDiv.style.width="100%";
			subDiv.appendChild(this.headSpaceDiv);

			this.endSpaceDiv = document.createElement('div');
			this.endSpaceDiv.style.position="relative";
			this.endSpaceDiv.style.width="100%";
			subDiv.appendChild(this.endSpaceDiv);
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
		this.nodes2Add_=cssObj.nodes;
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

export {JAXHudTree};
