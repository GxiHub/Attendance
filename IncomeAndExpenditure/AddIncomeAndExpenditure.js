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

AddIncomeAndExpenditureData = function(_Year,_Month,_Day,_Name,_Class,_SubClass)
{
  console.log('_Year =',_Year);
  console.log('_Month =',_Month);
  console.log('_Day =',_Day);
  console.log('_Name =',_Name);
  console.log('_Class =',_Class);
  console.log('_SubClass =',_SubClass);

  // dbtoken.collection('usertokenrelatedinformationcollection').save({uniID:_uniID,deviceid:_DeviceID,usertoken:_Usertoken,name:_Name,status:_Status},function(err,result){
  //   if(err)return console.log(err);
  // });  
}