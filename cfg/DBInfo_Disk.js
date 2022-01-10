//---------------------------------------------------------------------------
//磁盘对象
let DiskStub={
	_id:"ccedit@avdpro@me.com",		//磁盘Id
	name:"ccedit",					//磁盘名称，
	showName:"CCEdit",				//磁盘显示名称
	userId:"10000",					//用户Id
	user:{
		userId:"10000",				//用户Id
		email:"avdpro@me.com",		//用户email
		name:"avdpro"				//用户名
	},
	type:"Project",					//类型: Project, Lib, App...
	path:"disk711",					//磁盘目录位置
	public:0,						//是否公开
	version:"0.0.1",				//版本号字符串
	versionIdx:11,					//自增数字版本号
	checkInTime:0,					//创建时间
	lastUpdateTime:0,				//最后一次更新时间
	lastUpdateUser:{
		userId:"10000",				//用户Id
		email:"avdpro@me.com",		//用户email
		name:"avdpro"				//用户名
	},
	shortInfo:"This is the CCEdit",	//短说明
	members:[						//成员
		{
			userId:"10000",
			email:"avdpro@me.com",	//用户email
			name:"avdpro",			//用户名
			role:"OWNER",			//OWNER, MANAGER, DEVELOPER, TESTER
		},
	],
	followUserNum:100,				//follow的用户数量
	tags:[							//Tag，tag是可以check-out的版本
		{
			name:"initial",
			info:"Fist run!",
			time:0,
			version:"0.0.1",
			versionIdx:2,
		},
		{
			name:"initial",
			info:"重写备份",
			time:0,
			version:"0.0.1",
			versionIdx:7,
		},
	],
	fovNum:100,
	points:1000,
	updateLocker:"10000",			//正在提交更新的用户
	updateKey:"129485",				//这次提交的key
	updateLockExpire:0,				//提交Key过期时间
	diskSize:1000,					//磁盘内容尺寸
	totalFileNum:64,				//文件数量
};

//---------------------------------------------------------------------------
//一次磁盘版本提交:
let DiskUpdate={
	_id:"7@ccedit@avdpro@me.com",
	disk:"ccedit@avdpro@me.com",
	version:"0.0.1",
	versionIdx:3,							//版本自增序号
	userId:"10000",							//提交更新的用户
	time:0,									//更新提交时间
	info:"Bug fix",							//提交说明
	updateJSONPath:"/updates9/",			//提交数据路径
};

//---------------------------------------------------------------------------
//磁盘评论
let DiskComments={
	_id:"ccedi@avdpro@me.com",
	topics:[
		{
			userId:"avdpro@me.com",
			text:"New version is incomming!",
			time:0,
			points:100,
			replys:[
				{
					userId:"bruce@163.com",
					text:"Great!",
					time:0,
					points:10,
				},
				{
					userId:"lisa@163.com",
					text:"Yeah!",
					replyTo:"bruce@163.com",
					time:0,
				}
			]
		}
	]
};