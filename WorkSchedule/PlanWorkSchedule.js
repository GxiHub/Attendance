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

SettingPage= require('./../setting');

var Promise = require('rsvp').Promise;

// [新增][Origin] #單筆 #年月日 #上班時間 #下班時間 
exports.AddEmployeeWorkScheduleFunction = function(Name,Year,Month,Day,OnlineHour,OnlineMinute,OfflineHour,OfflineMinute)
{
    SettingPage.PromiseGetBrandInfo(Name).then(function(items) 
    {
	  var UniID = items.uniID;var Brand = items.userbrandname;var Place = items.userbrandplace;var UserName = Name; 
	  var checkPeriodYear = Year;var checkPeriodMonth = Month;var checkPeriodDay = Day;
	  var checkPeriodOnlineHour = OnlineHour;var checkPeriodOnlineMinute = OnlineMinute;
	  var checkPeriodOfflineHour = OfflineHour;var checkPeriodOfflineMinute = OfflineMinute;

	  dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:checkPeriodDay,onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){
	     if(err)return console.log(err);
	  });
    }, function(err) {
          console.error('The promise was rejected', err, err.stack);
    });  
}

// [新增][Origin] #多筆 #年月 #店名 #上班時間 #下班時間
exports.AddMultipleEmployeeWorkScheduleFunction = function(Name,Year,Month,OnlineHour,OnlineMinute,OfflineHour,OfflineMinute,
	 													  checkbox01,checkbox02,checkbox03,checkbox04,checkbox05,checkbox06,checkbox07,checkbox08,checkbox09,checkbox10,
	 													  checkbox11,checkbox12,checkbox13,checkbox14,checkbox15,checkbox16,checkbox17,checkbox18,checkbox19,checkbox20,
	 													  checkbox21,checkbox22,checkbox23,checkbox24,checkbox25,checkbox26,checkbox27,checkbox28,checkbox29,checkbox30,checkbox31)
{
     SettingPage.PromiseGetBrandInfo(Name).then(function(items) 
     {
	  	var UniID = items.uniID;var Brand = items.userbrandname;var Place = items.userbrandplace;var UserName = Name; 
	  	var checkPeriodYear = Year;var checkPeriodMonth = Month;
	  	var checkPeriodOnlineHour = OnlineHour;var checkPeriodOnlineMinute = OnlineMinute;
	  	var checkPeriodOfflineHour = OfflineHour;var checkPeriodOfflineMinute = OfflineMinute;
	  	//#修改資料庫成 employeeworkschedule
        if(checkbox01 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'01',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
        if(checkbox02 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'02',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
        if(checkbox03 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'03',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
        if(checkbox04 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'04',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
        if(checkbox05 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'05',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
        if(checkbox06 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'06',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
        if(checkbox07 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'07',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
        if(checkbox08 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'08',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
        if(checkbox09 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'09',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
        if(checkbox10 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'10',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
        if(checkbox11 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'11',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
        if(checkbox12 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'12',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
        if(checkbox13 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'13',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
        if(checkbox14 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'14',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
        if(checkbox15 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'15',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
        if(checkbox16 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'16',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
        if(checkbox17 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'17',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
        if(checkbox18 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'18',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
		    if(checkbox19 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'19',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
		    if(checkbox20 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'20',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
		    if(checkbox21 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'21',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
		    if(checkbox22 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'22',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
		    if(checkbox23 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'23',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
		    if(checkbox24 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'24',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
		    if(checkbox25 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'25',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
		    if(checkbox26 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'26',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
		    if(checkbox27 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'27',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
		    if(checkbox28 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'28',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
		    if(checkbox29 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'29',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
		    if(checkbox30 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'30',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
		    if(checkbox31 == 'on'){dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:'31',onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){if(err)return console.log(err);});}
         
      }, function(err) {
            console.error('The promise was rejected', err, err.stack);
      });      
}


// [查詢][Origin] #列表 #年月日 #店名 #全店 #單月上班
exports.CheckWorkScheduleByList = function(_Year,_Month)
{
    if(_Month == null)
    {
      Month = moment().format('MM');
      Year = moment().format('YYYY');
      var _PreviousMonth = moment().format('MM')-1;
      _PreviousMonth = _PreviousMonth.toString();
    }
    else
    {
      Month = _Month;
      Year = _Year;
      var _PreviousMonth = Month-1;
      _PreviousMonth = _PreviousMonth.toString();
    }

    return new Promise(function(resolve, reject) 
    {
      dbwork.collection('employeeworkschedule').find({$or:[{'workyear':Year,'workmonth':Month},{'workyear':Year,'workmonth':_PreviousMonth}]}).sort({"name": 1,"workyear": 1,"workmonth": 1,"workday": 1}).toArray(function(err, results) {       
      // dbwork.collection('employeeworkschedule').find({'workyear':Year,'workmonth':Month}).sort({"name": 1,"workday": 1}).toArray(function(err, results) {       
         if (err) { 
              reject(err);
         } else {
              resolve(results);
         }

      });
    });
}

// [查詢][Origin] #群組 #年月日 #店名  #全店 #單月上班
exports.CheckWorkSchedule = function(_Year,_Month)
{
    if(_Month == null){Month = moment().format('MM');_Year = moment().format('YYYY');}
    else{Month = _Month;Year = _Year;}

    return new Promise(function(resolve, reject) 
    {
    	var arraylength = 0;
    	if(Month == '01' || Month == '03' || Month == '05' || Month == '07' || Month == '08' || Month == '10' || Month == '12'){ arraylength = 31; }
		  else if(Month == '02'){ arraylength = 28; }
		  else { arraylength = 30; } 

  		dbwork.collection('employeeworkschedule').find({'workyear':Year,'workmonth':Month}).toArray(function(err, results) {       
           var count = 0;var arr = [];         

           for( var i = 0; i<arraylength; i++ ) {
              var day = i + 1;
              arr.push([]);
           }
           while(results[count]!=null)
           {  
              var indexleft = parseInt(results[count].workday,10)-1;
              var indexright = results[count].name+' '+results[count].onlinehour+':'+results[count].onlineminute+'-'+results[count].offlinehour+':'+results[count].offlineminute;
              arr[indexleft].push(indexright);
              count++;
           }     
            // console.log(' arr = ',arr);
           results = arr;
	       
	       if (err) { 
	            reject(err);
	       } else {
	            resolve(results);
	       }

        });
    });
}

// #查詢 #排班狀況
exports.AdjustWorkSchedule = function()
{
  var _Year = moment().format('YYYY');
  var _Month = moment().format('MM');
  _Month = _Month.toString();
  if(_Month == '01')
  {
    var _PreviousMonth = '12';
    var _PreviousYear = parseInt(_Year,10) -1;
    console.log('_PreviousYear =',_PreviousYear," _PreviousMonth = ",_PreviousMonth);
  }
  else
  { 
    var _PreviousMonth = moment().format('MM')-1;
    var _PreviousYear = _Year;
  }
  _PreviousMonth = _PreviousMonth.toString();
  _PreviousYear = _PreviousYear.toString();
  return new Promise(function(resolve, reject) 
  {
   
      dbwork.collection('employeeworkschedule').find( {$or:[{'workyear':_Year,'workmonth':_Month},{'workyear':_PreviousYear,'workmonth':_PreviousMonth}]}).sort({"name": 1,"workyear": 1,"workmonth": 1,"workday": 1}).toArray(function(err, results) {
	    // dbwork.collection('employeeworkschedule').find({'workyear':_Year,'workmonth':_Month}).sort({"name": 1,"workyear": 1,"workmonth": 1,"workday": 1}).toArray(function(err, results) {
  		  if (err){ 
  		            reject(err);
  		  } else {
  		            resolve(results);
  		  }
      });
  });
}

// #刪除 #排班資料
exports.DeleteWorkSchdeule = function(_UniqueID,_Year,_Month,_Day)
{
    dbwork.collection('employeeworkschedule').findOneAndDelete({TID:parseInt(_UniqueID,10),workyear:_Year,workmonth:_Month,workday:_Day},
    (err, result) => {
      if (err) return res.send(500, err);
    });
}
