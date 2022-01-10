const devPath="/Users/avdpro/sdk/cchome/disks";
const prdPath="/usr/cokecodes/disks";
const testPath="/Users/avdpro/sdk/cchome/testdisks";
module.exports ={
	"dev":{
		path:devPath,
		getDiskPath:function(diskName,email,userId){
			let idx;
			idx=parseInt(userId);
			if(!idx>0){
				throw "Invalid userId";
			}
			idx%=10;
			return devPath+"/"+idx+"/"+diskName+"@"+email;
		}
	},
	"test":{
		path:testPath,
		getDiskPath:function(diskName,email,userId){
			let idx;
			idx=parseInt(userId);
			if(!idx>0){
				throw "Invalid userId";
			}
			idx%=10;
			return testPath+"/"+idx+"/"+diskName+"@"+email;
		}
	},
	"production":{
		path:prdPath,
		getDiskPath:function(diskName,email,userId){
			let idx;
			idx=parseInt(userId);
			if(!idx>0){
				throw "Invalid userId";
			}
			idx%=1000;
			return prdPath+"/"+idx+"/"+diskName+"@"+email;
		}
	}
};