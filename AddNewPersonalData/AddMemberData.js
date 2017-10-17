MongoClient = require('mongodb').MongoClient;

var dbtoken;
MongoClient.connect('mongodb://9kingson:mini0306@ds111622.mlab.com:11622/usertokenrelatedinformation', function(err, database){ 
  if (err) return console.log(err);
  dbtoken = database;
})

var dbwork;
MongoClient.connect('mongodb://9kingson:9kingson@ds149382.mlab.com:49382/workinformation', function(err, database){ 
  if (err) return console.log(err);
  dbwork = database;
})

var dbtest;
MongoClient.connect('mongodb://9kingson:mini0306@ds163294.mlab.com:63294/testdatabase', function(err, database){ 
  if (err) return console.log(err);
  dbtest = database;
})

const crypto = require("crypto");
var Promise = require('rsvp').Promise;

exports.AddNewMemberData = function(_name,_userbrandtitle,_userbrandname,_userbrandplace,_usermonthsalary,_userfoodsalary,_userwithoutsalary,_usertitlesalary,_userextrasalary,_userlawsalary)
{
	const _id = crypto.randomBytes(6).toString("hex");
	AddNewMemberDataToDataBase(_id,_name,_userbrandtitle,_userbrandname,_userbrandplace,_usermonthsalary,_userfoodsalary,_userwithoutsalary,_usertitlesalary,_userextrasalary,_userlawsalary);
  GetNameFromMemberDataBase(_userbrandname,_userbrandplace).then(function(items) 
  {
          console.log('items =',items[0].name);
      var GetDataDependOnName = items[0].name;
      GetDeviceIDFromUserTokenRelatedInformation(GetDataDependOnName).then(function(inneritems) 
      {
          console.log('inneritems =',inneritems[0].deviceid);
          var _DeviceID = inneritems[0].deviceid;
          AddOnlineUserTokenToDataBase(_id,_DeviceID,_name);
          AddOfflineUserTokenToDataBase(_id,_DeviceID,_name);
      }, function(err) {
          console.error('The promise was rejected', err, err.stack);
      }); 
  }, function(err) {
          console.error('The promise was rejected', err, err.stack);
  }); 	
  console.log(_id); // => f9b327e70bbcf42494ccb28b2d98e00e	
}

AddNewMemberDataToDataBase = function(_uniID,_Name,_UserBrandTitle,_UserBrandName,_UserBrandPlace,_UserMonthSalary,_UserFoodSalary,_UserWithoutSalary,_UserTitleSalary,_UserExtraSalary,_UserLawSalary)
{
  dbtoken.collection('memberbrandinformation').save({uniID:_uniID,name:_Name,userbrandtitle:_UserBrandTitle,userbrandname:_UserBrandName,userbrandplace:_UserBrandPlace,usermonthsalary:_UserMonthSalary,userfoodsalary:_UserFoodSalary,userwithoutsalary:_UserWithoutSalary,usertitlesalary:_UserTitleSalary,userextrasalary:_UserExtraSalary,userlawsalary:_UserLawSalary,userfirstarrival:'1'},function(err,result){
    if(err)return console.log(err);
  });
} 

AddOnlineUserTokenToDataBase = function(_uniID,_DeviceID,_Name)
{
  var _Status = '上班';
  var _Usertoken = crypto.randomBytes(32).toString("hex");
  console.log('_uniID =',_uniID);
  console.log('_DeviceID =',_DeviceID);
  console.log('_Usertoken =',_Usertoken);
  console.log('_Name =',_Name);
  console.log('_Status =',_Status);

  dbtoken.collection('usertokenrelatedinformationcollection').save({uniID:_uniID,deviceid:_DeviceID,usertoken:_Usertoken,name:_Name,status:_Status},function(err,result){
    if(err)return console.log(err);
  });  
}

AddOfflineUserTokenToDataBase = function(_uniID,_DeviceID,_Name)
{
  var _Status = '下班';
  var _Usertoken = crypto.randomBytes(32).toString("hex");
  console.log('_uniID =',_uniID);
  console.log('_DeviceID =',_DeviceID);
  console.log('_Usertoken =',_Usertoken);
  console.log('_Name =',_Name);
  console.log('_Status =',_Status);
  dbtoken.collection('usertokenrelatedinformationcollection').save({uniID:_uniID,deviceid:_DeviceID,usertoken:_Usertoken,name:_Name,status:_Status},function(err,result){
    if(err)return console.log(err);
  });  
}

GetNameFromMemberDataBase = function(_UserBrandName,_UserBrandPlace)
{
  return new Promise(function(resolve, reject) 
  {
      dbtoken.collection('memberbrandinformation').find({userbrandname:_UserBrandName,userbrandplace:_UserBrandPlace}).toArray(function(err, results) {
        if (err){ 
                  reject(err);
        } else {
                  resolve(results);
        }
      });
  });
}

GetDeviceIDFromUserTokenRelatedInformation = function(_Name)
{
  return new Promise(function(resolve, reject) 
  {
      dbtoken.collection('usertokenrelatedinformationcollection').find({name:_Name}).toArray(function(err, results) {
        if (err){ 
                  reject(err);
        } else {
                  resolve(results);
        }
      });
  });
}
