var express = require('express');
var crypto=require('crypto');
const MongoClient = require('mongodb').MongoClient;

//---------------------------------------------------------------------------
//用户相关API
module.exports =function(app,router,apiMap){
	const dbUser=app.get("DBUser");
	const dbDisk=app.get("DBDisk");
	const dbSys=app.get("DBSys");

	//-----------------------------------------------------------------------
	//用户注册:
	apiMap["userReg"]=async function(req,res,next) {
		let reqVO,email,userName,saveVO,uidVO,passSHA,userId;
		let time,token,loginVO;
		time=Date.now();
		reqVO=req.body.vo;

		//检查必要的信息是不是都在:
		email=reqVO.email;
		if(!email){
			res.json({code:-100,info:"Missing email address."});
			return;
		}
		userName=reqVO.name;
		if(!userName||(typeof(userName)!=="string")||userName.length>50){
			res.json({code:-101,info:"User name error."});
			return;
		}
		passSHA=reqVO.passwordSHA;
		if(!passSHA||(typeof(passSHA)!=="string")){
			res.json({code:-102,info:"User password sha256 code error."});
			return;
		}

		//检查email是不是已经被用到了:
		saveVO=await dbUser.findOne({email:email});
		if(saveVO){
			res.json({code:-103,info:"User email is already taken."});
			return;
		}

		//检查userName是不是已经被用到了:
		saveVO=await dbUser.findOne({name:userName});
		if(saveVO){
			res.json({code:-104,info:"User name is already taken."});
			return;
		}

		token=crypto.randomUUID();
		saveVO={};
		uidVO=await dbSys.findOneAndUpdate({_id:"nextUserId"},{'$inc':{uid:1}});
		if(!uidVO.ok){
			res.json({code:500,info:"Gen new userId DBError."});
			return;
		}
		uidVO=uidVO.value;

		//基础信息:
		saveVO._id=""+uidVO.uid;
		saveVO.name=userName;
		saveVO.email=email;
		saveVO.passwordSHA=passSHA;
		saveVO.regTime=time;
		saveVO.photo="";

		//用户等级/财产:
		saveVO.rank="GUEST";
		saveVO.rankExpire=0;
		saveVO.points=100;
		saveVO.coins=0;

		//登录信息:
		saveVO.token=token;
		saveVO.lastLogin=time;
		saveVO.tokenExpire=time+30*3600*24*1000;//30天
		saveVO.liveServer="";

		//用户相关的磁盘:
		saveVO.disks=[];
		saveVO.followDisks=[];
		saveVO.memberDisks=[];
		saveVO.publishDisks=[];

		//电子信认证
		saveVO.emailVarify=0;
		saveVO.emailVarifyCode=crypto.randomUUID();

		//修改密码信息
		saveVO.resetPswdCode="";
		saveVO.resetPswdTime=0;

		//保存用户信息:
		await dbUser.insert(saveVO);

		//生成登录信息:
		loginVO={code:200};
		loginVO.userId=saveVO._id;
		loginVO.email=saveVO.email;
		loginVO.name=saveVO.name;
		loginVO.photo=saveVO.photo;
		loginVO.token=token;
		loginVO.tokenExpire=saveVO.tokenExpire;
		loginVO.disks=saveVO.disks;
		loginVO.followDisks=saveVO.followDisks;
		loginVO.memberDisks=saveVO.memberDisks;
		loginVO.publishDisks=saveVO.publishDisks;
		loginVO.points=saveVO.points;
		loginVO.coins=saveVO.coins;
		loginVO.rank=saveVO.rank;
		loginVO.rankExpire=saveVO.rankExpire;
		loginVO.emailVarify=saveVO.emailVarify;
		res.json(loginVO);
	};

	//-----------------------------------------------------------------------
	//用户登陆:
	apiMap["userLogin"]=async function(req,res,next) {
		let userId,email,userInfo,clientTime,now,reqVO,token,checkCode;
		let sha256=crypto.createHash("sha256");

		reqVO=req.body.vo;
		userId=reqVO.userId;
		email=reqVO.email;

		function loginDone(){
			let resVO;
			resVO={code:200};
			resVO.userId=userInfo._id;
			resVO.email=userInfo.email;
			resVO.name=userInfo.name;
			resVO.photo=userInfo.photo||"";
			resVO.token=token;
			resVO.tokenExpire=userInfo.tokenExpire;
			resVO.disks=userInfo.disks;
			resVO.followDisks=userInfo.followDisks;
			resVO.memberDisks=userInfo.memberDisks;
			resVO.publishDisks=userInfo.publishDisks;
			resVO.points=userInfo.points;
			resVO.coins=userInfo.coins;
			resVO.rank=userInfo.rank;
			resVO.rankExpire=userInfo.rankExpire;
			resVO.emailVarify=userInfo.emailVarify||0;
			res.json(resVO);
		}

		//Check time:
		clientTime=reqVO.time;
		now=Date.now();
		let deltaTime=now-clientTime;
		if(!(deltaTime>=-30*1000 && deltaTime<=30*1000)){
			res.json({code:-101,info:"Client time error."});
			return;
		}

		//看看是不是用token登录:
		token=reqVO.token;
		if(userId && token){
			userInfo=await dbUser.findOne({_id:userId,token:token});
			if(userInfo){
				if(userInfo.tokenExpire>now){
					//使用token登录成功:
					loginDone();
					return;
				}else if(!reqVO.passwordSHA){
					//Token过期了:
					res.json({code:-102,info:"Login token expired."});
					return;
				}
			}
		}
		if(!userInfo){
			userInfo=await dbUser.findOne({email:email});
		}
		if(!userInfo){
			//Token过期了:
			res.json({code:-102,info:"Login token expired."});
			return;
		}
		userId=userInfo._id;
		checkCode=""+clientTime+userInfo.passwordSHA;
		checkCode=sha256.update(checkCode).digest('hex');
		if(checkCode!==reqVO.passwordSHA){
			//密码错误:
			res.json({code:-103,info:"Password error."});
			return;
		}

		//更新token:
		token=crypto.randomUUID();
		await dbUser.updateOne({_id:userId},{$set:{token:token,lastLogin:now,tokenExpire:now+3600*24*30*1000}});
		loginDone();
	};

	//-----------------------------------------------------------------------
	//获取用户信息::
	apiMap["userInfo"]=async function(req,res,next) {
		let reqVO,userId,email,userInfo;
		reqVO=req.body;
		userId=reqVO.userId;
		email=reqVO.email;

		function findUser(){
			let userVO;
			userVO={code:200};
			userVO.usreId=userInfo._id;
			userVO.email=userInfo.email;
			userVO.followDisks=userInfo.followDisks;
			userVO.memberDisks=userInfo.memberDisks;
			userVO.publishDisks=userInfo.publishDisks;
			res.json(userVO);
		}

		if(userId){
			userInfo=await dbUser.findOne({_id:userId});
		}else if(email){
			userInfo=await dbUser.findOne({email:email});
		}else{
			res.json({code:-101,info:"Param error."});
			return;
		}
		if(!userInfo){
			res.json({code:-102,info:"User not found."});
			return;
		}
		findUser();
	};

	//-----------------------------------------------------------------------
	//修改用户信息: 暂时没有可以修改的内容，名字是不是可以修改？
	apiMap["userSetInfo"]=function(req,res,next) {
		//TODO: Code this:
	};
	
	//-----------------------------------------------------------------------
	//Change password:
	apiMap["setPassword"]=async function(req,res,next){
		let reqVO,userId,token,userInfo,oldPswdSHA,newPswdSHA;
		reqVO=req.body.vo;
		userId=reqVO.userId;
		token=reqVO.token;
		oldPswdSHA=reqVO.oldSHA;
		newPswdSHA=reqVO.newSHA;
		userInfo=await dbUser.findOne({_id:userId,token:token});
		if(!userInfo){
			res.json({code:-100,info:"UserId/Token invalid."});
			return;
		}
		if(oldPswdSHA!==userInfo.passwordSHA) {
			res.json({code:-101,info:"Old password error."});
			return;
		}
		
		//更新token:
		let now=Date.now(),expire;
		token=crypto.randomUUID();
		expire=now+3600*24*30*1000;
		await dbUser.updateOne({_id:userId},{$set:{passwordSHA:newPswdSHA,token:token,lastLogin:now,tokenExpire:expire}});
		
		let resVO;
		resVO={code:200};
		resVO.userId=userInfo._id;
		resVO.email=userInfo.email;
		resVO.name=userInfo.name;
		resVO.photo=userInfo.photo||"";
		resVO.token=token;
		resVO.tokenExpire=expire;
		resVO.disks=userInfo.disks;
		resVO.followDisks=userInfo.followDisks;
		resVO.memberDisks=userInfo.memberDisks;
		resVO.publishDisks=userInfo.publishDisks;
		resVO.points=userInfo.points;
		resVO.coins=userInfo.coins;
		resVO.rank=userInfo.rank;
		resVO.rankExpire=userInfo.rankExpire;
		resVO.emailVarify=userInfo.emailVarify||0;
		res.json(resVO);
	};
};


