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

var Promise = require('rsvp').Promise;


// 新增每個月員工新水資訊
exports.AddEmployeeMonthlySalaryInformation = function(OnlyID,YearMonth,UserName,UserBrandTitle,CalculateMonth,OverWorkTime,LateWorkTime,ExtraBonus,SpecialBonus,TotalMonthSalaty)
{
  dbwork.collection('monthlysalaryinformation').save({TID:Date.now(),monthperiod:YearMonth,uniID:OnlyID,name:UserName,userbrandtitle:UserBrandTitle,calculatemonth:CalculateMonth,overworktime:OverWorkTime,lateworktime:LateWorkTime,extrabonus:ExtraBonus,specialbonus:SpecialBonus,totalmonthsalaty:TotalMonthSalaty},function(err,result){
     if(err)return console.log(err);
  });
}

// 新增單店公告
exports.AddManageNews = function(News,NewsTitle,IsImportant,Name,Brand,Place)
{
  var Work_Year = moment().format('YYYY');
  var Work_Month = moment().format('MM');
  var Work_Day = moment().format('DD');
  var Time = Work_Year+'/'+Work_Month+'/'+Work_Day;
  dbwork.collection('managenews').save({TID:Date.now(),news:News,newstitle:NewsTitle,isimportant:IsImportant,name:Name,publishtime:Time,userbrandname:Brand,userbrandplace:Place},function(err,result){
     if(err)return console.log(err);
  });
}

// 用來新增每個人的 unitoken、deviceID、上下班狀態、
exports.AddUserTokenRelatedInformationFunction = function(OnlyId,DeviceID,UserToken,UserName,WorkStatus)
{
  dbtoken.collection('usertokenrelatedinformationcollection').save({uniID:OnlyId,deviceid:DeviceID,usertoken:UserToken,name:UserName,status:WorkStatus},function(err,result){
    if(err)return console.log(err);
  });
}

// 用來新增每個人的帳號和密碼和產生唯一碼
exports.AddMemberInformationFunction = function(UserName,Account,PassWord)
{
  dbtoken.collection('memberinformationcollection').save({uniID:Date.now(),name:UserName,account:Account,password:PassWord},function(err,result){
    if(err)return console.log(err);
  });
}

// 用來新增每個人的店務名稱、品牌、地點
exports.AddMemberBrandInformation = function(UniID,UserName,UserBrandtitle,UserBrandname,UserBrandplace,UserMonthSalary,UserFoodSalary,UserWithoutSalary,UserTitleSalary,UserExtraSalary,UserLawSalary,UserFirstArrival)
{
  dbtoken.collection('memberbrandinformation').save({uniID:UniID,name:UserName,userbrandtitle:UserBrandtitle,userbrandname:UserBrandname,userbrandplace:UserBrandplace,usermonthsalary:UserMonthSalary,userFoodsalary:UserFoodSalary,userwithoutsalary:UserWithoutSalary,usertitlesalary:UserTitleSalary,userextrasalary:UserExtraSalary,userlawsalary:UserLawSalary,userfirstarrival:UserFirstArrival},function(err,result){
    if(err)return console.log(err);
  });
}

// 若是要使用uniID當作查詢索引，需要透過 parseInt 來把變數變成int
exports.GetUniIDAndUseItAsQueryParameter = function(UniID)
{
      console.log( 'GetUniIDAndUseItAsQueryParameter->UniID = ',UniID);
      return new Promise(function(resolve,reject)
      {
          var collection = dbtoken.collection('memberbrandinformation');
          collection.findOne({ uniID:UniID}, function(err, data ) 
          {
              if (err) { 
                  reject(err);
              } else {
                  resolve(data);
              }
          });
      }); 
}

exports.PromiseGetMonthSalaryOrHourSalary = function(UniID)
{
      console.log( 'PromiseGetMonthSalaryOrHourSalary->PromiseUniID new= ',UniID);
      return new Promise(function(resolve,reject)
      {
          var collection = dbtoken.collection('memberbrandinformation');
          collection.findOne({uniID:UniID}, function(err, data ) 
          {
              if (err) { 
                  reject(err);
              } else {
                  resolve(data);
              }
          });
      }); 
}

exports.PromiseGetBrandInfo = function(Name)
{
      console.log( 'PromiseGetBrandInfo->Name = ',Name);
      return new Promise(function(resolve,reject)
      {
          var collection = dbtoken.collection('memberbrandinformation');
          collection.findOne({name:Name}, function(err, data ) 
          {
              if (err) { 
                  reject(err);
              } else {
                  resolve(data);
              }
          });
      }); 
}

exports.GetManageNewsAPI = function(_UserBrandName,_UserBrandPlace)
{
      return new Promise(function(resolve,reject)
      {
          dbwork.collection('managenews').find({'userbrandname':_UserBrandName,'userbrandplace':_UserBrandPlace},{_id:0,TID:0,userbrandname:0,userbrandplace:0}).toArray(function(err, results) {
              if (err) { 
                  reject(err);
              } else {
                  resolve(results);
              }
          });
      });     
}