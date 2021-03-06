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

// 正職須額外扣除的時間
var addTimeConditionHour = 2;

var MonthShift = 0;

// #計算 #店名 #計算數量 #UID
exports.CalculateAddlateTime = function(BrandName)
{
  //產生現在的年份與月份
    var _Year = moment().format('YYYY');
    var _Month = moment().format('MM') - MonthShift;

    //為了月份做處理，單位數的補零，雙位數的轉字串
    if(_Month<10){_Month='0'+_Month;}
    _Month = _Month.toString();
    console.log(' Date = ', _Year+'/'+_Month);
    
  	dbtoken.collection('memberbrandinformation').find({'userbrandname':BrandName}).toArray(function(err, results) {
      // console.log(' result = ',results);
      for( var i = 0; i<results.length; i++ ) {
           RemoveMonthAddLateData(results[i].uniID,_Year,_Month);
           setTimeout(CalculateAddLate(results[i].uniID,_Year,_Month,results[i].userbrandtitle),2000);
      }
  	});  
 }

 function CalculateAddLate(UniID,Year,Month,Title)
 {

    dbtest.collection('synconlineofflinedata').find({'uniID':UniID,'Year':Year,'Month':Month}).sort({"name": 1,"Day": 1}).toArray(function(err, data ) 
    {
    	var count = 0;var arr =[];
    	dbtest.collection('synworkscheduledata').find({'uniID':UniID,'workyear':Year,'workmonth':Month}).sort({"name": 1,"workday": 1,"Hour" :1}).toArray(function(err, results) {
    		for( var i = 0; i<results.length; i++ ) { arr.push([]);}
            for( var i = 0; i<results.length; i++ )
            {
                //CannotFindSameDate主要是用來判斷有排班但沒上班的狀況
                var CannotFindSameOfflineDate = false;
                for( var j = 0; j<data.length; j++ )
                {
                    if( (results[i].workyear == data[j].Year) && (results[i].workmonth == data[j].Month) && (results[i].workday == data[j].Day) && (data[j].SalaryCountStatus == false))
                    {
                        if(data[j].status=='上班')
                        { 
                                  arr[i]['name'] = results[i].name;
                                  arr[i]['uniID'] = results[i].uniID;
                                  arr[i]['Year'] = results[i].workyear;
                                  arr[i]['Month'] = results[i].workmonth;
                                  arr[i]['Day'] = results[i].workday;
                                  arr[i]['onlinehour'] = results[i].onlinehour;
                                  arr[i]['onlineminute'] = results[i].onlineminute;
                                  arr[i]['realonlinehour'] = data[j].Hour;
                                  arr[i]['realonlineminute'] = data[j].Minute;
                                  arr[i]['offlinehour'] = results[i].offlinehour;
                                  arr[i]['offlineminute'] = results[i].offlineminute;
                                  // UpdateWorkPeriodData(results[i].uniID,results[i].workyear,results[i].workmonth,results[i].workday,data[j].Hour,data[j].Minute);            
                                  CannotFindSameOnlineDate = true;
                        }
                        else
                        {
                                  arr[i]['realofflinehour'] = data[j].Hour; 
                                  arr[i]['realofflineminute'] = data[j].Minute;
                        		      // UpdateWorkPeriodData(results[i].uniID,results[i].workyear,results[i].workmonth,results[i].workday,data[j].Hour,data[j].Minute);
                                  CannotFindSameOfflineDate = true;
                        } 
                        
                    }
                }    
                var RealOnlineLate = parseInt(arr[i]['realonlinehour'],10)*60 + parseInt(arr[i]['realonlineminute'],10);
                var ScheduleOnlineLate = parseInt(arr[i]['onlinehour'],10)*60 + parseInt(arr[i]['onlineminute'],10);
                if( RealOnlineLate < ScheduleOnlineLate){arr[i]['lateTime'] = 0;}
                else{arr[i]['lateTime'] =  RealOnlineLate  - ScheduleOnlineLate;}

                var RealOfflineAdd = parseInt(arr[i]['realofflinehour'],10)*60 + parseInt(arr[i]['realofflineminute'],10);
                var ScheduleOfflineAdd = (parseInt(arr[i]['offlinehour'],10)-addTimeConditionHour)*60+parseInt(arr[i]['offlineminute'],10);
                var ScheduleOfflineAddPartTime = parseInt(arr[i]['offlinehour'],10)*60+parseInt(arr[i]['offlineminute'],10);
                
                if(Title == '正職')
                {
                  if( RealOfflineAdd < ScheduleOfflineAdd ){arr[i]['addTime'] = 0;}
                  else{arr[i]['addTime'] = RealOfflineAdd - ScheduleOfflineAdd;}
                }
                else
                {
                  if( RealOfflineAdd < ScheduleOfflineAddPartTime){arr[i]['addTime'] = 0;}
                  else{arr[i]['addTime'] = RealOfflineAdd - ScheduleOfflineAddPartTime;}                  
                }

                if(CannotFindSameOnlineDate == true && CannotFindSameOfflineDate == true)
                {
                    // UpdateWorkScheduleData(results[i].uniID,results[i].workyear,results[i].workmonth,results[i].workday);
                    dbtest.collection('syneverydayaddlatestatus').save({TID:parseInt(Date.now(),10)+parseInt(arr[i].Day,10),uniID:arr[i].uniID,name:arr[i].name,Year:arr[i].Year,Month:arr[i].Month,Day:arr[i].Day,onlinehour:arr[i].onlinehour,onlineminute:arr[i].onlineminute,realonlinehour:arr[i].realonlinehour ,realonlineminute:arr[i].realonlineminute,offlinehour:arr[i].offlinehour,offlineminute:arr[i].offlineminute,realofflinehour:arr[i].realofflinehour,realofflineminute:arr[i].realofflineminute,addtime:arr[i].addTime,latetime:arr[i].lateTime,countcheck:'check'},function(err,result){
                        if(err)return console.log(err);
                    });
                }            	
            }
    	});
   	});
    // console.log(' data = ',data);
 }

function RemoveMonthAddLateData(_uniid,_year,_month)
{
  console.log('_uniid =',_uniid);console.log('_year =',_year);console.log('_month =',_month);
  dbtest.collection('syneverydayaddlatestatus').remove({uniID:_uniid,Year:_year,Month:_month});
}

function UpdateWorkPeriodData(_uniid,_year,_month,_day,_hour,_minute)
{
  dbwork.collection('updateworkperiod').findOneAndUpdate({uniID:_uniid,Year:_year,Month:_month,Day:_day,Hour:_hour,Minute:_minute},{
    $set: 
    {
      SalaryCountStatus: 'true',
    }
  },{
      sort: {_id: -1},
      upsert: true
  },(err, result) => {
    if (err) return res.send(err)
  });
}

function UpdateWorkScheduleData(_uniid,_year,_month,_day)
{
  dbwork.collection('updateworkschedule').findOneAndUpdate({uniID:_uniid,workyear:_year,workmonth:_month,workday:_day},{
    $set: 
    {
      schedulecheck: 'true',
    }
  },{
      sort: {_id: -1},
      upsert: true
  },(err, result) => {
    if (err) return res.send(err)
  });
}


function RemoveHaveWorkButNoSchedule(_uniid,_year,_month)
{
  console.log('_uniid =',_uniid);console.log('_year =',_year);console.log('_month =',_month);
  dbtest.collection('checkhaveworkbutnoschedule').remove({uniID:_uniid,Year:_year,Month:_month});
}
exports.CheckHaveWorkButNoSchedule = function(BrandName)
{
  //產生現在的年份與月份
    var _Year = moment().format('YYYY');
    var _Month = moment().format('MM') - MonthShift;

    //為了月份做處理，單位數的補零，雙位數的轉字串
    if(_Month<10){_Month='0'+_Month;}
    _Month = _Month.toString();
    console.log(' Date = ', _Year+'/'+_Month);
    
    dbtoken.collection('memberbrandinformation').find({'userbrandname':BrandName}).toArray(function(err, results) {
      // console.log(' result = ',results);
      for( var i = 0; i<results.length; i++ ) {
           RemoveHaveWorkButNoSchedule(results[i].uniID,_Year,_Month);
           setTimeout(HaveWorkButNoSchedule(results[i].uniID,_Year,_Month,results[i].userbrandtitle),2000);
      }
    });  
 }
function HaveWorkButNoSchedule(UniID,Year,Month,Title)
 {

    dbtest.collection('synconlineofflinedata').find({'uniID':UniID,'Year':Year,'Month':Month}).sort({"name": 1,"Day": 1}).toArray(function(err, data ) 
    {
      dbtest.collection('synworkscheduledata').find({'uniID':UniID,'workyear':Year,'workmonth':Month}).sort({"name": 1,"workday": 1,"Hour" :1}).toArray(function(err, results) {
            for( var i = 0; i<data.length; i++ )
            {
                var IsHaveWorkButNoSchedule = true;
                for( var j = 0; j<results.length; j++ )
                {
                    if( (results[j].workyear == data[i].Year) && (results[j].workmonth == data[i].Month) && (results[j].workday == data[i].Day))
                    {
                      IsHaveWorkButNoSchedule = false;
                    }
                }  
                if(IsHaveWorkButNoSchedule == true)
                {
                  dbtest.collection('checkhaveworkbutnoschedule').save({TID:parseInt(Date.now(),10)+parseInt(data[i].Day,10),uniID:UniID,name:data[i].name,Year:data[i].Year,Month:data[i].Month,Day:data[i].Day,status:'有上下班資訊但沒排班'},function(err,result){
                      if(err)return console.log(err);
                  });
                  console.log(' name = ',data[i].name,' date = ',data[i].Year,'/',data[i].Month,'/',data[i].Day); 
                }           
            }
      });
    });
 }


function RemoveHaveScheduleButNoWork(_uniid,_year,_month)
{
  //console.log('_uniid =',_uniid);console.log('_year =',_year);console.log('_month =',_month);
  dbtest.collection('checkhaveschedulebutnowork').remove({uniID:_uniid,Year:_year,Month:_month});
}
exports.CheckHaveScheduleButNoWork = function(BrandName)
{
  //產生現在的年份與月份
    var _Year = moment().format('YYYY');
    var _Month = moment().format('MM') - MonthShift;

    //為了月份做處理，單位數的補零，雙位數的轉字串
    if(_Month<10){_Month='0'+_Month;}
    _Month = _Month.toString();
    console.log(' Date = ', _Year+'/'+_Month);
    
    dbtoken.collection('memberbrandinformation').find({'userbrandname':BrandName}).toArray(function(err, results) {
      // console.log(' result = ',results);
      for( var i = 0; i<results.length; i++ ) {
           RemoveHaveScheduleButNoWork(results[i].uniID,_Year,_Month);
           setTimeout(HaveScheduleButNoWork(results[i].uniID,_Year,_Month,results[i].userbrandtitle),2000);
      }
    });  
 }
 function HaveScheduleButNoWork(UniID,Year,Month,Title)
 {

    dbtest.collection('synconlineofflinedata').find({'uniID':UniID,'Year':Year,'Month':Month}).sort({"name": 1,"Day": 1}).toArray(function(err, data ) 
    {
      dbtest.collection('synworkscheduledata').find({'uniID':UniID,'workyear':Year,'workmonth':Month}).sort({"name": 1,"workday": 1,"Hour" :1}).toArray(function(err, results) {
            for( var i = 0; i<results.length; i++ )
            {
                var IsHaveScheduleButNoWork = true;
                for( var j = 0; j<data.length; j++ )
                {
                    if( (results[i].workyear == data[j].Year) && (results[i].workmonth == data[j].Month) && (results[i].workday == data[j].Day))
                    {
                      IsHaveScheduleButNoWork = false;
                    }
                }  
                if(IsHaveScheduleButNoWork == true)
                {
                  dbtest.collection('checkhaveschedulebutnowork').save({TID:parseInt(Date.now(),10)+parseInt(results[i].workday,10),uniID:UniID,name:results[i].name,Year:results[i].workyear,Month:results[i].workmonth,Day:results[i].workday,status:'有排班資訊但沒上下班資訊'},function(err,result){
                      if(err)return console.log(err);
                  });
                  console.log(' name = ',results[i].name,' date = ',results[i].workyear,'/',results[i].workmonth,'/',results[i].workday); 
                }           
            }
      });
    });
 }
