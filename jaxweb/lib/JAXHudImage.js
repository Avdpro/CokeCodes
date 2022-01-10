import {JAXEnv,$JXV} from "./JAXEnv.js";
import {JAXHudObj} from "./JAXHudObj.js";
import {jaxHudState} from "./JAXHudState.js";

var JAXHudImage,__Proto;


const IMG_ALIGN_LEFT=0;
const IMG_ALIGN_CENTER=1;
const IMG_ALIGN_RIGHT=2;
const IMG_ALIGN_TOP=0;
const IMG_ALIGN_BOTTOM=2;

__Proto=new JAXHudObj();

JAXHudImage=function(jaxEnv)
{
	var imageURL,imagePos,hasImagePos,imageScale;
	var imageObj,imageW,imageH,autoSize,imageLoaded,fitSize;
	var repeatX,repeatY,alignH,alignV;
	var img3x3,img3x3Width;
	var _attrChanged,_imageChanged;
	var signUpdate;
	var self;

	if(!jaxEnv)
		return;
	JAXHudObj.call(this,jaxEnv);

	var valJXVMap,hudView;
	valJXVMap=this.$valJXVMap;
	hudView=this.hudView;

	this.jaxClassFunc=JAXHudImage;

	self=this;

	signUpdate=this.signUpdate;

	imageLoaded=0;
	_imageChanged=0;
	_attrChanged=0;

	img3x3=null;
	img3x3Width=null;
	fitSize=0;
	autoSize=0;
	alignH=IMG_ALIGN_CENTER;
	alignV=IMG_ALIGN_CENTER;
	imageURL="";
	imagePos=[0,0];
	imageScale=1;
	hasImagePos=0;
	repeatX=0;
	repeatY=0;
	imageW=0;
	imageH=0;
	imageObj=new Image();
	imageObj.crossOrigin="anonymous";
	imageObj.onload=function(){
		let webObj,style;
		webObj=self.webObj;
		if(!webObj){
			return;
		}
		style=self.webObj.style;
		imageLoaded=1;
		imageW = imageObj.width;
		imageH = imageObj.height;
		if(img3x3){
			style.backgroundImage="";
			style.borderImageSource="url(" + imageObj.src + ")";
			style.borderImageSlice=img3x3[1]+" "+img3x3[2]+" "+img3x3[3]+" "+img3x3[0]+" fill";
			style.borderImageWidth=img3x3Width[1]+" "+img3x3Width[2]+" "+img3x3Width[3]+" "+img3x3Width[0]+" fill";
			style.borderImageRepeat="stretch";

		}else {
			style.borderImageSource="";
			style.backgroundImage = "url(" + imageObj.src + ")";
			if (autoSize) {
				self.w = imageW;
				self.h = imageH;
			}
			if(!fitSize){
				style.backgroundSize=(imageW*imageScale)+"px "+(imageH*imageScale)+"px";
			}
		}
		if(self.OnImageLoad){
			self.OnImageLoad();
		}
		_imageChanged=1;
	};
	imageObj.onerror=function(){
		let webObj,style;
		webObj=self.webObj;
		if(!webObj){
			return;
		}
		style=self.webObj.style;
		imageLoaded=1;
		style.backgroundImage="";
		imageW=0;
		imageH=0;
		if(self.OnImageError){
			self.OnImageError();
		}
		_imageChanged=1;
	};


	Object.defineProperty(this,'attrChanged',{
		get:function(){return _attrChanged;},
		set:function(v){_attrChanged=1;},
		enumerable:false
	});

	//***********************************************************************
	//CSS属性:
	//***********************************************************************
	{
		//自动尺寸:
		Object.defineProperty(this, 'autoSize', {
			get: function () {
				return autoSize;
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
				if (autoSize!==v) {
					autoSize=v;
				}
				if(autoSize && imageLoaded){
					self.w=imageW;
					self.h=imageH;
				}
				_attrChanged = 1;
				signUpdate();
			},
			enumerable: true
		});

		//使用3x3模式的图片切片参数:
		Object.defineProperty(this, 'img3x3', {
			get: function () {
				return img3x3;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('img3x3');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('img3x3');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'img3x3', hudView);
						valJXVMap.set('img3x3', v);
					}
					v=v.val;
				}
				let url;
				if(Array.isArray((v))){
					if(v.length===1){
						v[1]=v[0];
						v[2]=v[0];
						v[3]=v[0];
					}else if(v.length===2){
						v[2]=v[0];
						v[3]=v[1];
					}
				}else{
					v=[v,v,v,v];
				}
				if (img3x3!==v) {
					img3x3=v;
				}
				if(v && !img3x3Width){
					img3x3Width=v;
				}else if(!v){
					img3x3Width=null;
				}

				//重新设置图片
				url=imageURL;
				imageURL="";
				this.image=url;

				signUpdate();
			},
			enumerable: true
		});

		//使用3x3模式的边框宽度::
		Object.defineProperty(this, 'img3x3Width', {
			get: function () {
				return img3x3Width;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('img3x3Width');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('img3x3Width');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'img3x3Width', hudView);
						valJXVMap.set('img3x3Width', v);
					}
					v=v.val;
				}
				let url;
				if (img3x3Width!==v) {
					img3x3Width=v;
				}
				if(v && !img3x3){
					img3x3=v;
				}else if(!v){
					img3x3=null;
				}

				//重新设置图片
				url=imageURL;
				imageURL="";
				this.image=url;

				signUpdate();
			},
			enumerable: true
		});

		//图片自动适配尺寸:
		Object.defineProperty(this, 'fitSize', {
			get: function () {
				return fitSize;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('fitSize');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('fitSize');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'fitSize', hudView);
						valJXVMap.set('fitSize', v);
					}
					v=v.val;
				}
				if (fitSize!==v) {
					fitSize=v;
				}
				_attrChanged = 1;
				signUpdate();
			},
			enumerable: true
		});

		//横向对齐:
		Object.defineProperty(this, 'alignX', {
			get: function () {
				return alignH;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('alignX');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('alignX');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'alignX', hudView);
						valJXVMap.set('alignX', v);
					}
					v=v.val;
				}
				v = v===IMG_ALIGN_LEFT?IMG_ALIGN_LEFT:(v===IMG_ALIGN_RIGHT?IMG_ALIGN_RIGHT:IMG_ALIGN_CENTER);
				if(alignH!==v){
					alignH=v;
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		//横向对齐:
		Object.defineProperty(this, 'alignY', {
			get: function () {
				return alignV;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('alignY');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('alignY');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'alignY', hudView);
						valJXVMap.set('alignY', v);
					}
					v=v.val;
				}
				v = v===IMG_ALIGN_TOP?IMG_ALIGN_TOP:(v===IMG_ALIGN_BOTTOM?IMG_ALIGN_BOTTOM:IMG_ALIGN_CENTER);
				if(alignV!==v){
					alignV=v;
					_attrChanged = 1;
					signUpdate();
				}
			},
			enumerable: true
		});

		//图片横向重复属性:
		Object.defineProperty(this, 'repeatX', {
			get: function () {
				return autoSize;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('repeatX');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('repeatX');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'repeatX', hudView);
						valJXVMap.set('repeatX', v);
					}
					v=v.val;
				}
				if (repeatX!==v) {
					repeatX=v;
				}
				_attrChanged = 1;
				signUpdate();
			},
			enumerable: true
		});

		//图片纵向重复属性:
		Object.defineProperty(this, 'repeatY', {
			get: function () {
				return autoSize;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('repeatY');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('repeatY');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'repeatY', hudView);
						valJXVMap.set('repeatY', v);
					}
					v=v.val;
				}
				if (repeatY!==v) {
					repeatY=v;
				}
				_attrChanged = 1;
				signUpdate();
			},
			enumerable: true
		});

		//图片:
		Object.defineProperty(this, 'image', {
			get: function () {
				return imageURL;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('image');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('image');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'image', hudView);
						valJXVMap.set('image', v);
					}
					v=v.val;
				}
				if (imageURL!==v) {
					imageURL=v;
				}
				imageLoaded=0;
				imageObj.src=v;
				_attrChanged = 1;
				signUpdate();
			},
			enumerable: true
		});

		//图片的偏移:
		Object.defineProperty(this, 'imgPos', {
			get: function () {
				return imagePos;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('imgPos');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('imgPos');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'imgPos', hudView);
						valJXVMap.set('imgPos', v);
					}
					v=v.val;
				}
				if (Array.isArray(v)) {
					imagePos[0] = v[0];
					imagePos[1] = v[1];
					hasImagePos=1;
				}else{
					hasImagePos=0;
				}
				_attrChanged = 1;
				signUpdate();
			},
			enumerable: true
		});

		//图片的放缩参数:
		Object.defineProperty(this, 'imgScale', {
			get: function () {
				return imageScale;
			},
			set: function (v) {
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('imgScale');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('imgScale');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'imgScale', hudView);
						valJXVMap.set('imgScale', v);
					}
					v=v.val;
				}
				if(v>0 || v<0) {
					if (v !== imageScale) {
						imageScale = v;
						_attrChanged = 1;
						signUpdate();
					}
				}
			},
			enumerable: true
		});

		//图片的实际宽度
		Object.defineProperty(this, 'imgW', {
			get: function () {
				return imageW;
			},
			enumerable: false
		});

		//图片的实际高度:
		Object.defineProperty(this, 'imgH', {
			get: function () {
				return imageH;
			},
			enumerable: false
		});

	}

	//***********************************************************************
	//不会被继承的方法:
	//***********************************************************************
	{
		this._syncWebObjAttr=function()
		{
			let webObj,posText;
			webObj=this.webObj;
			if(!webObj){
				return;
			}
			if(_imageChanged){
				//TODO: Work with image:
				_imageChanged=0;
			}
			webObj.style.backgroundRepeat=(repeatX?"repeat ":"no-repeat ")+(repeatY?"repeat":"no-repeat");
			if(fitSize){
				webObj.style.backgroundSize=(100*imageScale)+"% "+(100*imageScale)+"%";
			}else{
				webObj.style.backgroundSize=(imageW*imageScale)+"px "+(imageH*imageScale)+"px";
			}
			posText=(alignH===IMG_ALIGN_LEFT?"left ":(alignH===IMG_ALIGN_RIGHT?"right ":"center "));
			if(alignH!==IMG_ALIGN_CENTER) {
				posText += "" + imagePos[0] + "px ";
			}
			posText+=(alignV===IMG_ALIGN_TOP?"top ":(alignV===IMG_ALIGN_BOTTOM?"bottom ":"center "));
			if(alignV!==IMG_ALIGN_CENTER) {
				posText += "" + imagePos[1] + "px ";
			}
			webObj.style.backgroundPosition=posText;
			_attrChanged=0;
		}
	}
};

JAXHudImage.prototype=__Proto;

//***************************************************************************
//属性列表/注册创建函数:
//***************************************************************************
{
	//CSS属性列表
	JAXHudImage.jaxPptSet=new Set(Array.from(JAXHudObj.jaxPptSet).concat([
		'autoSize','fitSize','alignH','alignV','repeatX','repeatY','image','imgPos','imgScale',
	]));

	//---------------------------------------------------------------------------
	//注册Hud类
	JAXHudObj.regHudByType('img', function (env) {
		return new JAXHudImage(env);
	});

	//---------------------------------------------------------------------------
	//注册Hud类
	JAXHudObj.regHudByType('image', function (env) {
		return new JAXHudImage(env);
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
			if(this.attrChanged){
				this._syncWebObjAttr();
			}
			if(this.poseChanged) {
				this._syncWebObj();
			}
		}
	};

}

export {JAXHudImage};