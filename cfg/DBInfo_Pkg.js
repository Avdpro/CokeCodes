let PkgStub= {
	_id:"coke",							//pkg的名字:
	diskId:"coke@avdpro@me.com",		//diskId
	tag:"v1",							//稳定版本tag
	devTag:"v2",						//开发版Tag,
	installNum:10,						//安装量
	dailyInstall:[],					//每日安装数量
	keywords:["coke"],					//关键词
	tags:[								//发布的版本
		{
			tag:"v1",
			versionIdx:32,				//对应的disk的versionIdx
			info:"First publish",		//发布信息
			publishTime:0,				//发布时间
			cmpTags:[],					//兼容的tag:
			diskJSON:"{}",				//diskJSON
			installNum:8,				//安装数量
			star1Num:0,					//1星评价数量:
			star2Num:0,					//2星评价数量:
			star3Num:0,					//3星评价数量:
			star4Num:0,					//4星评价数量:
			star5Num:0,					//5星评价数量:
		},
		{
			tag:"v2",					//tag
			versionIdx:37,				//对应的disk的versionIdx
			info:"Bug fix",				//发布信息
			publishTime:0,				//发布时间
			cmpTags:["v1"],				//兼容的tag:
			diskJSON:"{}",				//diskJSON
			installNum:2,				//安装数量
			star1Num:0,					//1星评价数量:
			star2Num:0,					//2星评价数量:
			star3Num:0,					//3星评价数量:
			star4Num:0,					//4星评价数量:
			star5Num:0,					//5星评价数量:
		},
	],
	//TODO: Comment，问题，
};
/*
//云盘操作
cld login username
cld checkin
cld checkout diskname [diskname]
cld commit
cld update
mod share <pkgName>
mod install [-local] <pkgName>
mod update <pkgName>
 */