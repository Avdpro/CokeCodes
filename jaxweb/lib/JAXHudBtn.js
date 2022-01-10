import {JAXEnv,$JXV} from "./JAXEnv.js";
import {JAXHudObj} from "./JAXHudObj.js";
import {jaxHudState} from "./JAXHudState.js";

var JAXHudBtn,__Proto;

const STATE_NA=-1;
const STATE_UP=0;
const STATE_DOWN=1;
const STATE_OVER=2;
const STATE_GRAY=3;

__Proto=new JAXHudObj();

JAXHudBtn=function(jaxEnv)
{
	var curBtnState,curBtnHud,drag;
	var signUpdate;

	JAXHudObj.call(this,jaxEnv);

	var valJXVMap,hudView;
	valJXVMap=this.$valJXVMap;
	hudView=this.hudView;

	drag=0;

	this.jaxClassFunc=JAXHudBtn;

	signUpdate=this.signUpdate;

	curBtnState=-1;
	curBtnHud=null;
	this.isPenDown=0;
	this.isPenIn=0;

	this.OnMouseMoveBinded=this.OnMouseMove.bind(this);
	this.OnMouseDownBinded=this.OnMouseDown.bind(this);
	this.OnMouseUpBinded=this.OnMouseUp.bind(this);

	this.OnMouseOverBinded=this.OnMouseOver.bind(this);
	this.OnMouseOutBinded=this.OnMouseOut.bind(this);

	this.OnMouseOver2Binded=this.OnMouseOver2.bind(this);
	this.OnMouseOut2Binded=this.OnMouseOut2.bind(this);

	this.OnButtonDown=null;
	this.OnButtonUp=null;

	this.hudBtnUp_=null;
	this.hudBtnDown_=null;
	this.hudBtnGray_=null;
	this.hudBtnOver_=null;
	this.enabled_=1;

	this.isDragging=0;

	Object.defineProperty(this, 'hudBtnUp_', {enumerable:false,writable:true});
	Object.defineProperty(this, 'hudBtnDown_', {enumerable:false,writable:true});
	Object.defineProperty(this, 'hudBtnGray_', {enumerable:false,writable:true});
	Object.defineProperty(this, 'hudBtnOver_', {enumerable:false,writable:true});
	Object.defineProperty(this, 'enabled_', {enumerable:false,writable:true});


	//***********************************************************************
	//CSS属性:
	//***********************************************************************
	{
		//设置按键抬起状态:
		Object.defineProperty(this, 'hudBtnUp', {
			get: function () {
				return this.hudBtnUp_;
			},
			set: function (v) {
				var hud;
				if(this.hudBtnUp_){
					hud=this.hudBtnUp_.release();
				}
				if(v) {
					if (v.isJAXHudObj_) {
						//直接设置Hud控件
						this.hudBtnUp_ = v;
						v.hold();
					} else if (v.type) {
						//创建Hud控件:
						hud = JAXHudObj.createHudByType(v.type, this.jaxEnv, null, v, this);
						this.hudBtnUp_ = hud;
					}
				}else{
					this.hudBtnUp_ = null;
				}
				if(curBtnState===STATE_UP){
					this.state=STATE_NA;
					this.state=STATE_UP;
				}
				signUpdate();
			},
			enumerable: true
		});

		//设置按键按下状态:
		Object.defineProperty(this, 'hudBtnDown', {
			get: function () {
				return this.hudBtnDown_;
			},
			set: function (v) {
				var hud;
				if(this.hudBtnDown_){
					this.hudBtnDown_.release();
				}
				if(v) {
					if (v.isJAXHudObj_) {
						//直接设置Hud控件
						hud = this.hudBtnDown_ = v;
						v.hold();
					} else if (v.type) {
						//创建Hud控件:
						hud = JAXHudObj.createHudByType(v.type, this.jaxEnv, null, v, this);
						this.hudBtnDown_ = hud;
					}
				}else{
					this.hudBtnDown_ = null;
				}
				if(curBtnState===STATE_DOWN){
					this.state=STATE_NA;
					this.state=STATE_DOWN;
				}
				signUpdate();
			},
			enumerable: true
		});

		//设置按置灰状态:
		Object.defineProperty(this, 'hudBtnGray', {
			get: function () {
				return this.hudBtnGray_;
			},
			set: function (v) {
				var hud;
				if(this.hudBtnGray_){
					this.hudBtnGray_.release();
				}
				if(v) {
					if (v.isJAXHudObj_) {
						//直接设置Hud控件
						this.hudBtnGray_ = v;
						v.hold();
					} else if (v.type) {
						//创建Hud控件:
						hud = JAXHudObj.createHudByType(v.type, this.jaxEnv, null, v, this);
						this.hudBtnGray_ = hud;
					}
				}else{
					this.hudBtnGray_ = null;
				}
				if(curBtnState===STATE_GRAY){
					this.state=STATE_NA;
					this.state=STATE_GRAY;
				}
				signUpdate();
			},
			enumerable: true
		});

		//设置按键鼠标悬浮状态:
		Object.defineProperty(this, 'hudBtnOver', {
			get: function () {
				return this.hudBtnOver_;
			},
			set: function (v) {
				var hud;
				if(this.hudBtnOver_){
					this.hudBtnOver_.release();
				}
				if(v) {
					if (v.isJAXHudObj_) {
						//直接设置Hud控件
						hud = this.hudBtnOver_ = v;
						v.hold();
					} else {
						//创建Hud控件:
						hud = JAXHudObj.createHudByType(v.type, this.jaxEnv, null, v, this);
						this.hudBtnOver_ = hud;
					}
				}else{
					this.hudBtnOver_ = null;
				}
				if(hud){
					this.webObj.addEventListener('mouseover', this.OnMouseOver2Binded, true);
					this.webObj.addEventListener('mouseleave', this.OnMouseOut2Binded, true);
				}else{
					this.webObj.removeEventListener('mouseover', this.OnMouseOver2Binded, true);
					this.webObj.removeEventListener('mouseleave', this.OnMouseOut2Binded, true);
				}
				if(curBtnState===STATE_OVER){
					this.state=STATE_NA;
					this.state=STATE_OVER;
				}
				signUpdate();
			},
			enumerable: true
		});

		//按钮是否置灰:
		Object.defineProperty(this,'enable',{
			get:function(){
				return this.enabled_;
			},
			set:function(v){
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('enable');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('enable');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'enable', hudView);
						valJXVMap.set('enable', v);
					}
					v=v.val;
				}
				v=v?1:0;
				if(v===this.enabled_){
					return;
				}
				this.enabled_=v;
				this.isPenDown=0;
				if(v) {
					this.state = STATE_UP;
				}else{
					this.state = STATE_GRAY;
					this.isPenDown = 0;
				}
			},
			enumerable:true
		});

		//按钮的当前状态
		Object.defineProperty(this,'state',{
			get:function(){
				return curBtnState;
			},
			set:function(v){
				var firstWebChd,stateHud,face;
				if(v===curBtnState){
					return;
				}
				switch(v){
					case STATE_UP:
					default:
						curBtnState=STATE_UP;
						stateHud=this.hudBtnUp_;
						face="up";
						break;
					case STATE_DOWN:
						curBtnState=STATE_DOWN;
						stateHud=this.hudBtnDown_;
						face="down";
						break;
					case STATE_OVER:
						curBtnState=STATE_OVER;
						stateHud=this.hudBtnOver_;
						face="over";
						break;
					case STATE_GRAY:
						curBtnState=STATE_GRAY;
						stateHud=this.hudBtnGray_;
						face="gray";
						break;
					case STATE_NA: {
						curBtnState=STATE_NA;
						if(this.webObj) {
							if (curBtnHud && curBtnHud.webObj) {
								this.webObj.removeChild(curBtnHud.webObj);
							}
							curBtnHud=null;
						}
						return;
					}
				}
				if(!stateHud){
					stateHud=this.hudBtnUp_;
				}
				if(this.webObj) {
					if (curBtnHud && curBtnHud.webObj) {
						this.webObj.removeChild(curBtnHud.webObj);
					}
					firstWebChd=this.webObj.firstChild;
					if (stateHud) {
						curBtnHud=stateHud;
						if (stateHud.webObj) {
							if (firstWebChd) {
								this.webObj.insertBefore(stateHud.webObj, firstWebChd);
							} else {
								this.webObj.appendChild(stateHud.webObj);
							}
						}
					}else{
						curBtnHud=null;
					}
				}
				if(face){
					this.showFace(face);
				}
			},
			enumerable:false
		});

		//按钮是否支持拖拽:
		Object.defineProperty(this,'drag',{
			get:function(){
				return drag;
			},
			set:function(v){
				if(v instanceof $JXV){
					let oldV;
					oldV = valJXVMap.get('enable');
					if (oldV) {
						oldV.untrace();
						valJXVMap.delete('enable');
					}
					if(v.traces!==0) {
						v.trace(this.stateObj, this, 'enable', hudView);
						valJXVMap.set('enable', v);
					}
					v=v.val;
				}
				v=v===2?2:(v?1:0);
				drag=v;
			},
			enumerable:true
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
				}
				if(this.isLabel){
					if (this.webObj) {
						this.webObj.onclick = v?function(e){self.OnMouseClick(e);}:null;
					}
				}
			},
			enumerable: true,
			configurable:true,
		});
	}

	//***********************************************************************
	//不会被继承的方法:
	//***********************************************************************
	{
		this._sizeChanged=function(){
			let hud;
			hud=this.hudBtnUp_;
			if(hud && hud.autoLayout){
				hud._doLayout();
			}
			hud=this.hudBtnDown_;
			if(hud && hud.autoLayout){
				hud._doLayout();
			}
			hud=this.hudBtnOver_;
			if(hud && hud.autoLayout){
				hud._doLayout();
			}
			hud=this.hudBtnGray_;
			if(hud && hud.autoLayout){
				hud._doLayout();
			}
			this.OnSizeChanged&&this.OnSizeChanged();
		};

		this._syncWebObjAttr=function(){
			//TODO: Code this:
		};

		//-------------------------------------------------------------------
		//在全部子节点（包含subs）里执行一个函数:
		this.execInTree=function(func){
			var list,i,n,hud;
			hud=this.hudBtnUp_;
			if(hud){
				if(func(hud)){
					return;
				}
			}
			hud=this.hudBtnDown_;
			if(hud){
				if(func(hud)){
					return;
				}
			}
			hud=this.hudBtnOver_;
			if(hud){
				if(func(hud)){
					return;
				}
			}
			hud=this.hudBtnGray_;
			if(hud){
				if(func(hud)){
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

JAXHudBtn.prototype=__Proto;

//***************************************************************************
//属性列表/注册创建函数:
//***************************************************************************
{
	//CSS属性列表
	JAXHudBtn.jaxPptSet=new Set(Array.from(JAXHudObj.jaxPptSet).concat([
		'hudBtnDown','hudBtnUp','hudBtnGray','hudBtnOver','enable','drag',
		'OnButtonDown','OnButtonUp'
	]));

	//---------------------------------------------------------------------------
	//注册按键类
	JAXHudObj.regHudByType('btn', function (env) {
		return new JAXHudBtn(env);
	});

	//---------------------------------------------------------------------------
	//注册按键类
	JAXHudObj.regHudByType('button', function (env) {
		return new JAXHudBtn(env);
	});
}

//***************************************************************************
//可继承的成员函数:
//***************************************************************************
{
	//***************************************************************
	//创建控件:
	//***************************************************************
	{
		//---------------------------------------------------------------
		//ApplyCSS的开始，创建WebObj:
		__Proto.preApplyCSS = function (cssObj) {
			var div, father;
			let jaxEnv=this.jaxEnv;
			this.removeAllChildren();

			let owner,ownerState;
			father = this.father;
			owner = this.owner;

			if (!this.webObj) {
				if(cssObj.labelHtml){
					this.isLabel=1;
					this.labelObjDiv=document.createElement('div');
					this.labelObjDiv.style.position="absolute";
					this.labelObjDiv.style.height="100px";
					this.labelObjDiv.style.top="-200px";
					this.labelObjDiv.style.opacity="0";
					document.body.appendChild(this.labelObjDiv);
					this.labelObjDiv.innerHTML=cssObj.labelHtml;
					this.labelTarget_=this.labelObjDiv.firstChild;
					this.labelTarget_.onchange=cssObj.OnLabelAction||cssObj.OnLableAction;
				}else if(cssObj.labelFor){
					this.isLabel=1;
					this.labelTarget_=document.getElementById(cssObj.labelFor);
				}
				div = this.webObj = document.createElement('div');
				div.style.position = cssObj.position||"absolute";
				div.style.backgroundColor="rgba(0,0,0,0.0)";
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
		__Proto.postApplyCSS = function (cssObj) {
			let list;
			list = this.items2Add_;
			if (this.enable) {
				this.state = STATE_UP;
			} else {
				this.state = STATE_GRAY;
			}
			if (Array.isArray(list)) {
				this._applyItems(list);
			}

			/*if(this.hudPose.scale!==1){
				console.log("Found scale: "+this.hudPose.scale);
			}*/

			//链接webObj的鼠标消息:
			this.webObj.addEventListener('mousedown', this.OnMouseDownBinded);
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
		};

		//---------------------------------------------------------------
		//更新控件内容
		__Proto.update = function () {
			let webObj;
			let aniPose, hudPose;

			hudPose = this.hudPose;
			aniPose = this.aniPose;
			aniPose.x = 0;
			aniPose.y = 0;
			aniPose.alpha = hudPose.alpha;
			aniPose.scale = hudPose.scale;
			aniPose.rot = hudPose.rot;

			webObj = this.webObj;
			if (webObj) {
				if (this.poseChanged) {
					this._syncWebObj();
				}
				if (this.attrChanged) {
					this._syncWebObjAttr();
				}
			}
		};
	}

	//***************************************************************
	//鼠标消息:
	//***************************************************************
	{
		//-------------------------------------------------------------------
		//鼠标按下
		__Proto.OnMouseDown=function(e)
		{
			if(!this.enable){
				return;
			}
			if(!this.isPenDown) {
				e.stopPropagation();
				e.preventDefault();
				//this.webObj.addEventListener('mousemove', this.OnMouseMoveBinded, true);
				if(this.drag===2 && this.OnDragStart && !this.isDragging){
					let self=this;
					self.isDragging=1;
					self.OnDragStart(e);
					self.jaxEnv.startDrag(e,{
						OnDrag:self.OnDrag?self.OnDrag.bind(self):null,
						OnDone:(e,dx,dy)=>{
							self.isDragging=0;
							self.OnDragEnd&&self.OnDragEnd.call(self,e,dx,dy);
						},
					});
					this.OnDrag&&this.OnDrag(e,0,0);
				}else {
					this.isPenDown = 1;
					this.state = STATE_DOWN;
					this.isPenDown = 1;
					this.state = STATE_DOWN;

					this.webObj.addEventListener('mouseup', this.OnMouseUpBinded, true);
					this.webObj.addEventListener('mouseover', this.OnMouseOverBinded, true);
					this.webObj.addEventListener('mouseout', this.OnMouseOutBinded, true);
					this.jaxEnv.addOnMouseUp(this.OnMouseUpBinded);
					this.OnButtonDown && this.OnButtonDown(1, e);
				}
			}
		};

		//-------------------------------------------------------------------
		//鼠标抬起
		__Proto.OnMouseUp=function(e,fromBG)
		{
			if(!this.enable){
				return;
			}
			//console.log("Mouse Up: "+fromBG);
			if(this.isPenDown) {
				this.isPenDown = 0;
				this.state = this.isPenIn?STATE_OVER:STATE_UP;
				//this.webObj.removeEventListener('mousemove', this.OnMouseMoveBinded, true);
				this.webObj.removeEventListener('mouseup', this.OnMouseUpBinded, true);
				this.webObj.removeEventListener('mouseover', this.OnMouseOverBinded, true);
				this.webObj.removeEventListener('mouseout', this.OnMouseOutBinded, true);
				this.jaxEnv.removeOnMouseUp(this.OnMouseUpBinded);
				this.OnButtonDown&&this.OnButtonDown(e);
				if(!fromBG && this.OnClickFunc_ && this.enable){
					this.OnButtonUp&&this.OnButtonUp(1,e);
					if(this.OnClickFunc_(e)){
						this.state = STATE_UP;
					}
				}else{
					this.OnButtonUp&&this.OnButtonUp(0,e);
				}
				e.stopPropagation();
				e.preventDefault();
				if(this.labelTarget_){
					var evt;
					evt=new MouseEvent("click", {
						bubbles: true,cancelable: true,view: window
					});
					this.labelTarget_.dispatchEvent(evt);
				}
			}
		};

		//-------------------------------------------------------------------
		//鼠标移动
		__Proto.OnMouseMove=function(e)
		{
			if(!this.enable){
				return;
			}
			if(this.isPenDown) {
				//TODO: Code this:
			}
		};

		//-------------------------------------------------------------------
		//按下时鼠标移入
		__Proto.OnMouseOver=function(e)
		{
			if(!this.enable){
				return;
			}
			//console.log("Mouse Over");
			if(this.isPenDown) {
				this.state=STATE_DOWN;
				this.OnButtonDown&&this.OnButtonDown(0,e);
			}else{
				//TODO: Code this:
			}
		};

		//-------------------------------------------------------------------
		//按下时鼠标移出
		__Proto.OnMouseOut=function(e)
		{
			if(!this.enable){
				return;
			}
			//console.log("Mouse Out");
			if(this.isPenDown) {
				this.state=STATE_UP;
				this.OnButtonUp&&this.OnButtonUp(0,e);
				if(this.drag===1 && !this.isDragging && this.OnDragStart){
					let self=this;
					self.isDragging=1;
					self.OnDragStart(e);
					self.jaxEnv.startDrag(e,{
						OnDrag:self.OnDrag?self.OnDrag.bind(self):null,
						OnDone:(e,cancel,dx,dy)=>{
							self.isDragging=0;
							self.OnDragEnd&&self.OnDragEnd.call(self,e,cancel,dx,dy);
						},
					});
					this.OnDrag&&this.OnDrag(e,0,0);
				}
			}else{
				//TODO: Code this:
			}
		};

		//-------------------------------------------------------------------
		//抬起时鼠标移入
		__Proto.OnMouseOver2=function(e)
		{
			if(!this.enable){
				return;
			}
			this.isPenIn=1;
			if(this.isPenDown) {
				//Do nothing:
			}else{
				this.state=STATE_OVER;
			}
		};

		//-------------------------------------------------------------------
		//抬起时鼠标移出
		__Proto.OnMouseOut2=function(e)
		{
			if(!this.enable){
				return;
			}
			this.isPenIn=0;
			if(this.isPenDown) {
				//Do nothing:
			}else{
				this.state=STATE_UP;
			}
		};
	}

	//-----------------------------------------------------------------------
	//释放资源:
	__Proto.freeHud=function(){
		var father,div;

		if(this.labelObjDiv){
			document.body.removeChild(this.labelObjDiv);
			this.labelObjDiv=null;
			this.labelTarget_=null;
		}

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
export {JAXHudBtn};