import {JAXEnv,$JXV,$V} from "./JAXEnv.js";
import {JAXHudObj} from "./JAXHudObj.js";
import {JAXHudView} from "./JAXHudView.js";

var JAXHudLayer,__Proto;

JAXHudLayer=function(app,appDiv)
{
	var div,dockDiv,self,attached;
	var uiEvent;
	if(!app){
		return;
	}
	JAXHudView.call(this,app.jaxEnv);

	var valJXVMap,hudView;
	valJXVMap=this.$valJXVMap;
	hudView=this.hudView;

	self=this;

	uiEvent=1;

	this.jaxClassFunc=JAXHudLayer;
	//***********************************************************************
	//属性定义
	//***********************************************************************
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
					if(this.dockWebObj){
						this.dockWebObj.style.pointerEvents=v<0?"none":"auto";
					}
				}
			},
			enumerable: true,
			configurable:true,
		});
	}

	//***********************************************************************
	//函数定义
	//***********************************************************************
	{

	}
	this.dockWebObj=dockDiv=document.createElement('div');
	dockDiv.style.position="absolute";
	dockDiv.style.left="0px";
	dockDiv.style.top="0px";
	dockDiv.style.width="100%";
	dockDiv.style.height="100%";
	appDiv.appendChild(dockDiv);

	this.webObj=div=document.createElement('div');
	div.style.position="absolute";
	this.w=appDiv.offsetWidth;
	this.h=appDiv.offsetHeight;
	dockDiv.appendChild(div);
	attached=1;

	//-----------------------------------------------------------------------
	//Layer脱离控件树:
	self.detachLayer=function(){
		if(!attached){
			return;
		}
		dockDiv.removeChild(div);
		dockDiv.style.display="none";
		attached=0;
	};

	//-----------------------------------------------------------------------
	//Layer并入控件树:
	self.attachLayer=function(){
		if(attached){
			return;
		}
		dockDiv.appendChild(div);
		dockDiv.style.display="";
		attached=1;
	}

};

JAXHudLayer.prototype=__Proto=new JAXHudView();

//***************************************************************************
//属性列表/注册创建函数:
//***************************************************************************
{
	//CSS属性列表
	JAXHudLayer.jaxPptSet = new Set(['id','x','y','w','h','ofX','ofY','ofW','ofH','uiEvent','items']);
}

export {JAXHudLayer};