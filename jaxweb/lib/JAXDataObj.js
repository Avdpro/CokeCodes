var JAXDataObj, __Proto;
let callAfter;

//***************************************************************************
//面向dataObj的方法:
//***************************************************************************
{
	//-----------------------------------------------------------------------
	//初始化函数:
	JAXDataObj=function(jaxEnv,owner,ownerKey){
		var self;
		var notifyHubOn,notifyOnAll,notifyToMap;//即时/延时的派送通知函数

		if(jaxEnv===undefined){
			return;
		}
		self=this;//新建一个对象
		self.jaxEnv=jaxEnv;
		self.deadOut=0;
		self.jaxValNotify=1;
		self.owner=owner;
		self.ownerKey=ownerKey;

		//*******************************************************************
		//使当前self对象拥有可以追踪的变量相关:
		//*******************************************************************
		{
			var m_NotifyPaused;
			var m_viewHubIn = {};
			var m_viewHubOn = {};
			var m_isInEnvList = 0;
			var m_NotifyOnMsgHash = {};
			var m_PendingNofifyOn=[];
			var m_msgValHash={};
			var removeValBindOfView;

			//---------------------------------------------------------------
			//转换一个成员为被监测的:@[""+obj.name,"Data"]
			self.upgradeVal = function (name, msg) {
				var oldMsg, curVal, desc, oldGet, oldSet,msgList;
				if (!(name in self)) {
					return;
				}
				if (!msg) {
					msg = "*";//默认的分散消息通道:
				}
				if(Array.isArray(msg)){
					msgList=msg;
				}
				oldMsg = m_msgValHash[name];
				if (oldMsg) {
					if (msg !== oldMsg) {
						throw "JAXDataObj upgradVal error: val " + name + " is already been upgraded with diffrent msg " + oldMsg + ", new msg: " + msg;
					}
					return;
				}
				desc = Object.getOwnPropertyDescriptor(self, name);
				oldGet = desc.get;
				oldSet = desc.set;
				curVal = self[name];
				m_msgValHash[name] = msg;
				if(msgList){
					//纪录映射
					Object.defineProperty(self, name,
						{
							enumerable: desc.enumerable,
							configurable: true,
							set: function (newVal) {
								let msg;
								curVal = newVal;
								if (oldSet) {
									oldSet.call(self, newVal);
								}
								for(msg of msgList) {
									//notifyHubIn(msg);//这个要去掉
									notifyHubOn(msg);
								}
								return newVal;
							},
							get: function () {
								return oldGet ? oldGet.call(self) : curVal;
							}
						}
					);
				}else {
					//纪录映射
					Object.defineProperty(self, name,
						{
							enumerable: desc.enumerable,
							configurable: true,
							set: function (newVal) {
								curVal = newVal;
								if (oldSet) {
									oldSet.call(self, newVal);
								}
								//notifyHubIn(msg);//这个要去掉
								notifyHubOn(msg);
								return newVal;
							},
							get: function () {
								return oldGet ? oldGet.call(self) : curVal;
							}
						}
					);
				}
			};

			//---------------------------------------------------------------
			//得到一个变量对应的消息:
			self.getValMsg = function (name) {
				return m_msgValHash[name];
			};

			//---------------------------------------------------------------
			//添加延时数据观察回调，返回指定变量对应的msg
			self.onNotify=self.bindValNotify = function (valName,func,view,once=0) {
				var map, set, msg;
				if (!func) {
					console.error("hub notify function!!");
					return;
				}
				if (!(valName in self)) {
					msg=valName;
				}else {
					msg = m_msgValHash[valName];
				}
				if(!msg){
					throw ""+valName+" is not upgraded!";
				}
				map = m_viewHubOn[msg];
				if (!map) {
					map = m_viewHubOn[msg] = new Map();
				}
				set = map.get(view);
				if (!set) {
					set = new Set();
					map.set(view, set);
				}
				if(!once) {
					set.add(func);
				}else{
					let onceFunc;
					onceFunc=function(...args){
						func(...args);
						self.off(msg,onceFunc,view);
					};
					set.add(onceFunc);
				}
				return msg;
			};

			//---------------------------------------------------------------
			//添加单次延时数据观察回调
			self.onceNotify=function(msgName,func,view){
				self.onNotify(msgName,func,view,1);
			};

			//---------------------------------------------------------------
			//删除view对应的所有观察回调
			self.removeValBindOfView = removeValBindOfView = function (msgName, view) {
				var list, i, n, stub;
				if (!msgName) {
					list = m_viewHubIn;
					for (i in list) {
						removeValBindOfView(i, view);
					}
					list = m_viewHubOn;
					for (i in list) {
						removeValBindOfView(i, view);
					}
					return;
				}
				list = m_viewHubIn[msgName];
				if (list) {
					list.delete(view);
				}
				list = m_viewHubOn[msgName];
				if (list) {
					list.delete(view);
				}
			};

			//---------------------------------------------------------------
			//删除指定的链接
			self.offNotify=self.removeValNotify = function (msgName, func, view) {
				var list, map, set, i, msg;
				if (!msgName) {
					list = m_viewHubIn;
					for (i in list) {
						msg=i;
						self.removeValNotify(msg, view, func);
					}
					list = m_viewHubOn;
					for (i in list) {
						msg=i;
						self.removeValNotify(i, view, func);
					}
					return;
				}
				map = m_viewHubIn[msgName];
				if (map) {
					set = map.get(view);
					if (set) {
						set.delete(func);
					}
				}
				map = m_viewHubOn[msgName];
				if (map) {
					set = map.get(view);
					if (set) {
						set.delete(func);
					}
				}
			};

			//---------------------------------------------------------------
			//通知指定消息队列里的函数:
			notifyToMap = function (map) {
				var views, view, set, func;
				views = map.keys();
				for (view of views) {
					if (!view || view.allowValNotify!==false) {
						set = map.get(view);
						for (func of set) {
							func();
						}
					}
				}
			};

			//---------------------------------------------------------------
			//延时通知函数:
			self.emitNotify=self.notifyValMsgOn = notifyHubOn = function (msg) {
				if (m_NotifyOnMsgHash[msg])
					return;
				m_NotifyOnMsgHash[msg] = 1;
				m_PendingNofifyOn.push(msg);
				if (m_isInEnvList)
					return;
				m_isInEnvList = 1;
				callAfter(notifyOnAll);
			};

			//---------------------------------------------------------------
			//发送延时通知函数:
			notifyOnAll = function () {
				var map, msg, list, loop;
				if (m_NotifyPaused)
					return;
				loop = 0;
				do {
					list = m_PendingNofifyOn.splice(0);
					for (msg of list) {
						m_NotifyOnMsgHash[msg] = 0;
						map = m_viewHubOn[msg];
						if (map) {
							notifyToMap(map);
						}
					}
					loop++;
					if (loop > 3)
						break;
				} while (m_PendingNofifyOn.length);
				m_isInEnvList = 0;
			};

			//---------------------------------------------------------------
			//定义暂停属性通知机制:
			Object.defineProperty(self,"pauseValNotify",{
				get:function(){
					return m_NotifyPaused;
				},
				set:function(v){
					v=v?1:0;
					m_NotifyPaused=v;
					return v;
				}
			})

			//---------------------------------------------------------------
			//得到当前使用的全部的消息
			self.eventNames=function(){
				//TODO: Code this:
				return [];
			}
		}
		return self;
	};
}

//***************************************************************************
//静态Class成员函数:
//***************************************************************************
{
	var DataTypeHash = {};

	//-----------------------------------------------------------------------
	//注册DataObj类型
	JAXDataObj.regHudByType = function (typeName, func) {
		DataTypeHash[typeName] = func;
	};

	//-----------------------------------------------------------------------
	//根据类型创建DataObj
	JAXDataObj.createDataObjByType=function(type,jaxEnv){
		var func;
		func=DataTypeHash[type];
		func=func?func:function(env){new JAXDataObj(env);};
		return func(jaxEnv);
	};
}
//***************************************************************************
//CallAfter:
//***************************************************************************
{
	let callAFList=[];
	let callInList=false;

	//-----------------------------------------------------------------------
	//Call a function later, make sure it's asynced:
	callAfter=JAXDataObj.callAfter=function(func)
	{
		callAFList.push(func);
		if(!callInList){
			callInList=true;
			setTimeout(()=>{
				let list=callAFList;
				callInList=0;
				callAFList=[];
				for(let func of list){
					func();
				}
			},0);
		}
	};
}
export {JAXDataObj};