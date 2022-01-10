import {JAXDataObj} from "./JAXDataObj.js";
import {JAXEnv,$JXV,JAXStateProxy} from "./JAXEnv.js";

var jaxHudState_,jaxHudState,jaxHudSubState;

//***************************************************************************
//面向hudState的方法:
//***************************************************************************
{
	//---------------------------------------------------------------------------
	//生成hudState数组Proxy:
	jaxHudState_=function(jaxEnv,orgObj,isTopObj,opts)
	{
		var val,i;
		var self,ownerObj,ownerKey;
		var valNotifyOn,notifyOnAll,notifyToSet;//即时/延时的派送通知函数
		var valFuncsOnUpdate;
		var view=null;
		var selfReady=0;
		var fullAuto;
		var willAutoNotifyAll=0;
		var jxvValMap=new Map();
		var subStates=new Set();

		//看看是不是已经是JAXStateProxy了:
		if(orgObj instanceof JAXStateProxy){
			return orgObj;
		}
		if(orgObj.constructor!==Object){
			if(isTopObj) {
				throw "Can only init state-object on a pure Object!";
			}
			return orgObj;
		}

		valFuncsOnUpdate=[];
		if(!opts){
			opts={
				fullAuto:1,
			}
		}
		fullAuto=opts.fullAuto;

		//创建Proxy:
		self=new Proxy(new JAXStateProxy(orgObj),{
			get:function(obj,pName){
				//如果是数组的话，是不是要某些函数需要替换支持改变的消息
				switch(pName){
					case "isJAXHudState":
						return true;
					case "ownerObj_":
						return ownerObj;
					case "ownerKey_":
						return ownerKey;
				}
				val=orgObj[pName];
				return val;
			},
			set:function(obj,pName,val) {
				let oldV,oldJXV;
				switch (pName) {
					case "ownerObj_":
						if (ownerObj) {
							throw "Error: jaxHudStateObj can't have more than one owner."
						}
						ownerObj = val;
						return ownerObj;
					case "ownerKey_":
						ownerKey = val;
						return ownerKey;
				}
				oldV=orgObj[pName];
				if(oldV instanceof JAXStateProxy){
					subStates.delete(oldV);
				}
				if(val instanceof $JXV) {
					oldJXV=jxvValMap.get(pName);
					if(oldJXV){
						oldJXV.untrace();
						jxvValMap.delete(pName);
					}
					orgObj[pName] = val.val;
					val.trace(orgObj.ownerState, self, pName, orgObj.hudView);
				}else if(val instanceof JAXStateProxy){
					orgObj[pName] = val;
					subStates.add(val);
				}else {
					orgObj[pName] = val;
				}
				if(selfReady) {
					//通知变量改变:
					self.valNotifyOn(pName);
					if (ownerObj) {
						ownerObj.valNotifyOn(ownerKey);
					}
					if(isTopObj && fullAuto && !willAutoNotifyAll){
						willAutoNotifyAll=1;
						jaxEnv.callAfter(()=>{
							self.update();
						});
					}
				}
				return true;
			}
		});
		self.isJAXHudState=1;

		//*************************************************************************
		//使当前self对象拥有可以追踪的变量相关:
		//*************************************************************************
		{
			var m_NotifyPaused;
			var m_viewHubOn = {};
			var m_isInEnvList = 0;
			var m_NotifyOnMsgHash = {};
			var m_PendingNofifyOn=[];

			//-------------------------------------------------------------------------
			//添加延时数据观察回调，返回指定变量对应的msg
			self.onNotify=self.bindValNotify = function (valName, func, view) {
				var set;
				if (!func) {
					return;
				}
				if (!(valName in self)) {
					return;
				}
				set = m_viewHubOn[valName];
				if (!set) {
					set = new Set();
					m_viewHubOn[valName]=set;
				}
				set.add(func);
				return valName;
			};

			//-------------------------------------------------------------------------
			//移除绑定的函数:
			self.offNotify=self.removeValNotify=function(valName,func,view){
				let hash,stub,set;
				if (func) {
					set = m_viewHubOn[valName];
					if (set) {
						set.delete(func);
					}
				}
			};

			//-------------------------------------------------------------------------
			//通知指定消息队列里的函数:
			notifyToSet = function (set) {
				var func;
				for (func of set) {
					func();
				}
			};

			//-------------------------------------------------------------------------
			//延时通知函数:
			self.valNotifyOn = valNotifyOn = function (msg) {
				if (m_NotifyOnMsgHash[msg])
					return;
				m_NotifyOnMsgHash[msg] = 1;
				m_PendingNofifyOn.push(msg);
				if (m_isInEnvList)
					return;
				m_isInEnvList = 1;
				jaxEnv.callAfter(notifyOnAll);
			};

			//-------------------------------------------------------------------------
			//发送延时通知函数:
			notifyOnAll = function () {
				var set, msg, list, loop;
				if (m_NotifyPaused)
					return;
				loop = 0;
				do {
					list = m_PendingNofifyOn.splice(0);
					for (msg of list) {
						m_NotifyOnMsgHash[msg] = 0;
						set = m_viewHubOn[msg];
						if (set) {
							notifyToSet(set);
						}
					}
					loop++;
					if (loop > 3)
						break;
				} while (m_PendingNofifyOn.length);
				m_isInEnvList = 0;
			};
		}

		//*************************************************************************
		//转换State项目里的变量/追踪函数
		//*************************************************************************
		{
			//-------------------------------------------------------------------------
			//根据字符串解析Trace的对象和变量:
			self.setupState_=function(ownerObj,ownerKey){
				let atraces,i,n;
				if(selfReady){
					throw "Error: HudState setup called more than once!";
				}
				view=jaxEnv.getHudView();
				atraces=[];
				if(Array.isArray(orgObj)){
					let newArray;
					newArray=orgObj;
					n=newArray.length;
					for(i=0;i<n;i++){
						val=newArray[i];
						if(val instanceof $JXV){
							jxvValMap.set(i,val);
							orgObj[i]=val.val;
							val.trace(orgObj.ownerState,self,i,orgObj.hudView);
						}else if(typeof(val)==="string" && val.startsWith("${") && val.endsWith("}")){
							throw "Old ${} found!";
						}
						if(val && val.isJAXHudState){
							val.setupState_(self,i);
						}
					}
				}else{
					let valKey,key,val;
					for(valKey in orgObj){
						key=valKey;
						val=orgObj[key];
						//看看Val是不是追踪表达式:
						if(val instanceof $JXV) {
							jxvValMap.set(key,val);
							orgObj[key]=val.val;
							val.trace(orgObj.ownerState,self,key,ownerObj.hudView);
						}else if(typeof(val)==="string" && val.startsWith("${") && val.endsWith("}")){
							throw "Old ${} found!";
						}
						if(val && val.isJAXHudState && key!=="ownerState"){
							val.ownerState=self;
							val.hudView=orgObj.hudView;
							val.setupState_(self,key);
						}
					}
				}
				selfReady=1;
			};
		}

		//添加一个update函数:
		self.addUpdateFunc=function(func){
			if(func){
				valFuncsOnUpdate.push(func);
				return func;
			}
			return null;
		};

		//移除一个update函数:
		self.removeUpdateFunc=function(func){
			let idx=valFuncsOnUpdate.indexOf(func);
			if(idx>=0){
				valFuncsOnUpdate.splice(idx,1);
			}

		};

		//更新state，通知全部与state的update绑定的hud/对象属性:
		self.update=function(sub=1){
			let func,list;
			willAutoNotifyAll=0;
			for(func of valFuncsOnUpdate){
				func();
			}
			if(sub) {
				list = subStates.values();
				for (let sub of list) {
					sub.update(1);
				}
			}
			self.OnUpdate&&self.OnUpdate();
		};

		//更新state，通知全部与state的update绑定的hud/对象属性:
		self.refresh=function(sub=1){
			let func,list,jxv;
			for(func of valFuncsOnUpdate){
				func();
			}
			list=jxvValMap.values();
			for(jxv of list){
				jxv.func()();
			}
			list=subStates.values();
			for(let sub of list){
				sub.update(1);
			}
		};


		//释放state
		self.freeState=function(){
			var jxv,list;
			this.deadOut=1;
			list=jxvValMap.values();
			for(jxv of list){
				jxv.untrace();
			}
			list=subStates.values();
			for(let sub of list){
				sub.freeState();
			}
		};

		if(isTopObj){
			self.setupState=function(hud,ownerState,hudView){
				orgObj.ownerState=ownerState;
				orgObj.hudView=hudView;
				self.setupState_(hud,"hudState");
			};
		}
		return self;
	};

	//---------------------------------------------------------------------------
	//生成顶级hudState:
	jaxHudState=function(jaxEnv,orgObj,opts){
		return jaxHudState_(jaxEnv,orgObj,1,opts);
	};

	//---------------------------------------------------------------------------
	//生成子级hudState:
	jaxHudSubState=function(jaxEnv,orgObj,opts){
		return jaxHudState_(jaxEnv,orgObj,0,opts);
	};
}

export {jaxHudState,jaxHudSubState};