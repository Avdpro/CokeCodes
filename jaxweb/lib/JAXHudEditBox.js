import {JAXEnv,$JXV} from "./JAXEnv.js";
import {JAXHudObj} from "./JAXHudObj.js";
import {jaxHudState} from "./JAXHudState.js";

var JAXHudEditBox,__Proto;

__Proto=new JAXHudObj();

JAXHudEditBox=function(jaxEnv)
{
	var self;
	var colorBox,colorBorder;
	var border,borderStyle,coner;
	var text,fntName,fntSize,fntColor;
	var placeHolder="";
	var selectOnFocus=1;
	var spellCheck=1;
	var outline=1;
	var list=null;
	var _attrChanged,_textChanged;
	var signUpdate;

	JAXHudObj.call(this,jaxEnv);

	var valJXVMap,hudView;
	valJXVMap=this.$valJXVMap;
	hudView=this.hudView;

	this.jaxClassFunc=JAXHudEditBox;

	self=this;
	this.webDataList=null;
	this.inputType="text";

	signUpdate=this.signUpdate;

	colorBox=[255,255,255,255];
	colorBorder=[0,0,0,1];
	border=1;
	borderStyle=0;//0:Solid, 1:dashed, 2:dotted, 3:outset...
	coner=0;
	_attrChanged=0;

	fntColor=[0,0,0,1];

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
		Object.defineProperty(this, 'bgColor', {
			get: function () {
				return colorBox;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('bgColor');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('bgColor');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'bgColor', hudView);
						valJXVMap.set('bgColor', v);
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
					//TODO: Code this:
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
					//TODO: Code this:
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

		//文本:
		Object.defineProperty(this, 'text', {
			get: function () {
				if(_textChanged){
					self.webObj.value=text;
					_textChanged=0;
				}else if(self.webObj){
					text=self.webObj.value;
				}
				return text;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('text');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('text');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'text', hudView);
						valJXVMap.set('text', v);
					}
					v=v.val;
				}
				if(self.webObj){
					text=self.webObj.value;
				}
				if(v!==text){
					text=v;
					_textChanged = 1;
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		//文本提示:
		Object.defineProperty(this, 'placeHolder', {
			get: function () {
				return placeHolder;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('placeHolder');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('placeHolder');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'placeHolder', hudView);
						valJXVMap.set('placeHolder', v);
					}
					v=v.val;
				}
				if(v!==placeHolder){
					placeHolder=v;
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		//文本选择:
		Object.defineProperty(this, 'list', {
			get: function () {
				return list;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('list');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('list');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'list', hudView);
						valJXVMap.set('list', v);
					}
					v=v.val;
				}
				//更新选项
				function makeList(){
					let list,option;
					//删除旧选项
					list=self.webDataList;
					option=list.firstChild;
					while(option){
						list.removeChild(option);
						option=list.firstChild;
					}
					//设置新选项:
					v.forEach(function(item){
						option = document.createElement('option');
						option.value = item;
						list.appendChild(option);
					});
				}

				if(v!==list){
					list=v;
					if(v && !this.webDataList){
						//改变为ComboBox模式:
						let newWebObj,oldWebObj,item;
						oldWebObj=self.webObj;
						//创建选项Html节点:
						self.webDataList=document.createElement('datalist');
						self.webDataList.id="@DataList"+jaxEnv.genTimeHash();
						jaxEnv.jaxDiv.appendChild(self.webDataList);
						makeList();

						//创建新的控件，把它插入当前控件前面:
						newWebObj=document.createElement('input');
						self.webObj.parentNode.insertBefore(newWebObj,self.webObj);
						//让控件关联DataList:
						newWebObj.outerHTML='<input list="'+self.webDataList.id+'">';
						newWebObj=self.webObj.previousSibling;

						//复制样式:
						newWebObj.style.cssText=self.webObj.style.cssText;
						newWebObj.id=self.webObj.id;
						newWebObj.value=text;
						newWebObj.placeholder=placeHolder;
						newWebObj.jaxObj=self;

						//移动子控件
						item=oldWebObj.firstChild;
						while(item){
							oldWebObj.removeChild(item);
							newWebObj.appendChild(item);
							item=oldWebObj.firstChild;
						}
						oldWebObj.parentNode.removeChild(oldWebObj);

						//复制消息响应:
						newWebObj.onfocus=oldWebObj.onfocus;
						newWebObj.onblur=oldWebObj.onblur;
						newWebObj.oninput=oldWebObj.oninput;
						newWebObj.onkeyup=oldWebObj.onkeyup;

						this.webObj=newWebObj;
					}else if(!v && self.webDataList){
						//TODO: 隐藏DataList是否可以达到目的？
						self.webDataList.style.display="none";
					}else if(v){
						//DataList已经有了，直接更新选项后展示:
						makeList();
						self.webDataList.style.display="";
					}
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		//字体名字:
		Object.defineProperty(this, 'font', {
			get: function () {
				return fntName;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('font');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('font');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'font', hudView);
						valJXVMap.set('font', v);
					}
					v=v.val;
				}
				if (v!==fntName) {
					fntName=v;
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		//字体颜色:
		Object.defineProperty(this, 'color', {
			get: function () {
				return color;
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
					fntColor[0] = v[0];
					fntColor[1] = v[1];
					fntColor[2] = v[2];
				} else if (typeof (v) === 'string') {
					[fntColor[0],fntColor[1],fntColor[2],fntColor[3]]=JAXEnv.parseColor(v);
				} else if (typeof (v) === 'number') {
					//TODO: Code this:
				}
				_attrChanged = 1;
				signUpdate();
			},
			enumerable: true
		});

		//字体尺寸:
		Object.defineProperty(this, 'fontSize', {
			get: function () {
				return fntSize;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('fontSize');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('fontSize');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'fontSize', hudView);
						valJXVMap.set('fontSize', v);
					}
					v=v.val;
				}
				if (v!==fntSize) {
					fntSize=v;
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		Object.defineProperty(this, 'selectOnFocus', {
			get: function () {
				return selectOnFocus;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('selectOnFocus');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('selectOnFocus');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'selectOnFocus', hudView);
						valJXVMap.set('selectOnFocus', v);
					}
					v=v.val;
				}
				if (v!==selectOnFocus) {
					selectOnFocus=v;
				}
			},
			enumerable: true
		});

		Object.defineProperty(this, 'outline', {
			get: function () {
				return outline;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('outline');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('outline');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'outline', hudView);
						valJXVMap.set('outline', v);
					}
					v=v.val;
				}
				outline=v?1:0;
				if(v){
					this.webObj.style.outlineStyle="auto";
				}else{
					this.webObj.style.outlineStyle="none";
				}
			},
			enumerable: true
		});

		Object.defineProperty(this, 'spellCheck', {
			get: function () {
				return spellCheck;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('spellCheck');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('spellCheck');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'spellCheck', hudView);
						valJXVMap.set('spellCheck', v);
					}
					v=v.val;
				}
				spellCheck=v?1:0;
				this.webObj.spellcheck=!!v;
			},
			enumerable: true
		});

		//选中开始/光标位置
		Object.defineProperty(this,"selectionStart",{
			get: function ()
			{
				if(this.webObj){
					return this.webObj.selectionStart;
				}
				return 0;
			},
			enumerable: true
		});

		//选中结束：
		Object.defineProperty(this,"selectionEnd",{
			get: function ()
			{
				if(this.webObj){
					return this.webObj.selectionEnd;
				}
				return 0;
			},
			enumerable: true
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
				style.backgroundColor="rgba("+colorBox+")";
				style.borderRadius=""+coner+"px";
				if(border!==0) {
					switch (borderStyle) {
						case 0:
						default:
							style.borderStyle = "solid";
							break;
						case 1:
							style.borderStyle = "dashed";
							break;
						case 2:
							style.borderStyle = "dotted";
							break;
					}
					style.borderWidth = "" + border + "px";
				}else{
					style.borderStyle = "none";
					style.borderWidth = "0px";
				}
				style.borderColor="RGBA("+colorBorder+")";

				//Input 相关:
				if(_textChanged) {
					_textChanged = 0;
					webObj.value = text;
				}
				if(placeHolder) {
					webObj.placeholder = placeHolder;
				}
				style.fontSize=fntSize+"px";
				if(fntName){
					style.fontFamily=fntName;
				}else{
					style.fontFamily="";
				}
				style.color="rgb("+fntColor+")";
			}
			_attrChanged=0;
		}
	}
};

JAXHudEditBox.prototype=__Proto;

//***************************************************************************
//属性列表/注册创建函数:
//***************************************************************************
{
	//CSS属性列表
	JAXHudEditBox.jaxPptSet=new Set(Array.from(JAXHudObj.jaxPptSet).concat([
		'bgColor','border','borderStyle','borderColor','coner',
		'text','font','color','fontSize',
		'placeHolder','list',
		'selectOnFocus','outline','spellCheck','inputType',
	]));

	//---------------------------------------------------------------------------
	//注册基础Hud类
	JAXHudObj.regHudByType('edit', function (env) {
		return new JAXHudEditBox(env);
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
		var div, editDiv,father;
		var self=this;
		let jaxEnv=this.jaxEnv;
		let enterKeyTime=0;
		this.removeAllChildren();

		let owner,ownerState;
		father = this.father;
		owner = this.owner;

		if(!this.webObj) {
			div = this.webObj = document.createElement('input');
			div.type=cssObj.inputType||"text";
			div.style.position = cssObj.position||"absolute";
			div.style.boxSizing="border-box";
			father = this.father;
			if (father && father.webObj) {
				father.webObj.appendChild(div);
			}
			div.onfocus=function(){
				if(self.selectOnFocus){
					self.selectAll();
				}
				if(self.OnFocus){
					self.OnFocus();
				}
				console.log("Focus");
			};
			div.onblur=function(){
				if(self.OnBlur){
					self.OnBlur();
				}
				console.log("Blur");
			};
			div.oninput=function(){
				if(self.OnInput){
					self.OnInput();
				}
			};
			div.onchange=function(e){
				let time;
				if(self.OnChange){
					time=Date.now()-enterKeyTime;
					if(time<30) {
						self.OnChange(e);
					}
				}
			};
			div.onkeydown=function(evt){
				if(evt.code==="Enter"){
					enterKeyTime=Date.now();
					if(self.OnUpdate){
						self.OnUpdate();
					}
				}else if(evt.code==="Escape"){
					if(self.OnCancel){
						self.OnCancel();
					}
				}
			};
			div.onkeyup=function(evt){
			};
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

	//---------------------------------------------------------------
	//开始编辑
	__Proto.focus=__Proto.startEdit=function(){
		if(this.attrChanged){
			this._syncWebObjAttr();
		}
		if(this.poseChanged) {
			this._syncWebObj();
		}
		this.webObj.focus();
		if(this.selectOnFocus){
			this.selectAll();
		}
	};

	//---------------------------------------------------------------
	//结束编辑
	__Proto.endEdit=function(){
		if(this.attrChanged){
			this._syncWebObjAttr();
		}
		if(this.poseChanged) {
			this._syncWebObj();
		}
		this.webObj.blur();
	};

	//---------------------------------------------------------------
	//选中全部文本
	__Proto.selectAll=function(){
		if(this.attrChanged){
			this._syncWebObjAttr();
		}
		this.webObj.setSelectionRange(0,this.webObj.value.length);
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
		//释放ComboBox选项:
		if(this.webDataList){
			this.jaxEnv.jaxDiv.removeChild(this.webDataList);
			this.webDataList=null;
		}
	};
}

export {JAXHudEditBox};