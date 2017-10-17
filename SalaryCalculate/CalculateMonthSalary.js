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

var PartTimeHourPrice = 150;

exports.CalculateMonthSalary = function(BrandName)
{
	var Calculate_Year = '2017';
	var Calculate_Month = '09';

	dbtoken.collection('memberbrandinformation').find({'userbrandname':BrandName}).toArray(function(err, minuteSalary) {
		// console.log('minuteSalary.length =',minuteSalary.length);
		for( var j = 0; j<minuteSalary.length; j++ ) {
			RemoveMonthSalaryData(minuteSalary[j].uniID,Calculate_Year,Calculate_Month);
			setTimeout(SaveMonthSalaryToDatabas(minuteSalary[j].userbrandtitle,minuteSalary[j].uniID,minuteSalary[j].name,Calculate_Year,Calculate_Month,minuteSalary[j].usermonthsalary,minuteSalary[j].userfoodsalary,minuteSalary[j].userwithoutsalary,minuteSalary[j].usertitlesalary,minuteSalary[j].userextrasalary,minuteSalary[j ].userlawsalary),2000);
		}
	});
}

function addtimePrice(_Userbrandtitle,_Addtime,_Usermonthsalary,_Userfoodsalary,_Userwithoutsalary,_Usertitlesalary,_Userextrasalary)
// function addtimePrice(_Addtime,_Userbrandtitle,_Usermonthsalary,_Userfoodsalary,_Userwithoutsalary,_Usertitlesalary,_Userextrasalary)
{
	var FullSalary = parseInt(_Usermonthsalary,10)+parseInt(_Userfoodsalary,10)+parseInt(_Userwithoutsalary,10)+parseInt(_Userwithoutsalary,10)+parseInt(_Usertitlesalary,10)+parseInt(_Userextrasalary,10);
	// var FullSalary = parseInt(_Usermonthsalary,10); 
	 // console.log('FullSalary =',FullSalary);
	var day = 30;var hour = 8;var minute = 60;var times = 1.33;
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

function latetimePrice(_Userbrandtitle,_Latetime,_Usermonthsalary,_Userfoodsalary,_Userwithoutsalary,_Usertitlesalary,_Userextrasalary)
// function latetimePrice(_Latetime,_Userbrandtitle,_Usermonthsalary,_Userfoodsalary,_Userwithoutsalary,_Usertitlesalary,_Userextrasalary)
{
	var FullSalary = parseInt(_Usermonthsalary,10)+parseInt(_Userfoodsalary,10)+parseInt(_Userwithoutsalary,10)+parseInt(_Userwithoutsalary,10)+parseInt(_Usertitlesalary,10)+parseInt(_Userextrasalary,10);
	// console.log('FullSalary =',FullSalary);
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

function fullPrice(_Usermonthsalary,_Userfoodsalary,_Userwithoutsalary,_Usertitlesalary,_Userextrasalary,_AddtimeTotal,_LatetimeTotal)
{
	var FullSalary = parseInt(_Usermonthsalary,10)+parseInt(_Userfoodsalary,10)+parseInt(_Userwithoutsalary,10)+parseInt(_Usertitlesalary,10)+parseInt(_Userextrasalary,10)+parseInt(_AddtimeTotal,10)-parseInt(_LatetimeTotal,10);
	return FullSalary;
}

function basicprice(_uniID,_Year,_Month,_Userbrandtitle,_Workdaynumber,_Usermonthsalary,_Userfoodsalary,_Userwithoutsalary,_Usertitlesalary,_Userextrasalary,_LatetimeTotal,_LateMinute)
{
	if(_LateMinute>30){_Userwithoutsalary = 0;}
	else{_Userwithoutsalary=_Userwithoutsalary;}
	console.log('_LatetimeTotal =',_LatetimeTotal);
	console.log('_Userwithoutsalary =',_Userwithoutsalary);
	var WorkDayRatio = 0;
	if(_Workdaynumber == 0){ WorkDayRatio = 0}
	else if(_Workdaynumber>=0 && _Workdaynumber<5){WorkDayRatio = _Workdaynumber/30;}
	else if(_Workdaynumber>=5 && _Workdaynumber<10){WorkDayRatio= (_Workdaynumber+2)/30;}
	else if(_Workdaynumber>=10 && _Workdaynumber<15){WorkDayRatio= (_Workdaynumber+4)/30;}
	else if(_Workdaynumber>=15 && _Workdaynumber<20){WorkDayRatio= (_Workdaynumber+6)/30;}
	else { WorkDayRatio = 1}
	
	var BasicSalary = (parseInt(_Usermonthsalary,10)+parseInt(_Userfoodsalary,10)+parseInt(_Userwithoutsalary,10)+parseInt(_Usertitlesalary,10)+parseInt(_Userextrasalary,10))*WorkDayRatio;

	return Math.round(BasicSalary);
}

function every_parttime_basic_price(_onlinehour,_onlineminute,_offlinehour,_offlineminute)
{
	var PartTimeMinutePrice = PartTimeHourPrice/60;
	var HolidayNeedToDelete2Minute = 2*60;
	var IsHolidayOrNot = parseInt(_offlinehour,10)-parseInt(_onlinehour,10);

	OnlineTime = parseInt(_onlinehour,10)*60 + parseInt(_onlineminute,10);
	OfflineTime = parseInt(_offlinehour,10)*60 + parseInt(_offlineminute,10);
	if(IsHolidayOrNot>=9)
	{
		EveryDayWorkPeriod = (OfflineTime - OnlineTime - HolidayNeedToDelete2Minute) *PartTimeMinutePrice;
	}
	else
	{
		EveryDayWorkPeriod = (OfflineTime - OnlineTime)*PartTimeMinutePrice;
	}
	
	 console.log('EveryDayWorkPeriod =',EveryDayWorkPeriod);
	return EveryDayWorkPeriod;
}

function SaveMonthSalaryToDatabas(_Userbrandtitle,_uniID,_name,_Year,_Month,_usermonthsalary,_userfoodsalary,_userwithoutsalary,_usertitlesalary,_userextrasalary,_userlawsalary)
//function SaveMonthSalaryToDatabas(_uniID,_name,_YearMonth,_usermonthsalary,_userfoodsalary,_userwithoutsalary,_usertitlesalary,_userextrasalary,_userlawsalary,_addtimesalary,_latetimesalary,_totalsalary)
{
	var _YearMonth = _Year+'/'+_Month;
	//dbwork.collection('everydayonlineoffline').find({'uniID':_uniID,'Year':_Year,'Month':_Month}).sort({"name":1,"Month": 1,"Day": 1}).toArray(function(err, results) {
	dbtest.collection('syneverydayaddlatestatus').find({'uniID':_uniID,'Year':_Year,'Month':_Month}).sort({"name":1,"Month": 1,"Day": 1}).toArray(function(err, results) {
	var AddtimeTotal = 0 ;var AddMinute = 0;var LateTimeTotal = 0;var LateMinute = 0;
	var PartTimeEveryDaySalary;var PartTimeTotalSalary =0;
	for( var i = 0; i<results.length; i++ ) 
	{
		PartTimeEveryDaySalary =0;
		var AddTimePrice = addtimePrice(_Userbrandtitle,results[i].addtime,_usermonthsalary,_userfoodsalary,_userwithoutsalary,_usertitlesalary,_userextrasalary); 
		var LateTimePrice = latetimePrice(_Userbrandtitle,results[i].latetime,_usermonthsalary,_userfoodsalary,_userwithoutsalary,_usertitlesalary,_userextrasalary);
		// console.log('addtime =',results[i].addtime,'  addPrice =',AddTimePrice);
		// console.log('latetime =',results[i].latetime,'  latePrice =',LateTimePrice);
		AddtimeTotal = AddtimeTotal+AddTimePrice;
		LateTimeTotal = LateTimeTotal+LateTimePrice;
		AddMinute = AddMinute + results[i].addtime;
		LateMinute = LateMinute + results[i].latetime;
		if(_Userbrandtitle == '兼職'){
			PartTimeEveryDaySalary = every_parttime_basic_price(results[i].onlinehour,results[i].onlineminute,results[i].offlinehour,results[i].offlineminute);
			PartTimeTotalSalary = PartTimeTotalSalary+PartTimeEveryDaySalary;
		}
	}
	// var BasicPrice = basicprice(_uniID,_Year,_Month,_Userbrandtitle,results.length,_usermonthsalary,_userfoodsalary,_userwithoutsalary,_usertitlesalary,_userextrasalary,LateTimeTotal);
	var FullPrice = fullPrice(_usermonthsalary,_userfoodsalary,_userwithoutsalary,_usertitlesalary,_userextrasalary,AddtimeTotal,LateTimeTotal);
	if(_Userbrandtitle == '正職'){
		var BasicPrice = basicprice(_uniID,_Year,_Month,_Userbrandtitle,results.length,_usermonthsalary,_userfoodsalary,_userwithoutsalary,_usertitlesalary,_userextrasalary,LateTimeTotal,LateMinute);
		var FinalPrice = BasicPrice + AddtimeTotal - LateTimeTotal;
	}else{
		var FinalPrice = PartTimeTotalSalary + AddtimeTotal - LateTimeTotal;
		var BasicPrice = PartTimeTotalSalary;

	}
				// console.log('= = = = = = =');
			   	console.log('_uniID =',_uniID);
			   	console.log('results.length =',results.length);
		    	console.log('_usermonthsalary =',_usermonthsalary);
		    	console.log('_userfoodsalary =',_userfoodsalary);
		    	console.log('_userwithoutsalary =',_userwithoutsalary);
		    	console.log('_usertitlesalary =',_usertitlesalary);
		    	console.log('_userextrasalary =',_userextrasalary);
		    	// console.log('_userlawsalary =',_userlawsalary);
		    	console.log('_name =',_name);
				console.log('PartTimeTotalSalary =',PartTimeTotalSalary);
		    	console.log('AddtimeTotal =',AddtimeTotal);
		    	console.log('LateTimeTotal =',LateTimeTotal);
		    	console.log('_YearMonth =',_YearMonth);
		    	console.log('BasicPrice =',BasicPrice);
		    	// console.log('FullPrice =',FullPrice);
		    	console.log('FinalPrice =',FinalPrice);
		    	console.log('');
		    	
		    //});
		   
   	// dbwork.collection('monthlysalaryinformation').save({TID:Date.now(),uniID:_uniID,name:_name,monthperiod:_YearMonth,workdaynumber:results.length,monthsalary:_usermonthsalary,
   	dbtest.collection('syncmonthlysalaryinformation').save({TID:Date.now(),uniID:_uniID,name:_name,monthperiod:_YearMonth,workdaynumber:results.length,monthsalary:_usermonthsalary,
                                                                      foodsalary:_userfoodsalary,withoutsalary:_userwithoutsalary,titlesalary:_usertitlesalary,
                                                                      extrabonus:_userextrasalary,lawsalary:_userlawsalary,addtimesalary:AddtimeTotal,latetimesalary:LateTimeTotal,
                                                                      basicsalary:BasicPrice,totalmonthsalary:FinalPrice,addminute:AddMinute,lateminute:LateMinute},function(err,result){
                          if(err)return console.log(err);
    });                      
    });   
}

function RemoveMonthSalaryData(_uniid,_year,_month)
{
  console.log('_uniid =',_uniid);console.log('_year =',_year);console.log('_month =',_month);
  var MonthYear = _year+'/'+_month;
  console.log('MonthYear =',MonthYear);
  dbtest.collection('syncmonthlysalaryinformation').remove({uniID:_uniid,monthperiod:MonthYear});
}
