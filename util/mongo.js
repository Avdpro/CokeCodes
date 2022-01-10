const { MongoClient } = require("mongodb");
var __Proto;

var MogoDB=function(app,url){
	this.client = new MongoClient(url);
	this.dbMap={};
	this.clDBMap={};
};

__Proto=MogoDB.prototype={};

//---------------------------------------------------------------------------
//初始化数据库
__Proto.initDB=async function() {
	await this.client.connect();
};

//---------------------------------------------------------------------------
//得到一个数据表
__Proto.collection=function(dbName,clName) {
	let db,cl,clMap;
	db=this.dbMap[dbName];
	clMap=this.clDBMap[dbName];
	if(!db){
		db=this.client.db(dbName);
		this.dbMap[dbName]=db;
		clMap=this.clDBMap[dbName]={};
	}
	cl=clMap[clName];
	if(!cl){
		cl=db.collection(clName);
		clMap[clName]=cl;
	}
	return cl;
};


module.exports = MogoDB;