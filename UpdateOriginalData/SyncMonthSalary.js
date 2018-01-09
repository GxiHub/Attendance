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

var sleep = require('system-sleep');

var Promise = require('rsvp').Promise;

var PartTimeHourPrice = 150;

exports.MonthSalaryCalculate = function(_BrandButton)
{
	//產生現在的年份與月份
  	var _Year = GetNeedSyncYear(1);
  	var _Month = GetNeedSyncMonth(1);
    console.log(_Year+'/'+_Month);
    
    CheckAllPersonMonthSalaryIsInDataBaseOrNot(_Year,_Month,_BrandButton);
    setTimeout(function(){CheckAllPersonTotalMonthSalary(_Year,_Month,_BrandButton);}, 12000); 
}

function GetNeedSyncYear(YearShift)
{
	var Year = moment().format('YYYY') - YearShift;
	Year = Year.toString();
	return Year;
} 

function GetNeedSyncMonth(MonthShift)
{
	var Month = moment().format('MM') - MonthShift;
  if(Month == '00'){Month = 12;}
  //為了月份做處理，單位數的補零，雙位數的轉字串
  if(Month<10){Month='0'+Month;}
  Month = Month.toString();

	return Month;
} 

// ====================== 確認單月薪水是否已入庫 ===============================

function CheckAllPersonMonthSalaryIsInDataBaseOrNot(_Year,_Month,_BrandButton)
{

    dbtoken.collection('memberbrandinformation').find({'userbrandname':_BrandButton}).toArray(function(err, results) {
          for( var i = 0; i<results.length; i++ ) {
            // console.log(' result[',i,'].uniID = ',results[i].uniID);
            if(results[i].userbrandtitle != '離職')
            {
                ChecMonthSalaryIsInDataBaseOrNot(results[i].userbrandtitle,_Year,_Month,results[i].uniID,results[i].name,results[i].userbrandname,results[i].usermonthsalary,results[i].userfoodsalary,results[i].userwithoutsalary,results[i].usertitlesalary,results[i].userextrasalary,results[i].userlawsalary);
            }
          }
    });
}

function ChecMonthSalaryIsInDataBaseOrNot(_Userbrandtitle,_Year,_Month,_UniID,_Name,_BrandButton,_Usermonthsalary,_Userfoodsalary,_Userwithoutsalary,_Usertitlesalary,_Userextrasalary,_Userlawsalary)
{
  dbtest.collection('syncmonthsalary').find({'year':_Year,'month':_Month,'userbrandname':_BrandButton,'uniID':_UniID}).toArray(function(err, results) {
    	if(results.length == 0)
    	{
    		var BasicSalary = CalculateAllBasicSalary(_Usermonthsalary,_Userfoodsalary,_Userwithoutsalary,_Usertitlesalary,_Userextrasalary);
    		console.log('資料庫沒有資料 _Name =',_Name,' BasicSalary =',BasicSalary);
        CreateNewMonthDayDataToDataBase(_UniID,_Year,_Month,_Name,_BrandButton,_Usermonthsalary,_Userfoodsalary,_Userwithoutsalary,_Usertitlesalary,_Userextrasalary,_Userlawsalary,BasicSalary);
    	}
    	else
    	{
    		console.log('資料庫已經有資料');
        if(_Userbrandtitle == '正職')
        {
            var _UpdateBasicSalary = CalculateAllBasicSalary(_Usermonthsalary,_Userfoodsalary,_Userwithoutsalary,_Usertitlesalary,_Userextrasalary);
            console.log('_UpdateBasicSalary = ',_UpdateBasicSalary);
            UpdateBasicSalary(_UniID,_Year,_Month,_Name,_BrandButton,_UpdateBasicSalary);
    			  CheckAllPersonAddLateSalary(_Year,_Month,_BrandButton);
        }
  			if(_Userbrandtitle == '兼職'){
        		CalculatePartTimeSalary(_Year,_Month,_UniID,_BrandButton).then(function(items) {
        			    var BasicSalary = items;
        			    console.log('兼職 BasicSalary =',BasicSalary);
        			    UpdatePartTimeSalary(_UniID,_Year,_Month,_Name,_BrandButton,BasicSalary);
        			}, function(err) {
              				console.error('The promise was rejected', err, err.stack);
        			}); 
        }
      }
    	if(err)return console.log(err);
	}); 
}

// ================================================================================

// ====================== 若當月沒有薪水項目，新增基本薪水 ===============================
function CalculateAllBasicSalary(_Usermonthsalary,_Userfoodsalary,_Userwithoutsalary,_Usertitlesalary,_Userextrasalary)
{
	return parseInt(_Usermonthsalary,10)+parseInt(_Userfoodsalary,10)+parseInt(_Userwithoutsalary,10)+parseInt(_Usertitlesalary,10)+parseInt(_Userextrasalary,10);
}

function CreateNewMonthDayDataToDataBase(_UniID,_Year,_Month,_Name,_BrandButton,_Usermonthsalary,_Userfoodsalary,_Userwithoutsalary,_Usertitlesalary,_Userextrasalary,_Userlawsalary,_BasicSalary)
{
	dbtest.collection('syncmonthsalary').save({TID:parseInt(Date.now(),10),uniID:_UniID,year:_Year,month:_Month,name:_Name,userbrandname:_BrandButton,workdaynumber:'0',monthsalary:_Usermonthsalary,
											   foodsalary:_Userfoodsalary,withoutsalary:_Userwithoutsalary,titlesalary:_Usertitlesalary,extrasalary:_Userextrasalary,lawsalary:_Userlawsalary,basicsalary:_BasicSalary,
											   addminute:'0',addtimesalary:'0',lateminute:'0',latetimesalary:'0',earlyminute:'0',earlytimesalary:'0',restminute:'0',resttimesalary:'0',totalmonthsalary:'0'},function(err,result){
	     	if(err)return console.log(err);
	});
}
// ================================================================================

// ====================== 同步基本薪水 ===============================
function UpdateBasicSalary(_UniID,_Year,_Month,_Name,_BrandButton,_BasicSalary)
{
  console.log('_UniID =',_UniID,' _BasicSalary=',_BasicSalary);
  dbtest.collection('syncmonthsalary').findOneAndUpdate({uniID:_UniID,year:_Year,month:_Month,name:_Name},{
    $set: 
    {
      basicsalary:_BasicSalary
    }
  },{
      upsert: true
  },(err, result) => {
    if (err) return res.send(err)
  });
}

// ================================================================================

// ====================== 計算加班、遲到、請假、上班天數 ===============================

function CheckAllPersonAddLateSalary(_Year,_Month,_BrandButton)
{
  	dbtoken.collection('memberbrandinformation').find({'userbrandname':_BrandButton}).toArray(function(err, results) {
      for( var i = 0; i<results.length; i++ ) {
      	// console.log(' result[',i,'].uniID = ',results[i].uniID);
      	if(results[i].userbrandtitle != '離職')
      	{
      	    CalculateAllAddLateSalary(_Year,_Month,results[i].uniID,results[i].userbrandname);
      	}
      }
  	});
}

function  CalculateAllAddLateSalary(_Year,_Month,_UniID,_BrandButton)
{
    dbtest.collection('synccombinemonthworkschedule').find({'workyear':_Year,'workmonth':_Month,'userbrandname':_BrandButton,'uniID':_UniID}).sort({"workmonth": 1,"workday": 1}).toArray(function(err, backup) {
       	var MonthAddMinute = 0;var MonthLateMinute = 0;var MonthEarlyReturnMinute = 0;var WorkDayNumber = 0;
       	for( var j = 0; j<backup.length; j++ )
       	{
            // console.log('日期 : ',backup[j].workyear,'/',backup[j].workmonth,'/',backup[j].workday,' TID = ',backup[j].TID,' Name =',backup[j].name);
            // 透過 onlinecondition 來計算遲到時間
            if(backup[j].onlinecondition == '遲到')
           	{
           		MonthLateMinute = MonthLateMinute + backup[j].onlineconditiontime;
           	}
           	// 透過 offlinecondition 來計算加班時間和早退時間
            if(backup[j].offlinecondition == '加班')
           	{
           		MonthAddMinute = MonthAddMinute + backup[j].offlineconditiontime;
           	}
           	else if(backup[j].offlinecondition == '早退')   
           	{
           		MonthEarlyReturnMinute = MonthEarlyReturnMinute + backup[j].offlineconditiontime;
           	}
            WorkDayNumber = WorkDayNumber+CheckWorkDayNumber(backup[j].shcedulestatus,backup[j].realworkstatus);
            MonthAddMinute = MonthAddMinute+SpecialAddtime(backup[j].shcedulestatus,backup[j].realworkstatus);
        }
        // console.log('加班總時間 = ',MonthAddMinute,' 遲到總時間 = ',MonthLateMinute,' 早退總時間 = ',MonthEarlyReturnMinute,' 單月上班天數 = ',WorkDayNumber); 

        UpdateAddLateSalary(_Year,_Month,_UniID,MonthAddMinute,MonthLateMinute,MonthEarlyReturnMinute,WorkDayNumber);

        if(err)return console.log(err);
  	}); 	
}
function CheckWorkDayNumber(_Shcedulestatus,_Realworkstatus)
{
    var _WorkDayNumber = 0;
    if( (_Shcedulestatus =='正常上班'||_Shcedulestatus =='排休') && (_Realworkstatus =='病假'||_Realworkstatus =='正常'||_Realworkstatus =='正常補打卡'||_Realworkstatus =='假日半小時'||_Realworkstatus =='假日一小時'||_Realworkstatus =='假日一個半小時'||_Realworkstatus =='補打卡/半小時'||_Realworkstatus =='補打卡/一小時'||_Realworkstatus =='補打卡/一個半小時'))
    {
        _WorkDayNumber = 1;
    }  
    return  _WorkDayNumber;
}

function SpecialAddtime(_Shcedulestatus,_Realworkstatus)
{
    var _SpecialAddtime = 0;
    if(_Shcedulestatus =='正常上班')
    {
        if(_Realworkstatus =='假日半小時' || _Realworkstatus =='補打卡/半小時'){_SpecialAddtime = 30;}
        else if(_Realworkstatus =='假日一小時' || _Realworkstatus =='補打卡/一小時'){_SpecialAddtime = 60;}
        else if(_Realworkstatus =='假日一個半小時' || _Realworkstatus =='補打卡/一個半小時'){_SpecialAddtime = 90;}
    }  
    return  _SpecialAddtime;
}

function UpdateAddLateSalary(_Year,_Month,_UniID,_MonthAddMinute,_MonthLateMinute,_MonthEarlyReturnMinute,_WorkDayNumber)
{
  dbtest.collection('syncmonthsalary').findOneAndUpdate({uniID:_UniID,year:_Year,month:_Month},{
    $set: 
    {
      addminute: _MonthAddMinute,
      lateminute:_MonthLateMinute,
      earlyminute:_MonthEarlyReturnMinute,
      workdaynumber:_WorkDayNumber
    }
  },{
      upsert: true
  },(err, result) => {
    if (err) return res.send(err)
  });
}

// ================================================================================

// ====================== 計算單月總薪水 ===============================

function CheckAllPersonTotalMonthSalary(_Year,_Month,_BrandButton)
{
  	dbtoken.collection('memberbrandinformation').find({'userbrandname':_BrandButton}).toArray(function(err, results) {
      for( var i = 0; i<results.length; i++ ) {
      	if(results[i].userbrandtitle != '離職')
      	{
      		// console.log(' result[',i,'].uniID = ',results[i].uniID);
      	    UpdateTotalMonthSalary(_Year,_Month,results[i].uniID,results[i].userbrandtitle,results[i].userlawsalary);
      	}
      }
  	});
}

function UpdateTotalMonthSalary(_Year,_Month,_UniID,_Userbrandtitle,_Lawsalary)
{

    dbtest.collection('syncmonthsalary').find({'year':_Year,'month':_Month,'uniID':_UniID}).toArray(function(err, results) {

    for( var i = 0; i<results.length; i++ )
    {
    	var AddSalary = CalculateAddSalary(_Userbrandtitle,results[0].addminute,results[0].monthsalary,results[0].foodsalary,results[0].withoutsalary,results[0].titlesalary);
    	var LateSalary = CalculateLateSalary(_Userbrandtitle,results[0].lateminute,results[0].monthsalary,results[0].foodsalary,results[0].withoutsalary,results[0].titlesalary);
    	var EarlySalary = CalculateLateSalary(_Userbrandtitle,results[0].earlyminute,results[0].monthsalary,results[0].foodsalary,results[0].withoutsalary,results[0].titlesalary);  	
    	var RatioDiff = MonthHaveHowManyDay(GetNeedSyncYear(1),GetNeedSyncMonth(1)) - results[0].workdaynumber;
      var Userlawsalary = parseInt(_Lawsalary,10);
      console.log(' _Lawsalary = ',_Lawsalary);
      CheckFullScheduleStatusAndCalculateBasicSalary(_Year,_Month,_UniID,_Userbrandtitle,RatioDiff,results[0].withoutsalary,results[0].basicsalary,results[0].workdaynumber).then(function(items) {
          var TotalSalary = CalculateTotalSalary(_Userbrandtitle,items,AddSalary,LateSalary,EarlySalary,Userlawsalary);
          console.log(' items = ',items);
          console.log(' TotalSalary = ',TotalSalary);
          UpdateTotalSalary(results[0].name,_UniID,_Year,_Month,AddSalary,LateSalary,EarlySalary,Math.round(items),Math.round(TotalSalary));
          console.log(' ============ '); 
      }, function(err){
          console.error('The promise was rejected', err, err.stack);
      });
     //  console.log(' _Userbrandtitle = ',_Userbrandtitle);
     //  console.log(' results[0].basicsalary = ',results[0].basicsalary);
     //  console.log(' EarlySalary = ',EarlySalary);
     //  console.log(' LateSalary = ',LateSalary); 
     //  console.log(' workdaynumber = ',results[0].workdaynumber); 
     //  console.log(' AddSalary = ',AddSalary);
     //  console.log(' Ratio = ',Ratio); 
     //  console.log(' monthsalary = ',results[0].monthsalary,' foodsalary = ',results[0].foodsalary,' withoutsalary = ',results[0].withoutsalary,' titlesalary = ',results[0].titlesalary);
    }
 //    	if(err)return console.log(err);
	}); 
}

function CheckFullScheduleStatusAndCalculateBasicSalary(_Year,_Month,_UniID,_Userbrandtitle,_RatioDiff,_Withoutsalary,_Basicsalary,_Workdaynumber)
{
    var FullSchedule = 0;var NotFullMonth = false;var StandardDay = 30;
    return new Promise(function(resolve, reject) 
    {
        dbtest.collection('synccombinemonthworkschedule').find({'workyear':_Year,'workmonth':_Month,'uniID':_UniID}).toArray(function(err, results) {
              var OverCheckForThreeTimes = 0;
              for( var i = 0; i<results.length; i++ )
              {
                  if(results[i].realworkstatus == '正常補打卡' || results[i].realworkstatus == '補打卡/半小時' ||results[i].realworkstatus == '補打卡/一小時' ||results[i].realworkstatus == '補打卡/一個半小時' )
                  {
                      OverCheckForThreeTimes++;
                  }
                  else if(results[i].realworkstatus == '尚未到職')
                  {
                      NotFullMonth = true;
                  }
              }

              if( OverCheckForThreeTimes > 3 || _RatioDiff != 0)
              {
                  FullSchedule = _Withoutsalary;
              }
              else
              {
                  if(NotFullMonth == true)
                  {
                      FullSchedule = _Withoutsalary;
                  }
                  else
                  {
                      FullSchedule = 0;
                  }
              }
              console.log(' _UniID = ',_UniID);
              console.log(' _Basicsalary = ',parseInt(_Basicsalary,10));
              console.log(' _Withoutsalary = ',parseInt(_Withoutsalary,10)); 
              console.log(' OverCheckForThreeTimes = ',OverCheckForThreeTimes);
              console.log(' FullSchedule = ',FullSchedule);
              console.log(' _RatioDiff = ',_RatioDiff);
              if(_Userbrandtitle == '正職')
              { 
                  if(NotFullMonth == true)
                  {
                      var BasicSalary = (parseInt(_Basicsalary,10)-parseInt(_Withoutsalary,10))/StandardDay*_Workdaynumber;
                  }
                  else
                  {
                      var BasicSalary = parseInt(_Basicsalary,10) - parseInt(_Basicsalary,10)/StandardDay*_RatioDiff - FullSchedule;
                  }
              }
              else if (_Userbrandtitle == '兼職')
              {
                  var BasicSalary = parseInt(_Basicsalary,10);
              }
              // console.log(' BasicSalary = ',BasicSalary);
              if (err) { 
                    reject(err);
              } else {
                    resolve(BasicSalary);
              }
        });
    });
}

function CalculateAddSalary(_Userbrandtitle,_Addtime,_Usermonthsalary,_Userfoodsalary,_Userwithoutsalary,_Usertitlesalary)
{
	var FullSalary = parseInt(_Usermonthsalary,10)+parseInt(_Userfoodsalary,10)+parseInt(_Userwithoutsalary,10)+parseInt(_Usertitlesalary,10);

	var day = 30;var hour = 8;var minute = 60;
	// 加班倍數
	var times = 1.33;
	var MinutePrice = FullSalary/day/hour/minute*times;
	var PartTimeMinutePrice = PartTimeHourPrice/60;
	 // console.log('MinutePrice =',MinutePrice);
	if(_Userbrandtitle == '正職'){
		var AddtimePrice = _Addtime * MinutePrice;
	}else{
		var AddtimePrice = _Addtime * PartTimeMinutePrice;
	}
	
	return Math.round(AddtimePrice);
}

function CalculateLateSalary(_Userbrandtitle,_Latetime,_Usermonthsalary,_Userfoodsalary,_Userwithoutsalary,_Usertitlesalary)
{
	var FullSalary = parseInt(_Usermonthsalary,10)+parseInt(_Userfoodsalary,10)+parseInt(_Userwithoutsalary,10)+parseInt(_Usertitlesalary,10);
	
	var day = 30;var hour = 8;var minute = 60;
	var MinutePrice = FullSalary/day/hour/minute;
	var PartTimeMinutePrice = PartTimeHourPrice/60;
	 // console.log('MinutePrice =',MinutePrice);
	if(_Userbrandtitle == '正職'){
		var LatetimePrice = _Latetime * MinutePrice;
	}else{
		var LatetimePrice = _Latetime * PartTimeMinutePrice;
	}
	return Math.round(LatetimePrice);
}

function CalculateEarlySalary(_Userbrandtitle,_Earlytime,_Usermonthsalary,_Userfoodsalary,_Userwithoutsalary,_Usertitlesalary)
{
	var FullSalary = parseInt(_Usermonthsalary,10)+parseInt(_Userfoodsalary,10)+parseInt(_Userwithoutsalary,10)+parseInt(_Usertitlesalary,10);
	
	var day = 30;var hour = 8;var minute = 60;
	var MinutePrice = FullSalary/day/hour/minute;
	var PartTimeMinutePrice = PartTimeHourPrice/60;
	 // console.log('MinutePrice =',MinutePrice);
	if(_Userbrandtitle == '正職'){
		var EarlytimePrice = _Earlytime * MinutePrice;
	}else{
		var EarlytimePrice = _Earlytime * PartTimeMinutePrice;
	}
	return Math.round(EarlytimePrice);
}

function CalculatePartTimeSalary(_Year,_Month,_UniID,_BrandButton)
{	
    return new Promise(function(resolve, reject) 
    {
    	var EveryDayWorkPeriod = 0;
    	dbtest.collection('synccombinemonthworkschedule').find({'workyear':_Year,'workmonth':_Month,'uniID':_UniID}).toArray(function(err, backup) {
        
	    	for( var i = 0; i<backup.length; i++ )
	    	{
		    	if(backup[i].shcedulestatus == '正常上班')
		    	{
		    		var PartTimeMinutePrice = PartTimeHourPrice/60;
		    		var HolidayNeedToDelete2Minute = 2*60;
		    		var IsHolidayOrNot = parseInt(backup[i].realofflinehour,10)-parseInt(backup[i].realonlinehour,10);
		    		var OnlineTime = parseInt(backup[i].realonlinehour,10)*60 + parseInt(backup[i].realonlineminute,10);
		    		var OfflineTime = parseInt(backup[i].realofflinehour,10)*60 + parseInt(backup[i].realofflineminute,10);
  					if(IsHolidayOrNot>=9)
  					{
  						EveryDayWorkPeriod = EveryDayWorkPeriod+(OfflineTime - OnlineTime - HolidayNeedToDelete2Minute) *PartTimeMinutePrice;
  					}
  					else
  					{
  						EveryDayWorkPeriod = EveryDayWorkPeriod+(OfflineTime - OnlineTime)*PartTimeMinutePrice;
  					}
		    		// console.log(' date = ',backup[i].workyear,'/',backup[i].workmonth,'/',backup[i].workday);
		    		// console.log(' time = ',backup[i].realonlinehour,':',backup[i].realonlineminute,'-',backup[i].realofflinehour,':',backup[i].realofflineminute);    		
		    		// console.log(' minutes = ',OfflineTime-OnlineTime);
		    	}    		
	    	}
	    	console.log('EveryDayWorkPeriod =',EveryDayWorkPeriod);
            if (err) { 
                  reject(err);
            } else {
                  resolve(EveryDayWorkPeriod);
            }
        });
    });
}

function UpdatePartTimeSalary(_UniID,_Year,_Month,_Name,_BrandButton,_BasicSalary)
{
	console.log('_UniID =',_UniID,' _BasicSalary=',_BasicSalary);
  dbtest.collection('syncmonthsalary').findOneAndUpdate({uniID:_UniID,year:_Year,month:_Month,name:_Name},{
    $set: 
    {
      basicsalary:Math.round(_BasicSalary)
    }
  },{
      upsert: true
  },(err, result) => {
    if (err) return res.send(err)
  });
}

function CalculateTotalSalary(_Userbrandtitle,_BasicPrice,AddSalary,LateSalary,EarlySalary,Userlawsalary)
{
	var TotalSalary = 0;
	if(_Userbrandtitle == '正職')
	{
		TotalSalary = _BasicPrice+AddSalary-LateSalary-EarlySalary-Userlawsalary;
	}
	else
	{
		TotalSalary = _BasicPrice;
	}
	return TotalSalary;
}

function UpdateTotalSalary(_Name,_UniID,_Year,_Month,_AddSalary,_LateSalary,_EarlySalary,_BasicSalary,_TotalSalary)
{
  console.log('_UniID =',_UniID,' _TotalSalary=',_TotalSalary);
  dbtest.collection('syncmonthsalary').findOneAndUpdate({uniID:_UniID,year:_Year,month:_Month,name:_Name},{
    $set: 
    {
      addtimesalary:_AddSalary,
      latetimesalary:_LateSalary,
      earlytimesalary:_EarlySalary,
      basicsalary:_BasicSalary,
      totalmonthsalary:_TotalSalary
    }
  },{
      upsert: true
  },(err, result) => {
    if (err) return res.send(err)
  });
}
// ================================================================================

// ====================== 更新某些人的 realworkstatus ===============================
function CheckAllPersonWorkStatus(_Year,_Month,_BrandButton)
{
      	UpdateSomeOneWorkStatus('1511703512029','陳彩妮');

}
function UpdateSomeOneWorkStatus(_UniqueID,_Name)
{
  console.log('_UniqueID = ',_UniqueID);
  dbtest.collection('synccombinemonthworkschedule').findOneAndUpdate({TID:parseInt(_UniqueID,10),name:_Name},{
    $set: 
    {
      realworkstatus: '尚未到職'
    }
  },{
      upsert: true
  },(err, result) => {
    if (err) return res.send(err)
  });		
}
// ================================================================================
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



