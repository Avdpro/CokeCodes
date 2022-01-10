import {JAXEnv,$JXV,$V} from "./JAXEnv.js";
import {JAXHudObj} from "./JAXHudObj.js";
import {jaxHudState} from "./JAXHudState.js";

var JAXHudText,__Proto;

const TXT_ALIGN_LEFT=0;
const TXT_ALIGN_CENTER=1;
const TXT_ALIGN_RIGHT=2;
const TXT_ALIGN_TOP=0;
const TXT_ALIGN_BOTTOM=2;


__Proto=new JAXHudObj();

JAXHudText=function(jaxEnv)
{
	var color,colorEdge,colorShadow;
	var autoSizeW,autoSizeH,ellipsis,wrap,alignH,alignV,select;
	var fntName,fntSize,fntBold,fntItalic,fntUnderline;
	var hasShadow,shdwBlur,shdwX,shdwY;
	var text;
	var textW,textH;
	var _attrChanged;
	var hasNewText;
	var htmlText;
	var signUpdate;
	var cursor=null;
	var self=this;

	JAXHudObj.call(this,jaxEnv);

	var valJXVMap,hudView;
	valJXVMap=this.$valJXVMap;
	hudView=this.hudView;

	this.jaxClassFunc=JAXHudText;

	signUpdate=this.signUpdate;

	color=[128,128,128];
	colorEdge=[0,0,0,1];
	colorShadow=[0,0,0,0.6];

	select=0;
	autoSizeW=0;
	autoSizeH=0;
	ellipsis=0;
	wrap=0;
	alignH=TXT_ALIGN_LEFT;
	alignV=TXT_ALIGN_TOP;

	text="Text";
	htmlText=0;

	hasShadow=0;
	shdwBlur=3;
	shdwX=0;
	shdwY=2;

	fntName=null;
	fntSize=16;
	fntBold=0;
	fntItalic=0;
	fntUnderline=0;
	_attrChanged=0;

	this.innerDiv=null;		//有必要的话，对齐用的内部div

	Object.defineProperty(this,'attrChanged',{
		get:function(){return _attrChanged;},
		set:function(v){_attrChanged=1;},
		enumerable:false
	});

	//***********************************************************************
	//CSS属性:
	//***********************************************************************
	{
		//文本:
		Object.defineProperty(this, 'text', {
			get: function () {
				if(hasNewText){
					this._syncWebObjAttr();
				}
				if(htmlText){
					return this.innerDiv.innerHTML;
				}
				return this.innerDiv.innerText;
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
				if(v!==text){
					text=v;
					hasNewText=1;
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		//文本:
		Object.defineProperty(this, 'htmlText', {
			get: function () {
				return htmlText?1:0;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('htmlText');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('htmlText');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'htmlText', hudView);
						valJXVMap.set('htmlText', v);
					}
					v=v.val;
				}
				if(v!==text){
					htmlText=v?1:0;
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		//自动尺寸:
		Object.defineProperty(this, 'autoSize', {
			get: function () {
				return autoSizeW&&autoSizeH;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('autoSize');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('autoSize');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'autoSize', hudView);
						valJXVMap.set('autoSize', v);
					}
					v=v.val;
				}
				v=v?1:0;
				autoSizeW=v;
				autoSizeH=v;
				_attrChanged = 1;
				signUpdate();
			},
			enumerable: true
		});

		//自动尺寸:
		Object.defineProperty(this, 'autoSizeW', {
			get: function () {
				return autoSizeW;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('autoSizeW');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('autoSizeW');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'autoSizeW', hudView);
						valJXVMap.set('autoSizeW', v);
					}
					v=v.val;
				}
				v=v?1:0;
				if(v!==autoSizeW) {
					autoSizeW = v;
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		//自动尺寸:
		Object.defineProperty(this, 'autoSizeH', {
			get: function () {
				return autoSizeH;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('autoSizeH');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('autoSizeH');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'autoSizeH', hudView);
						valJXVMap.set('autoSizeH', v);
					}
					v=v.val;
				}
				v=v?1:0;
				if(v!==autoSizeH) {
					autoSizeH = v;
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		//文本是否可以选中:
		Object.defineProperty(this, 'select', {
			get: function () {
				return select;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('select');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('select');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'select', hudView);
						valJXVMap.set('select', v);
					}
					v=v.val;
				}
				v=v?1:0;
				if(select!==v){
					select=v;
					_attrChanged = 1;
					signUpdate();
					if(!cursor){
						if(!select){
							self.cursor="default";
						}else{
							self.cursor="text";
						}
					}
				}
			},
			enumerable: true
		});

		//文本是否可以选中:
		Object.defineProperty(this, 'editable', {
			get: function () {
				return select;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('editable');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('editable');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'editable', hudView);
						valJXVMap.set('select', v);
					}
					v=v.val;
				}
				v=v?1:0;
				if(v){
					this.innerDiv.contentEditable=!!v;
				}
			},
			enumerable: true
		});

		//自动换行:
		Object.defineProperty(this, 'wrap', {
			get: function () {
				return wrap;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('wrap');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('wrap');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'wrap', hudView);
						valJXVMap.set('wrap', v);
					}
					v=v.val;
				}
				v=v?1:0;
				if(wrap!==v){
					wrap=v;
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		//省略号:
		Object.defineProperty(this, 'ellipsis', {
			get: function () {
				return ellipsis;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('ellipsis');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('ellipsis');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'ellipsis', hudView);
						valJXVMap.set('ellipsis', v);
					}
					v=v.val;
				}
				v=v?1:0;
				if(ellipsis!==v){
					ellipsis=v;
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		//横向对齐:
		Object.defineProperty(this, 'alignH', {
			get: function () {
				return alignH;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('alignH');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('alignH');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'alignH', hudView);
						valJXVMap.set('alignH', v);
					}
					v=v.val;
				}
				v = v===TXT_ALIGN_LEFT?TXT_ALIGN_LEFT:(v===TXT_ALIGN_RIGHT?TXT_ALIGN_RIGHT:TXT_ALIGN_CENTER);
				if(alignH!==v){
					alignH=v;
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		//横向对齐:
		Object.defineProperty(this, 'alignV', {
			get: function () {
				return alignV;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('alignV');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('alignV');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'alignV', hudView);
						valJXVMap.set('alignV', v);
					}
					v=v.val;
				}
				v = v===TXT_ALIGN_TOP?TXT_ALIGN_TOP:(v===TXT_ALIGN_BOTTOM?TXT_ALIGN_BOTTOM:TXT_ALIGN_CENTER);
				if(alignV!==v){
					alignV=v;
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
					color[0] = v[0];
					color[1] = v[1];
					color[2] = v[2];
				} else if (typeof (v) === 'string') {
					[color[0],color[1],color[2],color[3]]=JAXEnv.parseColor(v);
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

		//文本是否加粗:
		Object.defineProperty(this, 'bold', {
			get: function () {
				return fntBold;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('bold');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('bold');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'bold', hudView);
						valJXVMap.set('bold', v);
					}
					v=v.val;
				}
				if (v!==fntBold) {
					fntBold=v;
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		//文本是否倾斜:
		Object.defineProperty(this, 'italic', {
			get: function () {
				return fntItalic;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('italic');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('italic');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'italic', hudView);
						valJXVMap.set('italic', v);
					}
					v=v.val;
				}
				if (v!==fntItalic) {
					fntItalic=v;
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		//文本是否下划线:
		Object.defineProperty(this, 'underline', {
			get: function () {
				return fntUnderline;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('underline');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('underline');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'underline', hudView);
						valJXVMap.set('underline', v);
					}
					v=v.val;
				}
				if (v!==fntUnderline) {
					fntUnderline=v;
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		//文本本身的宽度
		Object.defineProperty(this, 'textW', {
			get: function () {
				if(_attrChanged){
					this._syncWebObjAttr();
				}
				return textW;
			},
			enumerable: true
		});

		//文本本身的高度
		Object.defineProperty(this, 'textH', {
			get: function () {
				if(_attrChanged){
					this._syncWebObjAttr();
				}
				return textH;
			},
			enumerable: true
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
							this.innerDiv.style.cursor=v;
							this.webObj.style.cursor=v;
						}else{
							if(select){
								this.innerDiv.style.cursor="auto";
								this.webObj.style.cursor = "auto";
							}else {
								this.webObj.style.cursor = "auto";
							}
						}
					}
				}
			},
			enumerable: true,
		});
	}

	//***********************************************************************
	//不会被继承的方法:
	//***********************************************************************
	{
		//设置字体:
		let _setFont=function(){
			var div,style;
			div=self.innerDiv;
			style=self.innerDiv.style;
			style.userSelect=select?"text":"none";
			style.webkitUserSelect=select?"text":"none";
			style.webkitTouchCallout=select?"text":"none";
			if(self.italic) {
				style.fontStyle="italic";
			}else{
				style.fontStyle="normal";
			}
			if(self.bold) {
				style.fontWeight="bold";
			}else{
				style.fontWeight="normal";
			}
			if(fntUnderline){
				style.textDecoration="underline";
			}else{
				style.textDecoration="";
			}
			//fontTxt +=self.fontSize+"px ";
			style.fontSize=self.fontSize+"px";
			if(self.font){
				style.fontFamily=self.font;
			}else{
				style.fontFamily="";
			}
			//div.style.font=fontTxt;
			div.style.color="rgb("+self.color+")";
		};

		//左上角对齐的文本设置:
		let _setText_LeftTop=function(){
			var div,parentElmt,style,offParent;

			div=self.innerDiv;
			style=div.style;
			delete self.webObj.style.display;
			delete self.webObj.style.alignItems;
			style.position="absolute";

			offParent=div.offsetParent;
			if(!offParent) {
				parentElmt = div.parentElement;
				if (parentElmt) {
					parentElmt.removeChild(div);
				}
				self.jaxEnv.textSizeDiv.appendChild(div);
			}

			if(self.wrap){
				style.width=self.w+"px";
				//style.width="100%";
				style.height="";
				style.wordBreak="break-word";
				style.whiteSpace="";
				style.textOverflow="";
				style.alignSelf="";
				style.textAlign="";

			}else{
				delete style.height;
				delete style.alignSelf;
				delete style.textAlign;
				if(ellipsis){
					//style.width="100%";
					style.width=self.w+"px";
					style.whiteSpace="nowrap";
					style.overflow="hidden";
					style.textOverflow="ellipsis";
				}else{
					style.width="";
					style.wordBreak="keep-all";
					style.whiteSpace="nowrap";
					style.textOverflow="";
				}
			}
			if(htmlText) {
				div.innerHTML = text;
			}else{
				div.innerText=text;
			}
			hasNewText=0;
			textW=div.offsetWidth;
			textH=div.offsetHeight;

			if(!offParent) {
				self.jaxEnv.textSizeDiv.removeChild(div);
				if (parentElmt) {
					let next;
					next = parentElmt.firstChild;
					if (next) {
						parentElmt.insertBefore(div, next);
					} else {
						parentElmt.appendChild(div);
					}
				}
			}
			//console.log('textW='+textW+" textH="+textH);
			if(self.autoSizeW) {
				div.style.left = "0px";
				self.w = textW;
			}else {
				switch (alignH) {
					case TXT_ALIGN_LEFT: {
						div.style.left = "0px";
						break;
					}
					case TXT_ALIGN_CENTER: {
						div.style.left = ((self.w - textW) / 2) + "px";
						break;
					}
					case TXT_ALIGN_RIGHT: {
						div.style.left = (self.w - textW) + "px";
						break;
					}
				}
			}
			if(autoSizeH){
				div.style.top="0px";
				self.h=textH;
			}else {

				switch (alignV) {
					case TXT_ALIGN_TOP: {
						div.style.top = "0px";
						break;
					}
					case TXT_ALIGN_CENTER: {
						div.style.top = ((self.h - textH) / 2) + "px";
						break;
					}
					case TXT_ALIGN_BOTTOM: {
						div.style.top = (self.h - textH) + "px";
						break;
					}
				}
			}
		};

		//---------------------------------------------------------------
		//当控件尺寸发生变化，调用这个函数，调整innerDiv位置:
		this._sizeChanged=function(){
			let div,style;
			div=self.innerDiv;
			style=div.style;
			if(self.autoSizeW) {
				div.style.left = "0px";
			}else {
				//处理wrap情况
				if(self.wrap || self.ellipsis) {
					style.width = self.w + "px";
				}
				switch (alignH) {
					case TXT_ALIGN_LEFT: {
						div.style.left = "0px";
						break;
					}
					case TXT_ALIGN_CENTER: {
						div.style.left = ((self.w - textW) / 2) + "px";
						break;
					}
					case TXT_ALIGN_RIGHT: {
						div.style.left = (self.w - textW) + "px";
						break;
					}
				}
			}
			if(autoSizeH){
				div.style.top="0px";
			}else {

				switch (alignV) {
					case TXT_ALIGN_TOP: {
						div.style.top = "0px";
						break;
					}
					case TXT_ALIGN_CENTER: {
						div.style.top = ((self.h - textH) / 2) + "px";
						break;
					}
					case TXT_ALIGN_BOTTOM: {
						div.style.top = (self.h - textH) + "px";
						break;
					}
				}
			}
			self.OnSizeChanged&&self.OnSizeChanged();
		};

		this._syncWebObjAttr=function(){
			let webObj,innerDiv;
			webObj=this.webObj;
			innerDiv=this.innerDiv;
			if(!webObj){
				_attrChanged=0;
				return;
			}
			innerDiv.innerHTML=""+text;

			//设置字体:
			_setFont();

			//设置文本对齐/自动换行等:
			_setText_LeftTop();

			_attrChanged=0;
		};

	}
};

JAXHudText.prototype=__Proto;

//***************************************************************************
//属性列表/注册创建函数:
//***************************************************************************
{
	//CSS属性列表
	JAXHudText.jaxPptSet=new Set(Array.from(JAXHudObj.jaxPptSet).concat([
		'text','htmlText','autoSize','autoSizeW','autoSizeH','wrap','ellipsis','alignH','alignV','select','editable',
		'font','color','fontSize','bold','italic','underline'
	]));

	//---------------------------------------------------------------------------
	//注册基础Hud类
	JAXHudObj.regHudByType('text', function (env) {
		return new JAXHudText(env);
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
			{
				let txtDiv;
				txtDiv=this.webTxtObj = document.createElement('div');
				div.appendChild(txtDiv);
				txtDiv.id="TextDiv";
				this.innerDiv=txtDiv;
				txtDiv.style.cursor="default";
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
		if(this.editable){
			let div=this.innerDiv;
			let self;
			self=this;
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
			div.onkeyup=function(evt){
				if(evt.code==="Enter"){
					if(self.OnUpdate){
						self.OnUpdate();
					}
				}else if(evt.code==="Escape"){
					if(self.OnCancel){
						self.OnCancel();
					}
				}
			};
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
		let aniPose,hudPose;

		hudPose=this.hudPose;
		aniPose=this.aniPose;
		aniPose.x=0;
		aniPose.y=0;
		aniPose.alpha=hudPose.alpha;
		aniPose.scale=hudPose.scale;
		aniPose.rot=hudPose.rot;

		webObj=this.webObj;
		if(webObj) {
			if(this.poseChanged) {
				this._syncWebObj();
			}
			if(this.attrChanged){
				this._syncWebObjAttr();
			}
		}
	};

	//---------------------------------------------------------------
	//开始编辑
	__Proto.startEdit=function(){
		if(this.attrChanged){
			this._syncWebObjAttr();
		}
		if(this.poseChanged) {
			this._syncWebObj();
		}
		this.innerDiv.focus();
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
		this.innerDiv.blur();
	};

	//---------------------------------------------------------------
	//选中全部文本
	__Proto.selectAll=function(){
		if(this.attrChanged){
			this._syncWebObjAttr();
		}
		this.innerDiv.setSelectionRange(0,this.innerDiv.value.length);
	};
	
	//---------------------------------------------------------------
	//控件被点击消息:
	__Proto.OnMouseClick=function(e)
	{
		if(this.isGenEvent){
			if(e.srcElement===this.innerDiv && this.OnClickFunc_) {
				e.stopPropagation();
				this.OnClickFunc_.call(this, e);
			}else if(this.OnTreeClickFunc_){
				e.stopPropagation();
				this.OnTreeClickFunc_.call(this, e);
			}
		}
	};
}

export {JAXHudText};