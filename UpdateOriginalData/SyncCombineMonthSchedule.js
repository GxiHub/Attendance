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

  	AddMonthAllDaySchedule(_Year,_Month,_BrandButton);

  	//FullfillMonthWorkSchedule(_Year,_Month,_BrandButton);
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

function AddMonthAllDaySchedule(_Year,_Month,_BrandButton)
{
  	dbtoken.collection('memberbrandinformation').find({'userbrandname':_BrandButton}).toArray(function(err, results) {
      for( var i = 0; i<results.length; i++ ) {
      	      console.log(' result[',i,'].uniID = ',results[i].uniID);
      	      CreatePersonalMonthAllDaySchedule(_Year,_Month,results[i].uniID,results[i].userbrandname,results[i].userbrandplace,results[i].name);
      }
  	});
}

function CreatePersonalMonthAllDaySchedule(_Year,_Month,_UniID,_BrandName,_BrandPlace,_Name)
{
	var _Days = MonthHaveHowManyDay(_Year,_Month);
	console.log(' _Days = ',_Days);
    for( var i = 1; i<_Days; i++ )
    {
    	if(i<10){i='0'+i;}
		dbtest.collection('synccombinemonthworkschedule').save({TID:parseInt(Date.now(),10)+parseInt(i,10),uniID:_UniID,userbrandname:_BrandName,userbrandplace:_BrandPlace,name:_Name,workyear:_Year,workmonth:_Month,workday:i,onlinehour:'08',onlineminute:'00',offlinehour:'22',offlineminute:'00'},function(err,result){
	     	if(err)return console.log(err);
	  	});	
    }
}

function FullfillMonthWorkSchedule(_Year,_Month,_BrandButton)
{
  	dbwork.collection('employeeworkschedule').find({'workyear':_Year,'workmonth':_Month,'userbrandname':_BrandButton}).toArray(function(err, origin) {
       console.log(' origin = ', origin);	
         	dbtest.collection('synccombinemonthworkschedule').find({'workyear':_Year,'workmonth':_Month,'userbrandname':_BrandButton}).toArray(function(err, backup) {
       			console.log(' backup = ', backup);	
       				for( var i = 0; i<origin.length; i++ )
       				{
       					var NeedToChange = 'wait2confirm';
       					for( var j = 0; j<backup.length; j++ )
		       			{
							if( (origin[i].TID == backup[j].TID) && (origin[i].uniID == backup[j].uniID) && (origin[i].name == backup[j].name) && (origin[i].workyear == backup[j].workyear) && (origin[i].workmonth == backup[j].workmonth) && (origin[i].workday == backup[j].workday) )
							{
								//#檢查 #其中有一項有變化就要 update
								if(origin[i].userbrandname != backup[j].userbrandname){NeedToChange = 'update';}
								if(origin[i].userbrandplace != backup[j].userbrandplace){NeedToChange = 'update';}
								if(origin[i].workyear != backup[j].workyear){NeedToChange = 'update';}
								if(origin[i].workmonth != backup[j].workmonth){NeedToChange = 'update';}
								if(origin[i].workday != backup[j].workday){NeedToChange = 'update';}
								if(origin[i].Minute != backup[j].Minute){NeedToChange = 'update';}
								if(origin[i].onlinehour != backup[j].onlinehour){NeedToChange = 'update';}
								if(origin[i].onlineminute != backup[j].onlineminute){NeedToChange = 'update';}
								if(origin[i].offlinehour != backup[j].offlinehour){NeedToChange = 'update';}
								if(origin[i].offlineminute != backup[j].offlineminute){NeedToChange = 'update';}
								
								if( NeedToChange == 'wait2confirm'){NeedToChange = 'unchange';}
							}
       					}
						if( NeedToChange == 'wait2confirm'){NeedToChange = 'create';}
						if( NeedToChange == 'create'){
							CreateNewSyncDataFromOriginalDatabase(origin[i].TID,origin[i].uniID,origin[i].userbrandname,origin[i].userbrandplace,origin[i].name,origin[i].workyear,origin[i].workmonth,origin[i].workday,origin[i].onlinehour,origin[i].onlineminute,origin[i].offlinehour,origin[i].offlineminute);
							
						}else if( NeedToChange == 'update' ){
							DeleteSyncDataFromBackupDatabase(origin[i].TID,origin[i].workyear,origin[i].workmonth,origin[i].workday,origin[i].name);
							CreateNewSyncDataFromOriginalDatabase(origin[i].TID,origin[i].uniID,origin[i].userbrandname,origin[i].userbrandplace,origin[i].name,origin[i].workyear,origin[i].workmonth,origin[i].workday,origin[i].onlinehour,origin[i].onlineminute,origin[i].offlinehour,origin[i].offlineminute);			
						}
						console.log(' NeedToChange = ',NeedToChange);	
						console.log(' origin[',i,'].TID = ',origin[i].TID);
						console.log('');
       				}
       
       			if(err)return console.log(err);
  			});
       if(err)return console.log(err);
  	});
}

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
