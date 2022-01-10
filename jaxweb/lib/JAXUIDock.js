import {JAXEnv,$JXV,$V} from "./JAXEnv.js";
import {JAXHudObj} from "./JAXHudObj.js";

let JAXUIDock,__Proto;

JAXUIDock=function(jaxEnv){
	var self;
	var uiStack=[];
	var subUIs=[];
	var subHash={};
	var hideCovered=1;
	var dismissCovered=0;

	if(!jaxEnv){
		return;
	}
	self=this;
	JAXHudObj.call(this,jaxEnv);
	this.clip=1;

	this.OnRunoutUI=null;
	this.OnShowUI=null;
	this.OnUIShowed=null;
	this.OnCoverUI=null;
	this.OnUICovered=null;
	this.OnUncoverUI=null;
	this.OnUIUncovered=null;
	this.OnDismissUI=null;
	this.OnUIDismissed=null;

	//-----------------------------------------------------------------------
	//当前的UI:
	Object.defineProperty(this,'curUI',{
		get:function(){return uiStack[uiStack.length-1];},
		set:function(v){return v},
		enumerable:false
	});

	//-----------------------------------------------------------------------
	//当前的UI:
	Object.defineProperty(this,'dockUIs',{
		get:function(){return subUIs;},
		set:function(v){return subUIs;},
		enumerable:false
	});

	//***********************************************************************
	//CSS属性:
	//***********************************************************************
	{
		//-----------------------------------------------------------------------
		//当前的UI的Id，在subHash找到对应的UI进行显示:
		Object.defineProperty(this,'ui',{
			get:function(){
				var hud;
				hud=uiStack[uiStack.length-1];
				return hud;
			},
			set:function(v){
				var hud;
				hud=subUIs[v]||subHash[v];
				if(hud){
					self.showUI(hud,{});
				}
				return hud;
			},
			enumerable:true
		});

		//-----------------------------------------------------------------------
		//被遮挡的UI的处理:
		Object.defineProperty(this,'covered',{
			get:function(){
				return dismissCovered?"dismiss":(hideCovered?"hide":"stay");
			},
			set:function(v){
				switch(v){
					case "hide":
						hideCovered=1;
						dismissCovered=0;
						break;
					case "dismiss":
						hideCovered=0;
						dismissCovered=1;
						break;
					default:
						hideCovered=0;
						dismissCovered=0;
						break;
				}
				return v;
			},
			enumerable:true
		});
	}

	//***********************************************************************
	//不会被继承的方法:
	//***********************************************************************
	{
		//-------------------------------------------------------------------
		//用CSS添加一个新的UI
		this.showNewUI=function(cssVO,vo={},inSub=1){
			let uiId,preUI,result,ui;

			ui=this.appendNewChild(cssVO);
			if(!ui){
				return null;
			}
			preUI=this.curUI;
			if(preUI){
				preUI.uiEvent=0;
				this.OnCoverUI&&this.OnCoverUI(preUI,ui);
				if(preUI.coverUI) {
					preUI.coverUI();
				}
			}
			uiStack.push(ui);
			ui.uiEvent=0;
			result =ui.showUI?ui.showUI(vo,preUI):null;
			if(result instanceof Promise){
				result.then(()=>{
					this.OnShowUI&&this.OnShowUI(ui,preUI);
					ui.uiEvent=1;
					if(preUI) {
						this.OnUICovered&&this.OnUICovered(preUI);
						if(dismissCovered){
							self.dismissUI(preUI);
						}else if(hideCovered) {
							self.removeChild(preUI);
						}
						preUI.OnUICovered&&preUI.OnUICovered();
					}
					this.OnUIShowed&&this.OnUIShowed(ui);
				});
			}else{
				this.OnShowUI&&this.OnShowUI(ui,preUI);
				ui.uiEvent=1;
				if(preUI) {
					this.OnUICovered&&this.OnUICovered(preUI);
					if(dismissCovered) {
						self.dismissUI(preUI);
					}else if(hideCovered) {
						self.removeChild(preUI);
					}
					preUI.OnUICovered&&preUI.OnUICovered();
				}
				this.OnUIShowed&&this.OnUIShowed(ui);
			}
			ui.hold();
			if(inSub) {
				uiId = ui.id;
				if (uiId && !subHash[uiId]) {
					subUIs.push(ui);
					subHash[uiId] = ui;
				}
			}
			return ui;
		};

		//-------------------------------------------------------------------
		//显示UI:
		this.showUI=function(ui,vo){
			let idx,preUI,result;

			preUI=this.curUI;

			//同一个UI，调用showUI函数，不进行UI切换
			if(preUI===ui){
				result =ui.showUI?ui.showUI(vo,preUI):null;
				if(result instanceof Promise){
					result.then(()=>{
						this.OnUIShowed&&this.OnUIShowed(ui);
					});
				}else{
					this.OnUIShowed&&this.OnUIShowed(ui);
				}
				return ui;
			}

			if(typeof(ui)==="string"){
				ui=subHash[ui];
				if(!ui){
					jaxEnv.logError("JAXUIDock.showUI: UI has different father!");
					throw "JAXUIDock.showUI: UI has different father!";
				}
			}

			if(ui.father && ui.father!==this){
				jaxEnv.logError("JAXUIDock.showUI: UI has different father!");
				throw "JAXUIDock.showUI: UI has different father!";
			}
			idx=uiStack.indexOf(ui);
			if(idx>=0){
				uiStack.splice(idx,1);
			}
			uiStack.push(ui);
			this.appendChild(ui);
			if(preUI){
				preUI.uiEvent=0;
				this.OnCoverUI&&this.OnCoverUI(preUI,ui);
				if(preUI.coverUI) {
					preUI.coverUI();
				}
			}
			ui.uiEvent=0;
			result =ui.showUI?ui.showUI(vo,preUI):null;
			this.OnShowUI&&this.OnShowUI(ui,preUI);
			if(result instanceof Promise){
				result.then(()=>{
					ui.uiEvent=1;
					if(preUI) {
						this.OnUICovered&&this.OnUICovered(preUI);
						if(dismissCovered) {
							self.dismissUI(preUI);
						}else if(hideCovered) {
							self.removeChild(preUI);
						}
						preUI.OnUICovered&&preUI.OnUICovered();
					}
					this.OnUIShowed&&this.OnUIShowed(ui);
				});
			}else{
				ui.uiEvent=1;
				if(preUI) {
					this.OnUICovered&&this.OnUICovered(preUI);
					if(dismissCovered) {
						self.dismissUI(preUI);
					}else if(hideCovered) {
						self.removeChild(preUI);
					}
					preUI.OnUICovered&&preUI.OnUICovered();
				}
				this.OnUIShowed&&this.OnUIShowed(ui);
			}
			return ui;
		};

		//-------------------------------------------------------------------
		//移除UI:
		this.dismissUI=function(ui){
			var topUI,nextUI,idx,result;
			topUI=self.curUI;
			if(!ui){
				ui=topUI;
			}
			if(ui!==topUI){
				//这个UI不是最上面的UI:
				idx=uiStack.indexOf(ui);
				if(idx>=0){
					uiStack.splice(idx,1);
				}
				this.OnDismissUI&&this.OnDismissUI(ui);
				if(ui.father===self){
					if(ui.dismissUI){
						result=ui.dismissUI();
						if(result instanceof Promise){
							result.then(()=>{
								this.OnUIDismissed&&this.OnUIDismissed();
								self.removeChild(ui);
								ui.release();
							});
						}
					}else {
						this.OnUIDismissed&&this.OnUIDismissed();
						self.removeChild(ui);
						ui.release();
					}
				}
			}else{
				//这个UI是最上面的UI:
				ui.uiEvent=0;
				uiStack.pop();
				nextUI=this.curUI;
				if(nextUI){
					this.insertBefore(nextUI,ui);
					this.OnUncoverUI&&this.OnUncoverUI(nextUI);
					if(nextUI.showCovered){
						nextUI.showCovered();
					}
				}
				this.OnDismissUI&&this.OnDismissUI(ui);
				if(ui.dismissUI){
					result=ui.dismissUI();
					if(result instanceof Promise){
						result.then(()=>{
							this.OnUIDismissed&&this.OnUIDismissed();
							self.removeChild(ui);
							ui.release();
							if(nextUI){
								this.OnUIUncovered&&this.OnUIUncovered(nextUI);
								nextUI.uiEvent=1;
							}
						});
					}else{
						this.OnUIDismissed&&this.OnUIDismissed();
						self.removeChild(ui);
						ui.release();
						if(nextUI){
							this.OnUIUncovered&&this.OnUIUncovered(nextUI);
							nextUI.uiEvent=1;
						}
					}
				}else{
					this.OnUIDismissed&&this.OnUIDismissed();
					self.removeChild(ui);
					ui.release();
					if(nextUI){
						this.OnUIUncovered&&this.OnUIUncovered(nextUI);
						nextUI.uiEvent=1;
					}
				}
				if(!uiStack.length){
					this.OnRunoutUI&&this.OnRunoutUI();
				}
			}
		};

		//-------------------------------------------------------------------
		//增加一个被管理的UI:
		this.addDockUI=function(hud){
			if(subUIs.indexOf(hud)<0) {
				hud.hold();
				subUIs.push(hud);
				subHash[hud.id] = hud;
			}
		}
	}
};

__Proto=JAXUIDock.prototype=new JAXHudObj();

//***************************************************************************
//属性列表/注册创建函数:
//***************************************************************************
{
	//CSS属性列表
	JAXUIDock.jaxPptSet=new Set(Array.from(JAXHudObj.jaxPptSet).concat(["covered"]));

	//---------------------------------------------------------------------------
	//注册基础Hud类
	JAXHudObj.regHudByType('dock', function (env) {
		return new JAXUIDock(env);
	});
}

//***************************************************************************
//可继承的成员函数:
//***************************************************************************
{
	//---------------------------------------------------------------
	//ApplyCSS的最后，设置WebObj属性:
	__Proto.postApplyCSS = function (cssObj)
	{
		let list,hudPose,aniPose,uiId,uiType;
		list=this.items2Add_;
		if(Array.isArray(list)){
			this._applyItems(list);
		}
		delete this.items2Add_;

		//把子控件转换为管理的控件:
		{
			let hud;
			hud=this.firstChild;
			while(hud){
				this.addDockUI(hud);
				this.removeChild(hud);
				hud=this.firstChild;
			}
		}
		uiId=cssObj.ui;
		uiType=typeof(uiId);
		if(uiType==="number" && uiId>=0){
			this.showUI(this.dockUIs[uiId]);
		}else if(uiType==="string" && uiId){
			this.showUI(uiId,null);
		}else if(uiType==="object" && uiId){
			this.showNewUI(uiId);
		}

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
	};

	//-----------------------------------------------------------------------
	//释放资源:
	__Proto.freeHud=function(){
		var father,div,list,i,n;
		list=this.dockUIs;
		n=list.length;
		for(i=0;i<n;i++){
			list[i].release();
		}
		list.splice(0);
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

export {JAXUIDock};