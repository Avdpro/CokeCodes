var express = require('express');
var userAPI=require("./APIUser");
var gateAPI=require('./APIGate');
var diskAPI=require("./APIDisk");
var pkgAPI=require("./APIPkg");
var router = express.Router();
var cfgVersion = require("../cfg/version.json");

module.exports =function(app) {
	var apiMap={};

	//注册gateAPI:
	gateAPI(app,router,apiMap);

	//注册userAPI
	userAPI(app,router,apiMap);

	//注册diskAPI
	diskAPI(app,router,apiMap);
	
	//注册pkgAPI
	pkgAPI(app,router,apiMap);

	/* GET users listing. */
	router.post('/', function (req, res, next) {
		let msg,reqVO,handler,ret;
		reqVO = req.body;
		console.log(reqVO);
		msg=reqVO.msg;
		switch (reqVO.msg) {
			default:
				handler=apiMap[msg];
				if(handler){
					try {
						ret=handler(req, res, next);
						if(ret instanceof Promise){
							ret.then(()=>{
								//nothing
							}).catch(e=>{
								res.json({code:500,info:""+e});
							});
						}
					}catch(e){
						res.json({code:500,info:""+e});
					}
				}
				break;
		}
	});
	return router;
};
