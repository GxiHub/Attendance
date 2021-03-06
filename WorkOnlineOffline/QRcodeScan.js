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

var Promise = require('rsvp').Promise;

exports.CheckDeviceIDAndToken = function(DeviceID,Token)
{
      console.log( 'DeviceID = ',DeviceID,' Token = ',Token);
      return new Promise(function(resolve, reject) 
      {
          var collection = dbtoken.collection('usertokenrelatedinformationcollection');
          collection.findOne({ deviceid:DeviceID,usertoken:Token}, function(err, data )
          {
              console.log(data);
              if (err) { 
                  reject(err);
              } else {
                  resolve(data);
              }
          });
      });
 }

exports.CheckUserUniID = function(_UniID)
{
      return new Promise(function(resolve, reject) 
      {
          var collection = dbtoken.collection('memberbrandinformation');
          collection.findOne({uniID:_UniID}, function(err, data )
          {
              // console.log(data);
              if (err) { 
                  reject(err);
              } else {
                  resolve(data);
              }
          });
      });
 }

exports.EmployeeWorkTimeAndStatus = function(OnlyID,UserName,WorkStatus)
{
  var Work_Year = moment().format('YYYY');
  var Work_Month = moment().format('MM');
  var Work_Day = moment().format('DD');
  var Work_Hour = moment().format('HH');
  var intWorkHour = parseInt(Work_Hour,10)+8;
  if(intWorkHour>23)
  {
    intWorkHour=intWorkHour-24;
    if(intWorkHour<10){ intWorkHour = '0'+intWorkHour;}
  }
  Work_Hour = intWorkHour;
  console.log( 'Work_Hour = ',Work_Hour);
  var Work_Minute = moment().format('mm');
  var SalaryStatus = false;
  dbwork.collection('workperiod').save({TID:Date.now(),uniID:OnlyID,name:UserName,status:WorkStatus,Year:Work_Year,Month:Work_Month,Day:Work_Day,Hour:Work_Hour,Minute:Work_Minute,SalaryCountStatus:SalaryStatus,addworkstatus:'0',extrainfo1:'0',extrainfo2:'0'},function(err,result){
     if(err)return console.log(err);
  });
}

exports.CheckSingleDayOnlineOfflineByBrandNameAndDate = function(year,month,day)
{
    return new Promise(function(resolve, reject) 
    {

      		dbwork.collection('workperiod').find({'Year':year,'Month':month,'Day':day}).sort({"name": 1}).toArray(function(err, data) {
	              console.log(data);
	              if (err) { 
	                  reject(err);
	              } else {
	                  resolve(data);
	              }
            });
    });
}

exports.CheckMonthOnlineOfflineByBrandNameAndMonth = function(year,month,name)
{
    return new Promise(function(resolve, reject) 
    {
    	if(name == '全部')
    	{
      		dbwork.collection('workperiod').find({'Year':year,'Month':month}).sort({"name": 1,"Year": 1,"Month":1,"Day":1}).toArray(function(err, data) {
	              if (err) { 
	                  reject(err);
	              } else {
	                  resolve(data);
	              }
            });
      	}
      	else
      	{
      		dbwork.collection('workperiod').find({'Year':year,'Month':month,'name':name}).sort({"name": 1,"Day": 1}).toArray(function(err, data) {
	              console.log('data = ',data);
                if (err) { 
	                  reject(err);
	              } else {
	                  resolve(data);
	              }
            });
      	}
    });
}

// [查詢] 
exports.AdjustOnlineOfflineData = function()
{
	//#修改資料庫成 workperiod
    var _Year = moment().format('YYYY');
    var _Month = moment().format('MM');
    _Month = _Month.toString();
    var _PreviousMonth = moment().format('MM')-1;
    if(_Month == '01')
    {
      var _PreviousMonth = '12';
      var _PreviousYear = parseInt(_Year,10) -1;
      console.log('_PreviousYear =',_PreviousYear," _PreviousMonth = ",_PreviousMonth);
    }
    else
    { 
      var _PreviousMonth = moment().format('MM')-1;
      _PreviousMonth = '0'+_PreviousMonth;
      var _PreviousYear = _Year;
    }
    _PreviousMonth = _PreviousMonth.toString();
    _PreviousYear = _PreviousYear.toString();
    console.log(_Year,'/',_Month,'-',_PreviousYear,'/',_PreviousMonth);
    return new Promise(function(resolve, reject) 
    {
          dbwork.collection('workperiod').find({$or:[{'Year':_Year,'Month':_Month},{'Year':_PreviousYear,'Month':_PreviousMonth}]}).sort({"name": 1,"Year":1,"Month":1,"Day": 1}).toArray(function(err, data) {
	              // console.log(data);
	              if (err) { 
	                  reject(err);
	              } else {
	                  resolve(data);
	              }
            });
    });
}

exports.DeleteOnlineOfflineData = function(OnlyID,UserName,_Year,_Month,_Day)
{
  console.log(' OnlyID= ',OnlyID);
  console.log(' UserName= ',UserName);
    dbwork.collection('workperiod').findOneAndDelete({TID:parseInt(OnlyID,10),name:UserName},
    (err, result) => {
      if (err) return res.send(500, err);
    });
}

exports.UpdateOnlineOfflineData = function(_UniqueID,_UpdateHour,_UpdateMinute,_UpdateDay,_UpdateMonth,_UpdateYear,_Name)
{ 
  console.log('_UniqueID=',_UniqueID);
  console.log('_UpdateHour=',_UpdateMonth);
  console.log('_UpdateMinute=',_UpdateDay);
  console.log('_UpdateHour=',_UpdateHour);
  console.log('_UpdateMinute=',_UpdateMinute);
  console.log('_UpdateYear=',_UpdateYear);
  console.log('_Name=',_Name);
  
  dbwork.collection('workperiod').findOneAndUpdate({TID:parseInt(_UniqueID,10),name:_Name},{
    $set: 
    {
      Hour: _UpdateHour,
      Minute:_UpdateMinute,
      Day:_UpdateDay,
      Month:_UpdateMonth,
      Year:_UpdateYear

    }
  },{
      upsert: true
  },(err, result) => {
    if (err) return res.send(err)
  });
}