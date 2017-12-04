express = require('express');
bodyParser = require('body-parser');
MongoClient = require('mongodb').MongoClient;
path = require('path');
moment = require('moment');

var https = require('https');
var  fs = require("fs");
var sleep = require('system-sleep');
var aesjs = require('aes-js');
var crypto = require('crypto');
var options = {
    key: fs.readFileSync('./CertificateFile/privatekey.pem'),
    cert: fs.readFileSync('./CertificateFile/certificate.pem'),
    ca: fs.readFileSync('./CertificateFile/cacertificat.pem')
};

app = express();
//app.set('view engine', 'ejs');
app.use(bodyParser.json());
//app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


SettingPage= require('./setting');

CalculateMonthSalary = require('./SalaryCalculate/CalculateMonthSalary');
PrintMonthSalary = require('./SalaryCalculate/PrintMonthSalary');

QRcodeScan = require('./WorkOnlineOffline/QRcodeScan');
PlanWorkSchedule = require('./WorkSchedule/PlanWorkSchedule');

AddLateWorkTimeCalculate = require('./AddLateStatus/AddLateWorkTimeCalculate');
PrintAddLateStatus = require('./AddLateStatus/PrintAddLateStatus');

SyncOnlineOfflineData = require('./UpdateOriginalData/SyncOnlineOfflineData');
SyncWorkScheduleData = require('./UpdateOriginalData/SyncWorkScheduleData');
SyncCombineMonthSchedule = require('./UpdateOriginalData/SyncCombineMonthSchedule.js');
SyncMonthSalary = require('./UpdateOriginalData/SyncMonthSalary.js');

ModifyMemberBrandData = require('./ModifyPersonalData/ModifyMemberBrandData');

AddMemberData = require('./AddNewPersonalData/AddMemberData');
PrintPersonalData = require('./AddNewPersonalData/PrintPersonalData');

HandleStockInOut = require('./StockInAndOut/HandleStockInOut.js')

//AddIncomeAndExpenditure = require('./IncomeAndExpenditure/AddIncomeAndExpenditure');

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

var key = '0123456789abcdef';
var iv = '0123456789abcdef';

var encrypt = function (key, iv, data) {
    var cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    var crypted = cipher.update(data, 'utf8', 'binary');
    crypted += cipher.final('binary');
    crypted = new Buffer(crypted, 'binary').toString('base64');
    return crypted;
};

var decrypt = function (key, iv, crypted) {
    crypted = new Buffer(crypted, 'base64').toString('binary');
    var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    var decoded = decipher.update(crypted, 'binary', 'utf8');
    decoded += decipher.final('utf8');
    return decoded;
};

app.get('/',function(req,res){
  res.render('html.ejs');
});

app.get('/TestHtml/',function(req,res){
    res.render('index.ejs'); 
});

//QRcodeScan. 透過手機端掃描二維條碼，並添加個人上下班時間
app.get('/QR_codeSan_GetTokenToServer/',function(req,res){
    //body = Object.assign({}, results); 
    console.log('req.headers.contenttype = ',req.headers['content-type']);console.log('req.headers.language = ',req.headers['accept-language']);console.log('req.headers.deviceid = ',req.headers['deviceid']);console.log('req.query.usertoken = ',req.headers['usertoken']);
    
    QRcodeScan.CheckDeviceIDAndToken(req.headers['deviceid'],req.headers['usertoken']).then(function(items) 
    {
            if(items != '')
            {
                    QRcodeScan.EmployeeWorkTimeAndStatus(items.uniID,items.name,items.status);
                    var msgString = items.name+''+items.status;
                    var body = {'status':{'code':'S0000','msg':msgString}};
                    console.log(' DeviceID is ',items.deviceid, ' and ',items.name,' is ',items.status);          
            }
            else
            {
                    var body = {'status':{'code':'E0001','msg':'DeviceID 或是 Token 錯誤，請重新輸入'}};
            }
            body = JSON.stringify(body); res.type('application/json'); res.send(body);

    }, function(err) {
          console.error('The promise was rejected', err, err.stack);
    });  
});

// app.get('/FisrtLoginAndReturnMemberToken/',function(req,res){
//   var deckey = decrypt(key, iv, req.headers['account']);
//   var deciv = decrypt(key, iv, req.headers['password']);
//     console.log(req.headers['account']);    
//     console.log(req.headers['password']);
//   dbtoken.collection('memberinformationcollection').findOne({'account':deckey,"password":deciv},function(err, results) {
//   //dbtoken.collection('memberinformationcollection').findOne({'account':req.headers['account'],"password":req.headers['password']},function(err, results) {
//     if(results==null){ json = { 'status':{'code':'E0002','msg':'帳號或密碼有錯，請重新輸入'},'data':results}; }
//     else{ json = { 'status':{'code':'S0000','msg':'帳號密碼正確'},'data':results.uniID};}
//         var SendDataToPhone = JSON.stringify(json); res.type('application/json'); res.send(SendDataToPhone);
//   });
// });

//透過帳號與密碼比對資料庫，若正確則返回一組 token
app.get('/V1/API/FisrtLoginAndReturnMemberToken/',function(req,res){
  var deckey = decrypt(key, iv, req.headers['account']);
  var deciv = decrypt(key, iv, req.headers['password']);
    console.log(req.headers['account']);    
    console.log(req.headers['password']);
  dbtoken.collection('memberinformationcollection').findOne({'account':deckey,"password":deciv},function(err, results) {
  //dbtoken.collection('memberinformationcollection').findOne({'account':req.headers['account'],"password":req.headers['password']},function(err, results) {
    if(results==''){ json = { 'status':{'code':'E0002','msg':'帳號 或 密碼 錯誤，請重新輸入'},'data':results}; }
    else{ json = { 'status':{'code':'S0000','msg':'帳號密碼正確'},'data':results.uniID};}
        var SendDataToPhone = JSON.stringify(json); res.type('application/json'); res.send(SendDataToPhone);
  });
});


// app.get('/GetManageNews/',function(req,res){
//    console.log(' GetManageNews ');
//     SettingPage.PromiseGetMonthSalaryOrHourSalary(req.headers['uniid']).then(function(items) 
//     {
//         console.log(' items.userbrandname = ',items.userbrandname);
//         console.log(' items.userbrandplace = ',items.userbrandplace);
//         dbwork.collection('managenews').find({'userbrandname':items.userbrandname,'userbrandplace':items.userbrandplace},{_id:0,TID:0,userbrandname:0,userbrandplace:0}).toArray(function(err, results) {
//            if(results==null){ json = { 'status':{'code':'E0007','msg':'唯一碼有錯，請重新輸入'},'data':results}; }
//            else{ json = { 'status':{'code':'S0000','msg':'唯一碼正確'},'data':results};}
//            var SendDataToPhone = JSON.stringify(json); res.type('application/json'); res.send(SendDataToPhone);
//         });
//     }, function(err) {
//           console.error('The promise was rejected', err, err.stack);
//     });  
// });

//查詢佈告欄
app.get('/V1/API/GetManageNews/',function(req,res){
    console.log('/V1/API/GetManageNews');
    SettingPage.PromiseGetMonthSalaryOrHourSalary(req.headers['uniid']).then(function(items) 
    {
        dbwork.collection('managenews').find({'userbrandname':items.userbrandname,'userbrandplace':items.userbrandplace},{_id:0,TID:0,userbrandname:0,userbrandplace:0}).toArray(function(err, results) {
           if(results==''){ json = { 'status':{'code':'E0003','msg':'查無此資料，請重新輸入'},'data':results}; }
           else{ json = { 'status':{'code':'S0000','msg':'唯一碼正確'},'data':results};}
           var SendDataToPhone = JSON.stringify(json); res.type('application/json'); res.send(SendDataToPhone);
        });
    }, function(err) {
          console.error('The promise was rejected', err, err.stack);
    });  
});

// app.get('/GetMemberBrandInformation/',function(req,res){
//   dbtoken.collection('memberbrandinformation').find({'uniID':req.headers['uniid']},{_id:0,userfirstarrival:0,userlawsalary:0,userextrasalary:0,usertitlesalary:0,userwithoutsalary:0,userfoodsalary:0,usermonthsalary:0}).toArray(function(err, results) {
//     var jsonReturn = {};jsonReturn ={'uniID':results[0].uniID,'name':results[0].name,'userbrandtitle':results[0].userbrandtitle,'userbrandname':results[0].userbrandname,'userbrandplace':results[0].userbrandplace};
//     if(results==null){ json = { 'status':{'code':'E0003','msg':'唯一碼有錯，請重新輸入'},'data':results}; }
//     else{ json = { 'status':{'code':'S0000','msg':'唯一碼正確'},'data':jsonReturn};}
//         var SendDataToPhone = JSON.stringify(json); res.type('application/json'); res.send(SendDataToPhone);
//   });
// });


//透過UID比對資料庫，若正確則返回一組 token
app.get('/V1/API/GetMemberBrandInformation/',function(req,res){
  dbtoken.collection('memberbrandinformation').find({'uniID':req.headers['uniid']},{_id:0,userfirstarrival:0,userlawsalary:0,userextrasalary:0,usertitlesalary:0,userwithoutsalary:0,userfoodsalary:0,usermonthsalary:0}).toArray(function(err, results) {
    var jsonReturn = {};
    if(results==''){
        jsonReturn = null;
    }else{
        jsonReturn ={'uniID':results[0].uniID,'name':results[0].name,'userbrandtitle':results[0].userbrandtitle,'userbrandname':results[0].userbrandname,'userbrandplace':results[0].userbrandplace};
    }
    
    if(results==''){ json = { 'status':{'code':'E0003','msg':'查無此資料，請重新輸入'},'data':results}; }
    else{ json = { 'status':{'code':'S0000','msg':'唯一碼正確'},'data':jsonReturn};}
        var SendDataToPhone = JSON.stringify(json); res.type('application/json'); res.send(SendDataToPhone);
  });
});

// 傳遞 uniID 當作索引來查詢員工姓名，再查詢出員工上班狀況
app.get('/QueryPersonalSalaryList/',function(req,res){
    var month = req.headers['month'];
    //if(month[0]==0){month=month[1];}
    var year = req.headers['year'];
    var b=year+'/'+month;
    console.log(' req.headers[uniid] = ',req.headers['uniid']);
    SettingPage.GetUniIDAndUseItAsQueryParameter(req.headers['uniid']).then(function(items) 
    {
            if(items != '')
            {
                    console.log(' items.name = ',items.name);
                    dbwork.collection('workperiod').find({'name':items.name,'Year':year,'Month':month},{_id:0,TID:0,uniID:0,SalaryCountStatus:0,addworkstatus:0,extrainfo1:0,extrainfo2:0}).sort({"Day": 1}).toArray(function(err, results) {                
                      var count = 0;while(results[count]!=null){ count++;}console.log(' count = ',count);
                      var jsonArray = [];
                      //console.log(' results = ',results[0].name);
                      for(var i = 0;i<count;i++)
                      {
                          var onlineTime = results[i].Year+'/'+results[i].Month+'/'+results[i].Day+' '+results[i].Hour+':'+results[i].Minute;
                          // console.log(' onlineTime = ',onlineTime);
                          // console.log(' results.name = ',results[i].status);
                          jsonArray.push({'WorkTime':onlineTime,'status':results[i].status});
                      }
                      json = { 'status':{'code':'S0000','msg':'唯一碼正確'},'data':jsonArray};
                      var SendDataToPhone = JSON.stringify(json); res.type('application/json'); res.send(SendDataToPhone);
                    });           
            }
            else
            {
                    var body = {'status':{'code':'E0003','msg':'查無此資料，請重新輸入'}};
                    console.log('  WithErrorUniID'); 
                    body = JSON.stringify(body); res.type('application/json'); res.send(body);
            }
        }, function(err) {
          console.error('The promise was rejected', err, err.stack);
    });  
});

// app.get('/GetMonthlySalaryForEachEmployee/',function(req,res){
//   var month = req.headers['month'];
//   var year = req.headers['year'];
//   var b=year+'/'+month;
//   dbwork.collection('monthlysalaryinformation').find({'uniID':req.headers['uniid'],'monthperiod':new RegExp(b)},{_id:0,TID:0,uniID:0}).toArray(function(err, results) {
//     var jsonReturn = {};jsonReturn ={'monthperiod':results[0].monthperiod,'monthsalary':results[0].monthsalary,'withoutsalary':results[0].withoutsalary,'foodsalary':results[0].foodsalary,'titlesalary':results[0].titlesalary,'addtimesalary':results[0].addtimesalary,'latetimesalary':results[0].latetimesalary,'extrabonus':results[0].extrabonus,'lawsalary':results[0].lawsalary,'totalmonthsalaty':results[0].totalmonthsalaty};
//     if(results==null){ json = { 'status':{'code':'E0005','msg':'唯一碼有錯，請重新輸入'},'data':results}; }
//     else{ json = { 'status':{'code':'S0000','msg':'唯一碼正確'},'data':jsonReturn};}
//         var SendDataToPhone = JSON.stringify(json); res.type('application/json'); res.send(SendDataToPhone);
//   });
// });


// 查詢員工單月薪水資訊
app.get('/V1/API/GetMonthlySalaryForEachEmployee/',function(req,res){
  var month = req.headers['month'];
  var year = req.headers['year'];
  var b=year+'/'+month;
  console.log(req.headers['year']);
  console.log(req.headers['month']);

  dbtest.collection('syncmonthlysalaryinformation').find({'uniID':req.headers['uniid'],'monthperiod':new RegExp(b)},{_id:0,TID:0,uniID:0}).toArray(function(err, results) {
    console.log(results);
    var jsonReturn = {};
    if(results==''){
        jsonReturn = null;
    }else{
        jsonReturn ={'monthperiod':results[0].monthperiod,'monthsalary':results[0].monthsalary,'withoutsalary':results[0].withoutsalary,'foodsalary':results[0].foodsalary,'titlesalary':results[0].titlesalary,'addtimesalary':results[0].addtimesalary,'latetimesalary':results[0].latetimesalary,'extrabonus':results[0].extrabonus,'lawsalary':results[0].lawsalary,'addminute':results[0].addminute,'lateminute':results[0].lateminute,'basicsalary':results[0].basicsalary,'workdaynumber':results[0].workdaynumber,'totalmonthsalary':results[0].totalmonthsalary};
    }

    if(results==''){ json = { 'status':{'code':'E0003','msg':'查無此資料，請重新輸入'},'data':results}; }
    else{ json = { 'status':{'code':'S0000','msg':'唯一碼正確'},'data':jsonReturn};}
        var SendDataToPhone = JSON.stringify(json); res.type('application/json'); res.send(SendDataToPhone);
  });
});


// 查詢員工單月上班情形
app.get('/GetMonthlyEmployeeWorkSchedule/',function(req,res){
  var arraylength = 0;
  var month = req.headers['month'];
  var year = req.headers['year'];
  console.error('year=',year,'/month=',month);
  console.error('year=',year);

  arraylength = MonthHaveHowManyDay(year,month);
  console.log(' arraylength',arraylength);

    SettingPage.PromiseGetMonthSalaryOrHourSalary(req.headers['uniid']).then(function(items) 
    {
        dbwork.collection('employeeworkschedule').find({'userbrandname':items.userbrandname,'userbrandplace':items.userbrandplace,'workyear':year,'workmonth':month},{_id:0,TID:0,uniID:0,userbrandname:0,userbrandplace:0,onlinehour:0,onlineminute:0,offlinehour:0,offlineminute:0}).toArray(function(err, results) {
           var count = 0;var arr =[];var jsonArray = [];
           for( var i = 0; i<arraylength; i++ ) {
              var day = i + 1;
              arr.push([]);
           }
           while(results[count]!=null)
           {  
              var indexleft = parseInt(results[count].workday,10)-1;
              var indexright = results[count].name;
              arr[indexleft].push(results[count].name);
              count++;
           }   
           for( var i = 0; i<arraylength; i++ ) {
               var day = i + 1;var daystring;var date;
               if(day<10){daystring='0'+day;date = month+'/'+daystring;}
               else{date = month+'/'+day;}
               jsonArray.push({'Date':date,'Employee':arr[i]});
           }  
           results = jsonArray;

           if(results==null){ json = { 'status':{'code':'E0003','msg':'唯一碼有錯，請重新輸入'},'data':results}; }
           else{ json = { 'status':{'code':'S0000','msg':'唯一碼正確'},'data':results};}
           var SendDataToPhone = JSON.stringify(json); res.type('application/json'); res.send(SendDataToPhone);
        });
    }, function(err) {
          console.error('The promise was rejected', err, err.stack);
    });  
});

// 查詢員工單月上班情形
app.get('/V1/API/GetMonthlyEmployeeWorkSchedule/',function(req,res){
  var arraylength = 0;
  var month = req.headers['month'];
  var year = req.headers['year'];
  var date = year+'/'+month;
  console.error('year=',year,'/month=',month);
  arraylength = MonthHaveHowManyDay(year,month);
  console.log(' arraylength',arraylength);
  var arr =[];
        dbtest.collection('synccombinemonthworkschedule').find({'workyear':year,'workmonth':month,uniID:req.headers['uniid']}).toArray(function(err, results) {
            for( var j = 1; j<arraylength+1; j++ ) {
              var isschedule = false;var isleave = false;
              var islate = false;var isearly = false;var isabsent = false;var isovertime = false;
              for( var i = 0; i<results.length; i++ ) {
                    if( j ==parseInt(results[i].workday,10))
                    {
                      if(results[i].shcedulestatus =='正常上班')
                      {
                          isschedule = true;
                      }
                      if(results[i].shcedulestatus =='病假')
                      {
                          isleave = true;
                      }   
                      if(results[i].realworkstatus =='曠職')
                      {
                          isabsent = true;
                      }  
                      if(results[i].onlinecondition =='遲到')
                      {
                          islate = true;
                      }  
                      if(results[i].offlinecondition =='加班')
                      {
                          isovertime = true;
                      } 
                      if(results[i].offlinecondition =='早退')
                      {
                          isearly = true;
                      }  
                    }
              }
              if(j<10){j='0'+j;}
              j = j.toString();
              arr.push({'day':j,'isschedule':isschedule,'isleave':isleave,'isabsent':isabsent,'islate':islate,'isovertime':isovertime,'isearly':isearly});
            }

           if(results==null){ json = { 'status':{'code':'E0003','msg':'唯一碼有錯，請重新輸入'},'datecheck':date,'data':results}; }
           else{ json = { 'status':{'code':'S0000','msg':'唯一碼正確'},'datecheck':date,'data':arr};}
           var SendDataToPhone = JSON.stringify(json); res.type('application/json'); res.send(SendDataToPhone);
        });
});


// 查詢單日員工上班細項
app.get('/V1/API/GetSingleDayWorkScheduleDetail/',function(req,res){
  var year = req.headers['year'];
  var month = req.headers['month'];
  var day = req.headers['month'];
  var date = req.headers['date'];

    SettingPage.PromiseGetMonthSalaryOrHourSalary(req.headers['uniid']).then(function(items) 
    {
        dbwork.collection('employeeworkschedule').find({'userbrandname':items.userbrandname,'userbrandplace':items.userbrandplace,'workyear':year,'workmonth':month,'workday':day},{_id:0,TID:0,uniID:0,userbrandname:0,userbrandplace:0}).toArray(function(err, results) {
          dbwork.collection('workperiod').find({'Year':year,'Month':month,'Day':day,uniID:req.headers['uniid']}).sort({"name": 1}).toArray(function(err, data) {
           
               var count = 0;while(results[count]!=null){ count++;}console.log(' count = ',count);
               var jsonArray = [];var RealPeriod = '';

               for(var i = 0;i<count;i++)
               {
                  var onlineTime = results[i].onlinehour+':'+results[i].onlineminute+'-'+results[i].offlinehour+':'+results[i].offlineminute;
                  // console.log(' onlineTime = ',onlineTime);
                  // console.log(' results.name = ',results[i].status);
                  jsonArray.push({'name':results[i].name,'WorkTime':onlineTime,'status':results[i].status});
               }
               if(data.length != 0 )
               {
                   for(var j = 0;j<data.length;j++)
                   {
                      if(data[j].status == '上班')
                      {
                          var RealOnlineTime =  data[j].Hour+':'+ data[j].Minute;
                      }
                      else
                      {
                          var RealOfflineTime =  data[j].Hour+':'+ data[j].Minute;
                      }
                   }
                   var RealPeriod = RealOnlineTime+'-'+RealOfflineTime;
               }
               console.log(' RealPeriod =',RealPeriod);

               if(results==''){ json = { 'status':{'code':'E0003','msg':'唯一碼有錯或查無資料'},'self_data': RealPeriod,'employee_data':jsonArray};}
               else{ json = { 'status':{'code':'S0000','msg':'唯一碼正確'},'self_data': RealPeriod,'employee_data':jsonArray};}
               var SendDataToPhone = JSON.stringify(json); res.type('application/json'); res.send(SendDataToPhone);

            });
        });
    }, function(err) {
          console.error('The promise was rejected', err, err.stack);
    });  
});


// 如果需要透過網頁設定的話可以使用 req.body，如果要透過 postman 就要使用 req.query
app.post('/AddUserTokenRelatedInformationBridge/',function(req,res){
    // var deviceID = req.body.deviceid;var UserToken = req.body.usertoken;var namePass = req.body.username;var statusPass = req.body.status;
    var onlyID = req.query.onlyid;var deviceID = req.query.deviceid;var UserToken = req.query.usertoken;var namePass = req.query.username;var statusPass = req.query.status;
    SettingPage.AddUserTokenRelatedInformationFunction(onlyID,deviceID,UserToken,namePass,statusPass);
});

// 透過postman新增會員資料
app.post('/AddMemberInformationFunction/',function(req,res){
    var namePass = req.query.username;var account = req.query.account;var password = req.query.password;
    SettingPage.AddMemberInformationFunction(namePass,account,password);
});

// 透過postman新增會員品牌店務資料
app.post('/AddMemberBrandInformation/',function(req,res){
    var uniID = req.query.uniID;var namePass = req.query.username;var userBrandtitle = req.query.userbrandtitle;
    var userBrandname = req.query.userbrandname;var userBrandplace = req.query.userbrandplace;
    var usermonthsalary = req.query.usermonthsalary;var userfoodsalary = req.query.userfoodsalary;
    var userwithoutsalary = req.query.userwithoutsalary;var usertitlesalary = req.query.usertitlesalary;
    var userextrasalary = req.query.userextrasalary;var userlawsalary = req.query.userlawsalary;var userfirstarrival = req.query.userfirstarrival;

    SettingPage.AddMemberBrandInformation(uniID,namePass,userBrandtitle,userBrandname,userBrandplace,usermonthsalary,userfoodsalary,userwithoutsalary,usertitlesalary,userextrasalary,userlawsalary,userfirstarrival);

});

// 透過postman新增單店公告
app.get('/AddManageNews/',function(req,res){
    var news = req.headers['news'];var newsTitle = req.headers['newstitle'];var isImportant;
    if(req.headers['isimportant'] == 'true')
    {
      isImportant = true;
    }
    else
    {
      isImportant = false;
    }

    SettingPage.PromiseGetMonthSalaryOrHourSalary(req.headers['uniid']).then(function(items) 
    {
      console.log(' item is ',items.userbrandname, ' and ',items.userbrandplace,  ' and ',news); 
      SettingPage.AddManageNews(news,newsTitle,isImportant,items.name,items.userbrandname,items.userbrandplace);
    }, function(err) {
          console.error('The promise was rejected', err, err.stack);
    });  
    res.redirect('/');
});


// =============== 庫存系統相關 ===========================================

app.get('/CheckProductTiming/',function(req,res){
  UpdateStockTag();
});

function UpdateStockTag(_StockTag)
{
  dbtest.collection('thinginstock').findOneAndUpdate({productnumber:_StockTag},{
      $set: 
      {
        status: '出庫',
        outstockdate: _outstockdate,
        outstocktime: _outstocktime
      }
  },{
        upsert: true
  },(err, result) => {
      if (err) return res.send(err)
  });   
}

//  確認每個庫存數量
app.get('/CheckProductPartialTagEachNumber/',function(req,res){
    HandleStockInOut.GetProductPartialTagEachNumber().then(function(items) 
    {
          // console.log('計算每個品項數量');
          // console.log('length = ',items.product.length);
          res.render('CheckStockInEachProductNumber.ejs',{passvariable:items});
    }, function(err) {
          console.error('The promise was rejected', err, err.stack);
    });
});
//  確認現有庫存
app.get('/CheckProductInStock/',function(req,res){
    var _Year = GetNeedSyncYear();
    var _Month = GetNeedSyncMonth(0);
    var _Day = GetNeedSyncDay();
    var _DaysNumber = MonthHaveHowManyDay(_Year,_Month);

    HandleStockInOut.GetProductListInStock(req.query.checkPeriodYear,req.query.checkPeriodMonth,req.query.checkPeriodDay,req.query.checkType).then(function(items) 
    {
          res.render('CheckProductInStock.ejs',{passvariable:items,year:_Year,month:_Month,day:_Day,daysnumber:_DaysNumber});
    }, function(err) {
          console.error('The promise was rejected', err, err.stack);
    });
});

//  新增庫存標籤
app.get('/AddProductPartialTag/',function(req,res){
    res.render('AddProductPartialTag.ejs'); 
});
app.post('/AddProductPartialTagInStock/',function(req,res){
    HandleStockInOut.SaveProductPartialTagToStock(req.body.brandname,req.body.productname,req.body.producttag,req.body.class,req.body.subclass,req.body.grade); 
    res.redirect('/');
});

//  確認產品標籤
app.get('/CheckProductPartialTag/',function(req,res){
    HandleStockInOut.GetProductPartialTag().then(function(items) 
    {
          res.render('CheckProductPartialTag.ejs',{passvariable:items});
    }, function(err) {
          console.error('The promise was rejected', err, err.stack);
    });
});

//  新增庫存產品
app.get('/QRcodeStockIn/',function(req,res){
    res.render('StockInCheck.ejs',{passvariable:req.query.thing});
});

app.get('/StockInCheck/',function(req,res){
    console.log('thing = ',req.query.checkthing);
    HandleStockInOut.CheckStockInOut(req.query.checkthing,'食鍋藝');
    res.redirect('/');
});

app.post('/DeleteProductInStock/',function(req,res){
    console.log(' productnumber = ',req.body.productnumber);
    HandleStockInOut.DeleteProduct(req.body.productnumber);
    res.redirect('/');
});


// ===============================================================

// =============== 員工基本相關 ===========================================
//新增員工基本資料
app.get('/ShowNewPersonalData_AddMemberData/',function(req,res){
    res.render('AddNewPersonalData_PrintAddMemberDataFrame.ejs'); 
}); 
app.post('/AddNewPersonalData_AddMemberData/',function(req,res){
    AddMemberData.AddNewMemberData(req.body.name,req.body.userbrandtitle,req.body.userbrandname,req.body.userbrandplace,req.body.usermonthsalary,req.body.userfoodsalary,req.body.userwithoutsalary,req.body.usertitlesalary,req.body.userextrasalary,req.body.userlawsalary); 
    res.redirect('/');
});

//顯示員工基本資料 
app.post('/ShowAndModifyMemberBrandData_UpdateBrandData/', (req, res) => {
  ModifyMemberBrandData.UpdateDataBrandData(req.body.uniID,req.body.name,req.body.updatechoose,req.body.content);
  sleep(2);
  res.redirect('/ShowAndModifyMemberBrandData_ModifyBrandData');
});
app.get('/ShowAndModifyMemberBrandData_ModifyBrandData/',function(req,res){
  ModifyMemberBrandData.ShowMemberBrandData().then(function(items)
  {
        res.render('ShowAndModifyMemberBrandData.ejs',{passvariable:items});
  }, function(err) {
        console.error('The promise was rejected', err, err.stack);
  }); 
});

//顯示員工打卡資料
app.get('/ShowAndModifyUserTokenData_UserTokenData/',function(req,res){
  PrintPersonalData.PrintUserTokenData().then(function(items)
  {
        res.render('ShowAndModifyUserTokenData.ejs',{passvariable:items});
  }, function(err) {
        console.error('The promise was rejected', err, err.stack);
  }); 
});

// ===============================================================

// =============== 員工排班相關 ===========================================
// 新增員工多天排班
app.get('/Plan_Work_Schedule_MultipleDirectPageToAddEmployeeWorkSchedule/',function(req,res){
    var _Year = GetNeedSyncYear();
    var _Month = GetNeedSyncMonth(0);
    dbtoken.collection('memberbrandinformation').find().toArray(function(err, results) {
          res.render('UseCheckBoxByAddEmployeeWorkSchedule.ejs',{member:results,year:_Year,month:_Month});
    }); 
});
app.post('/Plan_Work_Schedule_UseCheckBoxByAddEmployeeWorkSchedule/',function(req,res){
    PlanWorkSchedule.AddMultipleEmployeeWorkScheduleFunction(req.body.checkName,req.body.checkPeriodYear,req.body.checkPeriodMonth,req.body.checkPeriodOnlineHour,req.body.checkPeriodOnlineMinute,req.body.checkPeriodOfflineHour,req.body.checkPeriodOffineMinute,
                                                             req.body.checkbox01,req.body.checkbox02,req.body.checkbox03,req.body.checkbox04,req.body.checkbox05,req.body.checkbox06,req.body.checkbox07,req.body.checkbox08,req.body.checkbox09,req.body.checkbox10,req.body.checkbox11,req.body.checkbox12,
                                                             req.body.checkbox13,req.body.checkbox14,req.body.checkbox15,req.body.checkbox16,req.body.checkbox17,req.body.checkbox18,req.body.checkbox19,req.body.checkbox20,req.body.checkbox21,req.body.checkbox22,req.body.checkbox23,req.body.checkbox24,
                                                             req.body.checkbox25,req.body.checkbox26,req.body.checkbox27,req.body.checkbox28,req.body.checkbox29,req.body.checkbox30,req.body.checkbox31);   
    res.redirect('/');
});


// 顯示單月員工排班列表
app.get('/Plan_Work_Schedule_CheckEmployeeWorkScheduleByList/',function(req,res){
    var _Year = GetNeedSyncYear();
    var _Month = GetNeedSyncMonth(0);
    PlanWorkSchedule.CheckWorkScheduleByList(req.query.checkPeriodYear,req.query.checkPeriodMonth).then(function(items) 
    {
          res.render('PlanWorkSchedule_CheckWorkScheduleByList.ejs',{passvariable:items,year:_Year,month:_Month});
    }, function(err) {
          console.error('The promise was rejected', err, err.stack);
    });
});

// 調整員工排班狀況
app.get('/Plan_Work_Schedule_AdjustWorkSchedule/',function(req,res){
    PlanWorkSchedule.AdjustWorkSchedule(req.query.checkPeriodYear,req.query.checkPeriodMonth,req.query.checkPeriodDay).then(function(items) 
    {
          res.render('AdjustWorkSchedule.ejs',{WorkHour:items});
    }, function(err) {
          console.error('The promise was rejected', err, err.stack);
    }); 
});
app.post('/Plan_Work_Schedule_DeleteWorkScheduleData/', (req, res) => {
  PlanWorkSchedule.DeleteWorkSchdeule(req.body.TID,req.body.workyear,req.body.workmonth,req.body.workday);sleep(2);
  res.redirect('/Plan_Work_Schedule_AdjustWorkSchedule/');    
});

// 顯示有排班無上班
app.get('/Show_CheckHaveScheduleButNoWork/',function(req,res){
    dbtest.collection('checkhaveschedulebutnowork').find().toArray(function(err, data) {
      res.render('ShowHaveScheduleButNoWork.ejs',{passvariable:data});
    });
});


// ===============================================================


// =============== 員工上班相關 ===========================================
//顯示單月員工上班狀況
app.get('/QR_codeSan_CheckEveryMonthWorkStatus/',function(req,res){
    var _Year = GetNeedSyncYear();
    var _Month = GetNeedSyncMonth(0);
    QRcodeScan.CheckMonthOnlineOfflineByBrandNameAndMonth(req.query.checkPeriodYear,req.query.checkPeriodMonth,req.query.checkName).then(function(items) 
    {
        dbtoken.collection('memberbrandinformation').find().toArray(function(err, results) {
          res.render('CheckEveryMonthWorkStatus.ejs',{passvariable:items,member:results,year:_Year,month:_Month});
        });
    }, function(err) {
          console.error('The promise was rejected', err, err.stack);
    }); 
});

//調整員工上班時間
app.get('/QR_codeSan_AdjustOnlineStatus/',function(req,res){
    QRcodeScan.AdjustOnlineOfflineData().then(function(items) 
    {
        res.render('AdjustOnlineStatus.ejs',{WorkHour:items});
    }, function(err) {
          console.error('The promise was rejected', err, err.stack);
    });  
});
app.post('/QR_codeScan_DeleteOnlineOfflineDate/', (req, res) => {
  QRcodeScan.DeleteOnlineOfflineData(req.body.TID,req.body.name,req.body.Year,req.body.Month,req.body.Day);
  sleep(2);
  res.redirect('/');    
});
app.post('/QR_codeScan_UpdateOnlineOfflineDate/', (req, res) => {
  QRcodeScan.UpdateOnlineOfflineData(req.body.TID,req.body.updathour,req.body.updateminute,req.body.updateday,req.body.updatemonth,req.body.updateyear,req.body.name);
  sleep(1.5);
  res.redirect('/');
});

//顯示單月加班遲到狀況
app.get('/PrintMonthSalary_CheckBackupAddLateStatus/',function(req,res){
  var _Year = GetNeedSyncYear();
  var _Month = GetNeedSyncMonth(0);
  PrintAddLateStatus.printBackupAddlateStatus(req.query.checkName,req.query.checkPeriodYear,req.query.checkPeriodMonth).then(function(items)
  {
        dbtoken.collection('memberbrandinformation').find().toArray(function(err, results) {
          res.render('CheckAddLateTimeBackupStatus.ejs',{passvariable:items,member:results,year:_Year,month:_Month});
        });
  }, function(err) {
        console.error('The promise was rejected', err, err.stack);
  }); 
});

//顯示有上班無排班 
app.get('/Show_CheckHaveWorkButNoSchedule/',function(req,res){
    dbtest.collection('checkhaveworkbutnoschedule').find().toArray(function(err, data) {
      res.render('ShowHaveWorkButNoSchedule.ejs',{passvariable:data});
    });
});



// =============== 同步相關 ===========================================
// 同步本月上班
app.get('/Sync_OriginAndBackupOnlineOffline/',function(req,res){
    SyncOnlineOfflineData.OnlineOfflineStatus();
    res.redirect('/');
});
// 同步本月排班
app.get('/Sync_OriginAndBackupWorkSchedule/',function(req,res){
    var BrandButton = '食鍋藝';//需要知道店名稱來識別需要計算哪間店的資料
    SyncWorkScheduleData.WorkSchedulStatus(BrandButton);
    res.redirect('/');
});

// 同步合併排班  
app.get('/Sync_CombineMonthSchedule/',function(req,res){
    var BrandButton = '食鍋藝';//需要知道店名稱來識別需要計算哪間店的資料
    SyncCombineMonthSchedule.MonthWorkSchedule(BrandButton);
    res.redirect('/');
});
// 新同步合併排班  
app.get('/Sync_NewCombineMonthSchedule/',function(req,res){
    var BrandButton = '食鍋藝';//需要知道店名稱來識別需要計算哪間店的資料
    SyncCombineMonthSchedule.NewMonthWorkSchedule(BrandButton);
    res.redirect('/');
});
// 同步上班排班不同步
app.get('/Sync_IsWorkOrScheduleWithSync/',function(req,res){
    var BrandButton = '食鍋藝';//需要知道店名稱來識別需要計算哪間店的資料
    var _Year = GetNeedSyncYear();
    var _Month = GetNeedSyncMonth(1);
    SyncCombineMonthSchedule.NewIsWorkOrScheduleWithSync(BrandButton,_Year,_Month);
    res.redirect('/');
});
// 同步單月薪水
app.get('/Sync_CombineMonthSalary/',function(req,res){
    var BrandButton = '食鍋藝';//需要知道店名稱來識別需要計算哪間店的資料
    SyncMonthSalary.MonthSalaryCalculate(BrandButton);
    res.redirect('/');
});
// 同步本月有上班無排班
app.get('/Sync_CheckHaveWorkButNoSchedule/',function(req,res){
    var BrandButton = '食鍋藝';//需要知道店名稱來識別需要計算哪間店的資料
    AddLateWorkTimeCalculate.CheckHaveWorkButNoSchedule(BrandButton); 
    res.redirect('/');
});
// 同步本月有排班無上班
app.get('/Sync_CheckHaveScheduleButNoWork/',function(req,res){
    var BrandButton = '食鍋藝';//需要知道店名稱來識別需要計算哪間店的資料
    AddLateWorkTimeCalculate.CheckHaveScheduleButNoWork(BrandButton); 
    res.redirect('/');
});
// 同步本月加班遲到
app.get('/Sync_AddLateWorkTimeCalculate_result/',function(req,res){
    var BrandButton = '食鍋藝';//需要知道店名稱來識別需要計算哪間店的資料
    AddLateWorkTimeCalculate.CalculateAddlateTime(BrandButton); 
    res.redirect('/');
});

// ===============================================================

// =============== 同步相關 ===========================================
//上班備份資料
app.get('/Backup_CheckOriginDataByDay/',function(req,res){
    var _Year = GetNeedSyncYear();
    var _Month = GetNeedSyncMonth(0);
    dbtest.collection('synconlineofflinedata').find({'Year':req.query.checkPeriodYear,'Month':req.query.checkPeriodMonth}).sort({'Month':1,'Day':1,"name": 1,'status':1}).toArray(function(err, data) {
        dbtoken.collection('memberbrandinformation').find().toArray(function(err, results) {
          res.render('Backup_CheckEveryMonthWorkStatus.ejs',{passvariable:data,member:results,year:_Year,month:_Month});
        });
    });
});


// 排班備份資料
app.get('/CheckBackupScheduleData/',function(req,res){
    var _Year = GetNeedSyncYear();
    var _Month = GetNeedSyncMonth(0);
    dbtest.collection('synworkscheduledata').find({'workyear':req.query.checkPeriodYear,'workmonth':req.query.checkPeriodMonth}).sort({'workyear':1,'workmonth':1,"workday":1,"name": 1}).toArray(function(err, data) {
      res.render('Backup_PlanWorkSchedule_CheckWorkScheduleByList.ejs',{passvariable:data,year:_Year,month:_Month});
    });
});

// 合併排班資料
app.get('/Sync_ShowCombineMonthSchedule/',function(req,res){
    var BrandButton = '食鍋藝';//需要知道店名稱來識別需要計算哪間店的資料
    var _Year = GetNeedSyncYear();
    var _Month = GetNeedSyncMonth(0);
    dbtest.collection('synccombinemonthworkschedule').find({'workyear':req.query.checkPeriodYear,'workmonth':req.query.checkPeriodMonth,'userbrandname':BrandButton}).sort({'workyear':1,'workmonth':1,"name": 1,"TID":1,"workday":1}).toArray(function(err, backup) {
        res.render('Backup_CombineMonthSchedule.ejs',{passvariable:backup,year:_Year,month:_Month});
    });
});

// 更新合併排班資料
app.get('/Sync_UpdateShowCombineMonthSchedule/',function(req,res){
    var BrandButton = '食鍋藝';//需要知道店名稱來識別需要計算哪間店的資料
    SyncCombineMonthSchedule.NewUpdateRealWorkStatusCondition(req.query.TID,req.query.name,req.query.uniID,req.query.updaterealworkstatus);
    dbtest.collection('synccombinemonthworkschedule').find({'workyear':req.query.workyear,'workmonth':req.query.workmonth,'userbrandname':BrandButton}).sort({'workyear':1,'workmonth':1,"name": 1,"TID":1,"workday":1}).toArray(function(err, backup) {
        res.render('Backup_CombineMonthSchedule.ejs',{passvariable:backup,year:req.query.workyear,month:req.query.workmonth});
    });
});

// 顯示單月薪水
app.get('/Sync_ShowMonthSalary/',function(req,res){
    var BrandButton = '食鍋藝';//需要知道店名稱來識別需要計算哪間店的資料
    dbtest.collection('syncmonthsalary').find({'year':req.query.checkPeriodYear,'month':req.query.checkPeriodMonth,'userbrandname':BrandButton}).sort({'year':1,'month':1}).toArray(function(err, backup) {
        dbtoken.collection('memberbrandinformation').find().toArray(function(err, results) {
           res.render('Backup_AfterSyncMonthSalary.ejs',{passvariable:backup,member:results});
        });
    });
});
// ===============================================================

// =============== 財務資訊 ===========================================


// ===============================================================

app.get('/Plan_Work_Schedule_SingleDirectPageToAddEmployeeWorkSchedule/',function(req,res){
    res.render('AddEmployeeWorkSchedule.ejs');
});

app.post('/Plan_Work_Schedule_AddEmployeeWorkSchedule/',function(req,res){ 
    PlanWorkSchedule.AddEmployeeWorkScheduleFunction(req.body.checkName,req.body.checkPeriodYear,req.body.checkPeriodMonth,req.body.checkPeriodDay,req.body.checkPeriodOnlineHour,req.body.checkPeriodOnlineMinute,req.body.checkPeriodOfflineHour,req.body.checkPeriodOffineMinute); 
    res.redirect('/');
});

app.get('/Backup_PrintMonthSalary_CheckMonthSalary/',function(req,res){
  PrintMonthSalary.backupprintMonthSalaryStatus(req.query.checkName,req.query.checkPeriodYear,req.query.checkPeriodMonth).then(function(items)
  {
        res.render('Backup_MonthSalary.ejs',{passvariable:items});
  }, function(err) {
        console.error('The promise was rejected', err, err.stack);
  }); 
});

app.post('/Plan_Work_Schedule_CheckEmployeeWorkScheduleByGroup/',function(req,res){
    PlanWorkSchedule.CheckWorkSchedule(req.body.checkPeriodYear,req.body.checkPeriodMonth).then(function(items) 
    {
          res.render('PlanWorkSchedule_CheckWorkScheduleByGroup.ejs',{WorkSchedule:items,MonthPass:Month});
    }, function(err) {
          console.error('The promise was rejected', err, err.stack);
    });
});

app.post('/QR_codeSan_CheckEveryDayWorkStatus/',function(req,res){
    QRcodeScan.CheckSingleDayOnlineOfflineByBrandNameAndDate(req.body.checkPeriodYear,req.body.checkPeriodMonth,req.body.checkPeriodDay).then(function(items) 
    {
          res.render('CheckEveryDayWorkStatus.ejs',{passvariable:items});
    }, function(err) {
          console.error('The promise was rejected', err, err.stack);
    }); 
});

app.get('/ShowIncomeAndExpenditure/',function(req,res){
    res.render('AddIncomeAndExpenditure.ejs'); 
});

app.post('/AddIncomeAndExpenditureData/',function(req,res){
   console.log(' year = ',req.body.year);
   console.log(' month = ',req.body.month);
   console.log(' day = ',req.body.day);
   console.log(' itemname = ',req.body.itemname);
   console.log(' itemclass = ',req.body.itemclass);
   console.log(' itemsubclass = ',req.body.itemsubclass);
   AddIncomeAndExpenditure.AddIncomeAndExpenditureData(req.body.year,req.body.month,req.body.day,req.body.itemname,req.body.itemclass,req.body.itemsubclass);
   res.render('AddIncomeAndExpenditure.ejs'); 
});

app.get('/Sync_CalculateMonthSalary_MonthCalculate/',function(req,res){
    var BrandButton = '食鍋藝';//需要知道店名稱來識別需要計算哪間店的資料
    CalculateMonthSalary.CalculateMonthSalary(BrandButton); 
    res.redirect('/');
});

app.post('/Origin_CheckOriginDataByDay/',function(req,res){
    dbwork.collection('workperiod').find({'Year':req.body.checkPeriodYear,'Month':req.body.checkPeriodMonth}).sort({'Day':1,"name": 1,'status':1}).toArray(function(err, data) {
      res.render('Origin_CheckEveryMonthWorkStatus.ejs',{passvariable:data});
    });
});

app.post('/CheckOriginScheduleData/',function(req,res){
    dbwork.collection('employeeworkschedule').find({'workyear':req.body.checkPeriodYear,'workmonth':req.body.checkPeriodMonth}).sort({'workyear':1,'workmonth':1,"workday":1,"name": 1}).toArray(function(err, data) {
      res.render('Origin_PlanWorkSchedule_CheckWorkScheduleByList.ejs',{passvariable:data});
    });
});

// ============ 共同使用函式 =====================
function GetNeedSyncYear()
{
  var Year = moment().format('YYYY');
  Year = Year.toString();
  return Year;
} 

function GetNeedSyncMonth(_Shift)
{
  var Month = moment().format('MM')-_Shift;
    //為了月份做處理，單位數的補零，雙位數的轉字串
    if(Month<10){Month='0'+Month;}
    Month = Month.toString();

  return Month;
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


function GetNeedSyncDay()
{
  var Day = moment().format('DD');
    //為了月份做處理，單位數的補零，雙位數的轉字串
  return Day;
} 
// ==============================================
          
https.createServer(options, app).listen(9081, function () {
    console.log('Https server listening on port ' + 9081);
});

app.listen(9080, function(){
    console.log('listening on 9080');
});

