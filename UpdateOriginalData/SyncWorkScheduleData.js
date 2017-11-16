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

var MonthShift = 0;

exports.WorkSchedulStatus = function()
{
	//產生現在的年份與月份
  	var _Year = moment().format('YYYY');
  	var _Month = moment().format('MM') - MonthShift;

  	//為了月份做處理，單位數的補零，雙位數的轉字串
  	if(_Month<10){_Month='0'+_Month;}
  	_Month = _Month.toString();
	console.log(' Date = ', _Year+'/'+_Month);

  	dbwork.collection('employeeworkschedule').find({'workyear':_Year,'workmonth':_Month}).toArray(function(err, origin) {
		dbtest.collection('synworkscheduledata').find({'workyear':_Year,'workmonth':_Month}).toArray(function(err, backup) {
			for( var i = 0; i<origin.length; i++ )	
			{
				var NeedToChange = 'wait2confirm';
				for( var j = 0; j<backup.length; j++ )
				{
					//#檢查 #TID/UID/姓名
					if( (origin[i].TID == backup[j].TID) && (origin[i].uniID == backup[j].uniID) && (origin[i].name == backup[j].name) && (origin[i].workday == backup[j].workday) )
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
			CheckBackupIsMoreDataThanOrignalData(origin,backup);
		    if(err)return console.log(err);
		});       		
       if(err)return console.log(err);
  	});
}

function CreateNewSyncDataFromOriginalDatabase(_TID,_uniID,_userbrandname,_userbrandplace,_name,_workyear,_workmonth,_workday,_onlinehour,_onlineminute,_offlinehour,_offlineminute)
{
	dbtest.collection('synworkscheduledata').save({TID:_TID,uniID:_uniID,userbrandname:_userbrandname,userbrandplace:_userbrandplace,name:_name,workyear:_workyear,workmonth:_workmonth,workday:_workday,onlinehour:_onlinehour,onlineminute:_onlineminute,offlinehour:_offlinehour,offlineminute:_offlineminute},function(err,result){
     	if(err)return console.log(err);
  	});
}

function DeleteSyncDataFromBackupDatabase(_TID,_workyear,_workmonth,_workday,_name)
{
    dbtest.collection('synworkscheduledata').findOneAndDelete({TID:parseInt(_TID,10),name:_name,workyear:_workyear,workmonth:_workmonth,workday:_workday},(err, result) => {
      if (err)return console.log(err);
    });
}


function CheckBackupIsMoreDataThanOrignalData(_Origin,_Backup)
{
	for( var i = 0; i<_Backup.length; i++ )	
	{
		var NeedToChange = 'wait2confirm';
		console.log('');
		console.log(' _Backup[',i,'].TID = ',_Backup[i].TID);
		for( var j = 0; j<_Origin.length; j++ )
		{	
			if( (_Origin[j].TID == _Backup[i].TID) && (_Origin[j].uniID == _Backup[i].uniID) && (_Origin[j].workday == _Backup[i].workday) )
			{
				NeedToChange = 'noneed2change';
			}
			// console.log(' origin[',j,'].TID = ',_Origin[j].TID);
		}
		if( NeedToChange == 'wait2confirm'){ NeedToChange = 'canfindmatchdata'; }
		console.log(' NeedToChange = ',NeedToChange);
		console.log('');		
		if( NeedToChange == 'canfindmatchdata' ){
			DeleteSyncDataFromBackupDatabase(_Backup[i].TID,_Backup[i].workyear,_Backup[i].workmonth,_Backup[i].workday,_Backup[i].name);
		}
	}
}