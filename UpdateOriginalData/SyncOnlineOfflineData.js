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

var MonthShift = 1 ;

exports.OnlineOfflineStatus = function()
{
	//產生現在的年份與月份
  	var _Year = moment().format('YYYY');
  	var _Month = moment().format('MM') - MonthShift;

  	//為了月份做處理，單位數的補零，雙位數的轉字串
  	if(_Month<10){_Month='0'+_Month;}
  	_Month = _Month.toString();
	console.log(' Date = ', _Year+'/'+_Month);

	//比對原始上班資訊資料庫和備份上班資料庫
  	dbwork.collection('workperiod').find({'Year':_Year,'Month':_Month}).toArray(function(err, origin) {
		dbtest.collection('synconlineofflinedata').find({'Year':_Year,'Month':_Month}).toArray(function(err, backup) {
			for( var i = 0; i<origin.length; i++ )	
			{
				var NeedToChange = 'wait2confirm';
				for( var j = 0; j<backup.length; j++ )
				{
					//#檢查 #TID/UID/姓名
					if( (origin[i].TID == backup[j].TID) && (origin[i].uniID == backup[j].uniID) && (origin[i].name == backup[j].name)  )
					{
						//#檢查 #其中有一項有變化就要 update
						if(origin[i].status != backup[j].status){NeedToChange = 'update';}
						if(origin[i].Year != backup[j].Year){NeedToChange = 'update';}
						if(origin[i].Month != backup[j].Month){NeedToChange = 'update';}
						if(origin[i].Day != backup[j].Day){NeedToChange = 'update';}
						if(origin[i].Hour != backup[j].Hour){NeedToChange = 'update';}
						if(origin[i].Minute != backup[j].Minute){NeedToChange = 'update';}
						if(origin[i].SalaryCountStatus != backup[j].SalaryCountStatus){NeedToChange = 'update';}
						if(origin[i].addworkstatus != backup[j].addworkstatus){NeedToChange = 'update';}
						if(origin[i].extrainfo1 != backup[j].extrainfo1){NeedToChange = 'update';}
						if(origin[i].extrainfo2 != backup[j].extrainfo2){NeedToChange = 'update';}
						
						if( NeedToChange == 'wait2confirm'){NeedToChange = 'unchange';}

					}
				}	
				if( NeedToChange == 'wait2confirm'){NeedToChange = 'create';}
				if( NeedToChange == 'create'){
					CreateNewSyncDataFromOriginalDatabase(origin[i].TID,origin[i].uniID,origin[i].name,origin[i].status,origin[i].Year,origin[i].Month,origin[i].Day,origin[i].Hour,origin[i].Minute,origin[i].SalaryCountStatus,origin[i].addworkstatus,origin[i].extrainfo1,origin[i].extrainfo2);
				}else if( NeedToChange == 'update' ){
					DeleteSyncDataFromBackupDatabase(origin[i].TID,origin[i].name);
					CreateNewSyncDataFromOriginalDatabase(origin[i].TID,origin[i].uniID,origin[i].name,origin[i].status,origin[i].Year,origin[i].Month,origin[i].Day,origin[i].Hour,origin[i].Minute,origin[i].SalaryCountStatus,origin[i].addworkstatus,origin[i].extrainfo1,origin[i].extrainfo2);
				}
				// console.log(' NeedToChange = ',NeedToChange);	
				// console.log(' origin[',i,'].TID = ',origin[i].TID);
				// console.log('');
			}
			CheckBackupIsMoreDataThanOrignalData(origin,backup);
		    if(err)return console.log(err);
		});       		
       if(err)return console.log(err);
  	});
}

function CreateNewSyncDataFromOriginalDatabase(_TID,_uniID,_name,_status,_Year,_Month,_Day,_Hour,_Minute,_SalaryCountStatus,_addworkstatus,_extrainfo1,_extrainfo2)
{
	dbtest.collection('synconlineofflinedata').save({TID:_TID,uniID:_uniID,name:_name,status:_status,Year:_Year,Month:_Month,Day:_Day,Hour:_Hour,Minute:_Minute,SalaryCountStatus:_SalaryCountStatus,addworkstatus:_addworkstatus,extrainfo1:_extrainfo1,extrainfo2:_extrainfo2},function(err,result){
     	if(err)return console.log(err);
  	});
}

function DeleteSyncDataFromBackupDatabase(_TID,_name)
{
    dbtest.collection('synconlineofflinedata').findOneAndDelete({TID:parseInt(_TID,10),name:_name},(err, result) => {
      if (err)return console.log(err);
    });
}

function CheckBackupIsMoreDataThanOrignalData(_Origin,_Backup)
{
	for( var i = 0; i<_Backup.length; i++ )	
	{
		var NeedToChange = 'wait2confirm';
		//console.log('');
		//console.log(' _Backup[',i,'].TID = ',_Backup[i].TID);
		for( var j = 0; j<_Origin.length; j++ )
		{	
			if( (_Origin[j].TID == _Backup[i].TID) && (_Origin[j].uniID == _Backup[i].uniID) && (_Origin[j].Day == _Backup[i].Day) )
			{
				NeedToChange = 'noneed2change';
			}
			// console.log(' origin[',j,'].TID = ',_Origin[j].TID);
		}
		if( NeedToChange == 'wait2confirm'){ NeedToChange = 'canfindmatchdata'; }
		//console.log(' NeedToChange = ',NeedToChange);
		//console.log('');		
		if( NeedToChange == 'canfindmatchdata' ){
			DeleteSyncDataFromBackupDatabase(_Backup[i].TID,_Backup[i].name);
		}
	}
}