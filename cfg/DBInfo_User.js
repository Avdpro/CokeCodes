let UserStub={
	//基础信息:
	_id:"10001",//用户唯一Id
	name:"Avdpro",//用户名
	email:"avdpro@me.com",//用户电子信箱地址
	passwordSHA:"368163618EEFAA",//密码的SHA
	regTime:0,//注册时间
	photo:"",//用户头像

	//财产/等级信息:
	rank:"GUEST",//用户等级: GUEST, MEMBER, VIP, LEADER, MASTER, LORD
	rankExpire:0,//用户等级过期时间
	points:0,//积分数量
	coins:0,//金币数量

	//登录信息:
	token:"76AAFFCCD",//登录token
	lastLogin:0,//上一次登录时间
	tokenExpire:0,//登录token过期时间
	liveServer:"ws3039",//用户登录使用的apiPath服务器

	//用户相关磁盘信息:
	disks:["ccedit.avdpro@me.com","cody.avdpro@me.com"],//用户云同步的磁盘
	followDisks:["ccedit.bruce@gmail.com"],//用户追踪的磁盘
	memberDisks:["ccedit.bruce@gmail.com"],//用户参与开发的磁盘
	publishDisks:["ccedit.avdpro@me.com"],//用户发布的磁盘

	//重置密码:
	resetPswdCode:"",
	resetPswdTime:0,

	//电子信认证
	saveVO:0,
	emailVarifyCode:"aaaa"
};
