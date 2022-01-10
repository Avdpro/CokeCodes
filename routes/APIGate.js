var cfgVersion = require("../cfg/version.json");

//---------------------------------------------------------------------------
//门户相关API
module.exports =function(app,router,apiMap){

	//-----------------------------------------------------------------------
	//得到当前开发环境版本信息:
	apiMap["version"]=function(req,res,next) {
		res.json(cfgVersion);
	};

	//-----------------------------------------------------------------------
	//得到API调用路径:
	apiMap["apiPath"]=function(req,res,next) {
		res.json({path:"/ws/"});
	};
};
