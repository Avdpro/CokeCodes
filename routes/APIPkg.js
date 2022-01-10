const express = require('express');
const crypto=require('crypto');
const pathCfg=require("../cfg/filepath");
const fsp=require("fs/promises");
const {Buffer}=require("buffer");
const child_process = require("child_process");

//---------------------------------------------------------------------------
//磁盘相关API
module.exports =function(app,router,apiMap) {

	//***********************************************************************
	//基础用户CPM操作:
	//***********************************************************************
	{
		const dbUser=app.get("DBUser");
		const dbDisk=app.get("DBDisk");
		const dbSys=app.get("DBSys");
		const dbPkg=app.get("DBPkg");
		const pkgNameChecker=/^([a-zA-Z]{1})([.@a-zA-Z_-]{2,99})$/;
		const tagChecker=/^([a-zA-Z]{1})([a-zA-Z_-]{0,59})$/;

		//初始化获得磁盘路径的函数:
		let env=app.get("env");
		let pathFunc=pathCfg[env].getDiskPath;

		//-----------------------------------------------------------------------
		//发布一个cpm包:
		apiMap["pkgShare"] = async function (req, res, next) {
			let reqVO,userId,token,userInfo,isVIP,isMaster,shareInfo,versionIdx;
			let pkgName,diskId,tag,cmptb,diskJSON,tagVO,installType;
			let diskInfo,pkgInfo;

			reqVO=req.body.vo;
			userId=reqVO.userId;
			token=reqVO.token;
			diskId=reqVO.diskId;
			pkgName=reqVO.pkgName;
			tag=reqVO.tag;
			shareInfo=reqVO.info||"";
			cmptb=reqVO.cmptb;
			versionIdx=reqVO.versionIdx;
			diskJSON=reqVO.diskJSON;
			installType=reqVO.install==="disk"?"disk":"dir";
			
			userInfo=await dbUser.findOne({_id:userId,token:token});
			if(!userInfo){
				res.json({code:-100,info:"UserId/Token invalid."});
				return;
			}
			
			isVIP=userInfo.rank==="MEMBER"||userInfo.rank==="MASTER"||userInfo.rank==="LORD"||userInfo.rank!=="LEADER";
			isMaster=userInfo.rank==="MASTER"||userInfo.rank==="LORD";
			
			diskInfo=await dbDisk.findOne({_id:diskId});
			if(!diskInfo){
				res.json({code:-101,info:`DiskId ${diskId} is invalid.`});
				return;
			}
			if(!isMaster){
				if(!pkgName.endsWith(userInfo.email)){
					res.json({code:-201,info:`Package name need end with your accout email address.`});
					return;
				}
			}
			
			pkgName=pkgName||diskInfo.package;
			if(diskInfo.package && diskInfo.package!==pkgName){
				res.json({code:-103,info:`DiskId ${diskId} is already shared as package: ${diskInfo.package}.`});
				return;
			}

			//Check if name is format ok:
			if(!pkgNameChecker.test(pkgName)){
				res.json({code:-110,info:`Package name ${pkgName} is illegal.`});
				return;
			}
			
			if(diskInfo.userId!==userId){
				//TODO: 暂时只有磁盘的拥有者可以提交:
				res.json({code:-102,info:`Only disk owner can share package.`});
				return;
			}
			if(diskInfo.versionIdx!==versionIdx){
				res.json({code:-108,info:`Disk version idx(${versionIdx} vs ${diskInfo.versionIdx}) error.`});
				return;
			}
			
			if(!tag || !tagChecker.test(tag)){
				if(!tag){
					res.json({code:-105,info:"Tag is missing or illegal."});
					return;
				}
			}
			
			//得到当前的pkg
			pkgInfo=await dbPkg.findOne({_id:pkgName});
			if(!pkgInfo){
				//This is a new package:
				if(!isVIP){
					//TODO: 暂时不是谁都可以提交新pkg
					res.json({code:-104,info:"Member rank need upgrade."});
					return;
				}
				if(!diskJSON || !diskJSON.main){
					res.json({code:-106,info:"Missing disk.json content."});
					return;
				}
				
				//Create the new package:
				tagVO={
					tag:tag,
					versionIdx:diskInfo.versionIdx,
					version:diskInfo.version,
					info:shareInfo,
					shareTime:Date.now(),
					cmpTags:[],
					vidxes:[diskInfo.versionIdx]
				};
				tagVO.main=diskJSON.main;
				pkgInfo={
					_id:pkgName,
					diskId:diskId,
					tag:tag,
					devTag:"",
					installNum:0,
					dailyInstall: [],
					tags:[tagVO],
					install:installType
				}
				dbPkg.insertOne(pkgInfo,(err)=>{
					if(err){
						res.json({code:-1,info:"DB insert error."});
						return;
					}
					res.json({code:200});
				});
				
				//Set disk's package export attrib:
				dbDisk.updateOne({_id:diskId},{$set:{package:pkgName}});
				return;
			}

			//Upgrade package:
			let preTag,i,n;
			let tags=pkgInfo.tags;
			if(!tag){
				tag=pkgInfo.tag;
			}
			
			tagVO={
				tag:tag,
				versionIdx:diskInfo.versionIdx,
				version:diskInfo.version,
				info:shareInfo,
				shareTime:Date.now(),
			};
			
			//验证tag合法性:
			n=tags.length;
			for(i=0;i<n-1;i++){
				if(tags[i].tag===tag){
					res.json({code:-107,info:"Tag name is taken."});
					return;
				}
			}
			preTag=tags[tags.length-1];
			if(preTag && preTag.versionIdx===versionIdx){
				res.json({code:-109,info:"New versionIdx needed."});
				return;
			}

			if(preTag && preTag.tag === tag) {
				//修改当前的Tag
				if(!cmptb) {
					tagVO.cmpTags = [];
				}else{
					tagVO.cmpTags=preTag.cmpTags;
				}
				tagVO.main=diskJSON.main;
				//Record the versionIdx for install by vidx:
				tagVO.vidxes=(preTag.vidxes||[]);
				tagVO.vidxes.push(diskInfo.versionIdx);
				tags[tags.length-1]=tagVO;
			}else{
				//增加新的Tag
				if(preTag && cmptb) {
					tagVO.cmpTags = preTag.cmpTags?preTag.cmpTags.slice(0):[];
					tagVO.cmpTags.push(preTag.tag);
				}else{
					tagVO.cmpTags=[];
				}
				tagVO.main=diskJSON.main;
				tagVO.vidxes=[diskInfo.versionIdx];
				//tagVO=Object.assign(diskJSON,tagVO);
				tags.push(tagVO);
				pkgInfo.tag=tag;
			}
			//更新保存
			dbPkg.replaceOne({_id:pkgName},pkgInfo,(err)=>{
				if(err){
					res.json({code:-1,info:"DB error."});
					return;
				}
				res.json({code:200});
			});
		};

		//-----------------------------------------------------------------------
		//获得一个cpm包的信息:
		apiMap["pkgInfo"] = async function (req, res, next) {
			let reqVO,pkgName;
			let pkgInfo;
			let resVO;
			reqVO=req.body.vo;
			pkgName=reqVO.name;

			pkgInfo=await dbPkg.findOne({_id:pkgName});
			if(!pkgInfo){
				let userId,token,userInfo;
				userId=reqVO.userId;
				token=reqVO.token;
				if(!userId){
					res.json({code:-100,info:"Package not found."});
					return;
				}
				userInfo=await dbUser.findOne({_id:userId,token:token});
				if(!userInfo){
					res.json({code:-100,info:"Package not found."});
					return;
				}
				pkgInfo=await dbPkg.findOne({_id:`pkgName@${userInfo.email}`});
			}
			if(!pkgInfo){
				res.json({code:-100,info:"Package not found."});
				return;
			}
			resVO={code:200,pkg:pkgInfo};
			res.json(resVO);
		};

		//-----------------------------------------------------------------------
		//下载一个pkg包, 目前没有使用:
		apiMap["pkgCheckOut"] = async function (req, res, next) {
			let reqVO,pkgName,tag;
			let pkgInfo,tagVO,diskId,diskInfo;
			let tags,i,n;
			let resVO;

			reqVO=req.body.vo;
			pkgName=reqVO.pkgName;
			tag=reqVO.tag;
			
			pkgInfo=await dbPkg.findOne({_id:pkgName});
			if(!pkgInfo){
				res.json({code:-100,info:"Package not found."});
			}
			diskId=pkgInfo.diskId;
			diskInfo=await dbDisk.findOne({_id:diskId});
			if(!diskInfo){
				res.json({code:-101,info:"Disk not found."});
			}
			
			tag=tag||pkgInfo.tag;
			tags=pkgInfo.tags;
			n=tags.length;
			findTag:{
				for (i = 0; i < n; i++) {
					if(tags[i].tag===tag){
						tagVO=tags[i];
						break findTag;
					}
				}
				if(!tagVO){
					res.json({code:-102,info:"Package tag invalid."});
					return;
				}
			}
			resVO={
				code:200,
				json:tagVO,
			};
			//读取zip:
			{
				let zipPath;
				zipPath=diskInfo.path+"/"+tagVO.versionIdx+"files.zip";
				resVO.zipData=await fsp.readFile(zipPath,{encoding:"base64"});
			}
			res.json(resVO);
		};
	}

	//***********************************************************************
	//扩展用户CPM操作:
	//***********************************************************************
	{
		//-------------------------------------------------------------------
		//评价一个cpm
		apiMap["cpmCommentPost"] = async function (req, res, next) {
			//TODO: Code this:
		};

		//-------------------------------------------------------------------
		//回复一个cpm评价
		apiMap["cpmCommentReply"] = async function (req, res, next) {
			//TODO: Code this:
		};

		//-------------------------------------------------------------------
		//删除一个cpm评价
		apiMap["cpmCommentDel"] = async function (req, res, next) {
			//TODO: Code this:
		};

		//-------------------------------------------------------------------
		//给一个cpm打分:
		apiMap["cpmRateStar"] = async function (req, res, next) {
			//TODO: Code this:
		};

		//-------------------------------------------------------------------
		//提交一个cpm问题:
		apiMap["cpmIssuePost"] = async function (req, res, next) {
			//TODO: Code this:
		};

		//-------------------------------------------------------------------
		//更新一个cpm问题状态:
		apiMap["cpmIssueUpdate"] = async function (req, res, next) {
			//TODO: Code this:
		};

		//-------------------------------------------------------------------
		//评论一个cpm问题:
		apiMap["cpmIssueCommentPost"] = async function (req, res, next) {
			//TODO: Code this:
		};

		//-------------------------------------------------------------------
		//回复一个cpm问题评论:
		apiMap["cpmIssueCommentReply"] = async function (req, res, next) {
			//TODO: Code this:
		};
	}
};