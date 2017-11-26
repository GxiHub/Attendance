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



exports.MonthWorkSchedule = function(_BrandButton)
{
	//產生現在的年份與月份
  	var _Year = GetNeedSyncYear();
  	var _Month = GetNeedSyncMonth();

  	// AddMonthAllDaySchedule(_Year,_Month,_BrandButton);

  	// FullfillMonthWorkSchedule(_Year,_Month,_BrandButton);
    // CheckAllOnlineAndOffline(_Year,_Month,_BrandButton);
  	CheckAllPersonAddAndLate(_Year,_Month,_BrandButton);


}

function GetNeedSyncYear()
{
	var Year = moment().format('YYYY');
	Year = Year.toString();
	return Year;
} 

function GetNeedSyncMonth(_MonthShift)
{
	var MonthShift = 1;
	var Month = moment().format('MM') - MonthShift;
  	//為了月份做處理，單位數的補零，雙位數的轉字串
  	if(Month<10){Month='0'+Month;}
  	Month = Month.toString();

	return Month;
} 

// ====================== 新增單月每天排班情況 ===============================
function AddMonthAllDaySchedule(_Year,_Month,_BrandButton)
{
  	dbtoken.collection('memberbrandinformation').find({'userbrandname':_BrandButton}).toArray(function(err, results) {
      for( var i = 0; i<results.length; i++ ) {
      	      console.log(' result[',i,'].uniID = ',results[i].uniID);
      	      if(results[i].userbrandtitle != '離職')
      	      {
      	      	CreatePersonalMonthAllDaySchedule(_Year,_Month,results[i].uniID,results[i].userbrandtitle,results[i].userbrandname,results[i].userbrandplace,results[i].name);
      		  }
      }
  	});
}

function CreatePersonalMonthAllDaySchedule(_Year,_Month,_UniID,_Brandtitle,_BrandName,_BrandPlace,_Name)
{
	var _Days = MonthHaveHowManyDay(_Year,_Month);
	console.log(' _Days = ',_Days);
    for( var i = 1; i<_Days+1; i++ )
    {
    	if(i<10){i='0'+i;}
		dbtest.collection('synccombinemonthworkschedule').save({TID:parseInt(Date.now(),10)+parseInt(i,10),uniID:_UniID,userbrandtitle:_Brandtitle,userbrandname:_BrandName,userbrandplace:_BrandPlace,name:_Name,workyear:_Year,workmonth:_Month,workday:i,onlinehour:'08',onlineminute:'00',offlinehour:'22',offlineminute:'00',realonlinehour:'',realonlineminute:'',realofflinehour:'',realofflineminute:'',shcedulestatus:'排休',realworkstatus:'正常',onlinecondition:'正常',onlineconditiontime:'0',offlinecondition:'正常',offlineconditiontime:'0',restcondition:'正常',restconditiontime:'0'},function(err,result){
	     	if(err)return console.log(err);
	  	});	
    }
}
// ====================== 新增單月每天排班情況 ===============================


// ====================== 同步排班狀況 ===============================
function FullfillMonthWorkSchedule(_Year,_Month,_BrandButton)
{
  	dbwork.collection('employeeworkschedule').find({'workyear':_Year,'workmonth':_Month,'userbrandname':_BrandButton}).toArray(function(err, origin) {
       // console.log(' origin = ', origin);	
         	dbtest.collection('synccombinemonthworkschedule').find({'workyear':_Year,'workmonth':_Month,'userbrandname':_BrandButton}).toArray(function(err, backup) {
       			// console.log(' backup = ', backup);	
       				for( var j = 0; j<backup.length; j++ )
       				{
       					var NeedToChange = 'wait2confirm';
       					for( var i = 0; i<origin.length; i++ )
		       			{
							if((origin[i].uniID == backup[j].uniID) && (origin[i].name == backup[j].name) && (origin[i].workyear == backup[j].workyear) && (origin[i].workmonth == backup[j].workmonth) && (origin[i].workday == backup[j].workday) )
							{
								//#檢查 #其中有一項有變化就要 update
								if(origin[i].onlinehour != backup[j].onlinehour){NeedToChange = 'update';}
								if(origin[i].onlineminute != backup[j].onlineminute){NeedToChange = 'update';}
								if(origin[i].offlinehour != backup[j].offlinehour){NeedToChange = 'update';}
								if(origin[i].offlineminute != backup[j].offlineminute){NeedToChange = 'update';}
								if(origin[i].shcedulestatus != backup[j].shcedulestatus){NeedToChange = 'update';}
								
								if( NeedToChange == 'update' ){
									UpdateDayScheduleStatusAndOnlineOfflineTime(backup[j].TID,backup[j].name,backup[j].workday,origin[i].onlinehour,origin[i].onlineminute,origin[i].offlinehour,origin[i].offlineminute,'正常上班');		
								}else{
									NeedToChange == 'donntchange';
								}					
							}
       					}
						if( NeedToChange == 'wait2confirm')
						{
							UpdateDayScheduleStatusAndOnlineOfflineTime(backup[j].TID,backup[j].name,backup[j].workday,'08','00','22','00','排休');
						}
						// console.log(' NeedToChange = ',NeedToChange);	
						// console.log(' origin[',i,'].TID = ',origin[i].TID);
						// console.log('');
       				}
       
       			if(err)return console.log(err);
  			});
       if(err)return console.log(err);
  	});
}

function UpdateDayScheduleStatusAndOnlineOfflineTime(_UniqueID,_Name,_Workday,_Onlinehour,_Onlineminute,_Offlinehour,_Offlineminute,_Shcedulestatus)
{
  dbtest.collection('synccombinemonthworkschedule').findOneAndUpdate({TID:parseInt(_UniqueID,10),name:_Name,workday:_Workday},{
    $set: 
    {
      onlinehour: _Onlinehour,
      onlineminute:_Onlineminute,
      offlinehour:_Offlinehour,
      offlineminute:_Offlineminute,
      shcedulestatus:_Shcedulestatus

    }
  },{
      upsert: true
  },(err, result) => {
    if (err) return res.send(err)
  });	
}

// ====================== 同步排班狀況 ===============================


// ====================== 同步上班狀況 ===============================
function CheckAllOnlineAndOffline(_Year,_Month,_BrandButton)
{
  	dbtoken.collection('memberbrandinformation').find({'userbrandname':_BrandButton}).toArray(function(err, results) {
      for( var i = 0; i<results.length; i++ ) {
      // for( var i = 0; i<1; i++ ) {
      	console.log(' uniID = ',results[i].uniID);
      	FullfillMonthOnlineOfflinetime(_Year,_Month,results[i].uniID,_BrandButton);
      }
  	});
}


function FullfillMonthOnlineOfflinetime(_Year,_Month,_UniID,_BrandButton)
{
  	dbwork.collection('workperiod').find({'Year':_Year,'Month':_Month,'uniID':_UniID}).toArray(function(err, origin) {
        dbtest.collection('synccombinemonthworkschedule').find({'workyear':_Year,'workmonth':_Month,'userbrandname':_BrandButton,'uniID':_UniID}).toArray(function(err, backup) {
       		for( var j = 0; j<backup.length; j++ )
       		{
       			var NeedToChange = 'wait2confirm';
       			for( var i = 0; i<origin.length; i++ )
		       	{	
					if((origin[i].uniID == backup[j].uniID) && (origin[i].name == backup[j].name) && (origin[i].Year == backup[j].workyear) && (origin[i].Month == backup[j].workmonth) && (origin[i].Day == backup[j].workday) )
					{
						console.log('backup = ',backup[j].workday);
						//#檢查 #其中有一項有變化就要 update
						if(origin[i].status == '上班'){
							if(origin[i].Hour != backup[j].realonlinehour){NeedToChange = 'update';}
							if(origin[i].Minute != backup[j].realonlineminute){NeedToChange = 'update';}							
						}else{
							if(origin[i].Hour != backup[j].realofflinehour){NeedToChange = 'update';}
							if(origin[i].Minute != backup[j].realofflineminute){NeedToChange = 'update';}							
						}

						console.log('TID = ',origin[i].TID);

								
						if( NeedToChange == 'update' && origin[i].status == '上班'){
							console.log('上班，時間不同，須更新');
							UpdateDayOnline(backup[j].TID,backup[j].name,backup[j].workday,origin[i].Hour,origin[i].Minute);		
						}else if( NeedToChange == 'update' && origin[i].status == '下班'){
							console.log('下班，時間不同，須更新');
							UpdateDayOffline(backup[j].TID,backup[j].name,backup[j].workday,origin[i].Hour,origin[i].Minute);
						}else{
						 	NeedToChange = 'donntchange';
							console.log('時間相同，不處理');
						}					
					}		       		
		       	}
		       	if(NeedToChange == 'wait2confirm')
		       	{
		       		UpdateDayOnlineOfflineToInitial(backup[j].TID,backup[j].name,backup[j].workday);
		       		console.log('backup = ',backup[j].TID);
		       		console.log('上下班資料不存在，需回復到初始');
		       	}
		       	console.log('');
       		}
       		if(err)return console.log(err);
  		});
        if(err)return console.log(err);
  	}); 	
}



function UpdateDayOnline(_UniqueID,_Name,_Workday,_Onlinehour,_Onlineminute)
{
  dbtest.collection('synccombinemonthworkschedule').findOneAndUpdate({TID:parseInt(_UniqueID,10),name:_Name,workday:_Workday},{
    $set: 
    {
      realonlinehour: _Onlinehour,
      realonlineminute:_Onlineminute
    }
  },{
      upsert: true
  },(err, result) => {
    if (err) return res.send(err)
  });	
}

function UpdateDayOffline(_UniqueID,_Name,_Workday,_Offlinehour,_Offlineminute)
{
  dbtest.collection('synccombinemonthworkschedule').findOneAndUpdate({TID:parseInt(_UniqueID,10),name:_Name,workday:_Workday},{
    $set: 
    {
      realofflinehour: _Offlinehour,
      realofflineminute:_Offlineminute
    }
  },{
      upsert: true
  },(err, result) => {
    if (err) return res.send(err)
  });	
}

function UpdateDayOnlineOfflineToInitial(_UniqueID,_Name,_Workday)
{
  dbtest.collection('synccombinemonthworkschedule').findOneAndUpdate({TID:parseInt(_UniqueID,10),name:_Name,workday:_Workday},{
    $set: 
    {
      realonlinehour: '',
      realonlineminute:'',
      realofflinehour: '',
      realofflineminute:''
    }
  },{
      upsert: true
  },(err, result) => {
    if (err) return res.send(err)
  });	
}
// ====================== 同步上班狀況 ===============================


// ====================== 計算加班或是遲到 ===============================
function CheckAllPersonAddAndLate(_Year,_Month,_BrandButton)
{
  	dbtoken.collection('memberbrandinformation').find({'userbrandname':_BrandButton}).toArray(function(err, results) {
      for( var i = 0; i<results.length; i++ ) {
      // for( var i = 0; i<1; i++ ) {
      	      console.log(' result[',i,'].uniID = ',results[i].uniID);
      	      if(results[i].userbrandtitle != '離職')
      	      {
      	      	CalculateAddAndLateTime(_Year,_Month,results[i].uniID,results[i].userbrandname);
      		  }
      }
  	});
}

function  CalculateAddAndLateTime(_Year,_Month,_UniID,_BrandButton)
{
    dbtest.collection('synccombinemonthworkschedule').find({'workyear':_Year,'workmonth':_Month,'userbrandname':_BrandButton,'uniID':_UniID}).toArray(function(err, backup) {
       	for( var j = 0; j<backup.length; j++ )
       	{
          if(backup[j].shcedulestatus =='正常上班')
          {
            console.log('日期 : ',backup[j].workyear,'/',backup[j].workmonth,'/',backup[j].workday);
            LateconditionCalculate(backup[j].TID,backup[j].name,backup[j].workday,_BrandButton,backup[j].userbrandtitle,backup[j].onlinehour,backup[j].onlineminute,backup[j].realonlinehour,backup[j].realonlineminute);
            AddconditionCalculate(backup[j].TID,backup[j].name,backup[j].workday,_BrandButton,backup[j].userbrandtitle,backup[j].offlinehour,backup[j].offlineminute,backup[j].realofflinehour,backup[j].realofflineminute);
            console.log('');            
          }
        }
        if(err)return console.log(err);
  	}); 	
}

function LateconditionCalculate(_TID,_Name,_Workday,_BrandButton,_Userbrandtitle,_Onlinehour,_Onlineminute,_Realonlinehour,_Realonlineminute)
{
    var ScheduleTime = parseInt(_Onlinehour,10)*60+parseInt(_Onlineminute,10);
    var RealTime = parseInt(_Realonlinehour,10)*60+parseInt(_Realonlineminute,10);

    if(ScheduleTime >= RealTime)
    {
      console.log(' ScheduleTime = ',ScheduleTime,' RealTime = ',RealTime, ' == > 正常上班');
    }
    else
    {
      console.log(' ScheduleTime = ',ScheduleTime,' RealTime = ',RealTime, ' == > 遲到 : ',RealTime-ScheduleTime );
      UpdateLateCondition(_TID,_Name,_Workday,'遲到',RealTime-ScheduleTime);
    }
}

function UpdateLateCondition(_UniqueID,_Name,_Workday,_Condition,_ConditionTime)
{
  console.log('_UniqueID = ',_UniqueID,' ,_Name = ',_Name,',_Workday =',_Workday,', _Condition=',_Condition,',_ConditionTime = ',_ConditionTime );
  dbtest.collection('synccombinemonthworkschedule').findOneAndUpdate({TID:parseInt(_UniqueID,10),name:_Name,workday:_Workday},{
    $set: 
    {
      onlinecondition: _Condition,
      onlineconditiontime:_ConditionTime
    }
  },{
      upsert: true
  },(err, result) => {
    if (err) return res.send(err)
  }); 
}

function AddconditionCalculate(_TID,_Name,_Workday,_BrandButton,_Userbrandtitle,_Offlinehour,_Offlineminute,_Realofflinehour,_Realofflineminute)
{
    if(_BrandButton == '食鍋藝') var AddHourShift = 2;
    if(_Userbrandtitle == '正職')
    {
      var ScheduleTime = (parseInt(_Offlinehour,10) - AddHourShift)*60+parseInt(_Offlineminute,10);
    }
    else if(_Userbrandtitle == '兼職')
    {
      var ScheduleTime = parseInt(_Offlinehour,10)*60+parseInt(_Offlineminute,10);
    }
    
    var RealTime = parseInt(_Realofflinehour,10)*60+parseInt(_Realofflineminute,10);

    if(ScheduleTime > RealTime)
    {
      console.log(' ScheduleTime = ',ScheduleTime,' RealTime = ',RealTime, ' == > 早退 : ',ScheduleTime-RealTime );
      UpdateAddCondition(_TID,_Name,_Workday,'早退',ScheduleTime-RealTime);
    }
    else if(ScheduleTime < RealTime)
    {
      console.log(' ScheduleTime = ',ScheduleTime,' RealTime = ',RealTime, ' == > 加班: ',RealTime-ScheduleTime );     
      UpdateAddCondition(_TID,_Name,_Workday,'加班',RealTime-ScheduleTime); 
    }
}

function UpdateAddCondition(_UniqueID,_Name,_Workday,_Condition,_ConditionTime)
{
  console.log('_UniqueID = ',_UniqueID,' ,_Name = ',_Name,',_Workday =',_Workday,', _Condition=',_Condition,',_ConditionTime = ',_ConditionTime );
  dbtest.collection('synccombinemonthworkschedule').findOneAndUpdate({TID:parseInt(_UniqueID,10),name:_Name,workday:_Workday},{
    $set: 
    {
      offlinecondition: _Condition,
      offlineconditiontime:_ConditionTime
    }
  },{
      upsert: true
  },(err, result) => {
    if (err) return res.send(err)
  }); 
}
// ====================== 計算加班或是遲到 ===============================

function MonthHaveHowManyDay(_Year,_Month)
{
	var Day = 0;
	switch (_Month) {
	  case '01':
	  	Day = 31;
	    break;
	  case '02': 
	    Day = 28;
	    break;
	  case '03': 
	    Day = 31;
	    break; 
	  case '04':
	    Day = 30;
	    break;
	  case '05': 
	    Day = 31;
	    break; 
	  case '06':
	    Day = 30;
	    break;
	  case '07': 
	    Day = 31;
	    break; 
	  case '08': 
	    Day = 31;
	    break; 
	  case '09':
	    Day = 30;
	    break;
	  case '10': 
	    Day = 31;
	    break; 
	  case '11':
	    Day = 30;
	    break;	 
	  case '12': 
	    Day = 31;
	    break;    
	  default:
	    Day = 31;
	}	
	return Day;
} 
