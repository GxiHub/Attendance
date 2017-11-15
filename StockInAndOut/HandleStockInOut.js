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

exports.CheckStockInOut = function(StockTag,BrandName)
{ 
    console.log('StockTag = ',StockTag);
    CheckProductIsInStockOrNot(StockTag).then(function(items) 
    {
          if(items.length == 0)
          {
          	// 產品不在庫存內，需新增庫存
          	ProductFirstStockIn(StockTag);
          }
          else
          {
            // 產品在庫存內，更新產品到出庫
          	UpdateProductStatus(StockTag);
          }
    }, function(err) {
          console.error('The promise was rejected', err, err.stack);
    }); 
}

exports.DeleteProduct = function(_StockTag)
{
    dbtest.collection('thinginstock').findOneAndDelete({productnumber:_StockTag},
    (err, result) => {
      if (err) return res.send(500, err);
    });
}

function UpdateProductStatus(_StockTag)
{
  var date_taipei = DateTimezone(8);
  var date = date_taipei.toLocaleString();
  var YearMonthDay=date.slice(0,10).split('/');
  var HourMinute=date.slice(11,24).split(':');
  var _outstockdate = YearMonthDay[2]+'/'+YearMonthDay[0]+'/'+YearMonthDay[1];
  var _outstocktime = HourMinute[0]+':'+HourMinute[1]+':'+HourMinute[2];

    console.log(_outstockdate);
    console.log(_outstocktime);
    console.log(date_taipei.toLocaleString());
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

function ProductFirstStockIn(_StockTag)
{
	  var ProductTag = _StockTag[0]+_StockTag[1]+_StockTag[2]+_StockTag[3]+_StockTag[4];
    GetProductPartialInformation(ProductTag).then(function(items) 
    {
          SaveProductToStock(_StockTag,items[0].brandname,items[0].product,items[0].tag,items[0].class,items[0].subclass,items[0].grade);
    }, function(err) {
          console.error('The promise was rejected', err, err.stack);
    });
}

function SaveProductToStock(_StockTag,_BrandName,_ProductName,_Tag,_Class,_SubClass,_Grade)
{
    // console.log(calcTime('taipei' , 8));
    var date_taipei = DateTimezone(8);
    var date = date_taipei.toLocaleString();
    var YearMonthDay=date.slice(0,10).split('/');
    var HourMinute=date.slice(11,24).split(':');
    var _instockdate = YearMonthDay[2]+'/'+YearMonthDay[0]+'/'+YearMonthDay[1];
    var _instocktime = HourMinute[0]+':'+HourMinute[1]+':'+HourMinute[2];

    console.log(_instockdate);
    console.log(_instocktime);
    console.log(date_taipei.toLocaleString());

   	dbtest.collection('thinginstock').save({TID:Date.now(),brandname:_BrandName,productnumber:_StockTag,product:_ProductName,tag:_Tag,class:_Class,subclass:_SubClass,grade:_Grade,status:'入庫',instockdate:_instockdate,instocktime:_instocktime,outstockdate:'',outstocktime:''},function(err,result){
                          if(err)return console.log(err);
    }); 
}

exports.SaveProductPartialTagToStock = function(_BrandName,_ProductName,_Tag,_Class,_SubClass,_Grade)
{
   	dbtest.collection('productpartialtag').save({TID:Date.now(),brandname:_BrandName,product:_ProductName,tag:_Tag,class:_Class,subclass:_SubClass,grade:_Grade},function(err,result){
                          if(err)return console.log(err);
    }); 
}

function GetProductPartialInformation(_ProductTag)
{
    return new Promise(function(resolve, reject) 
    {
      dbtest.collection('productpartialtag').find({tag:_ProductTag}).toArray(function(err, results) {       
         if (err) { 
              reject(err);
         } else {
              resolve(results);
         }

      });
    });	
}

function CheckProductIsInStockOrNot(_ProductTag)
{
    return new Promise(function(resolve, reject) 
    {
      dbtest.collection('thinginstock').find({productnumber:_ProductTag}).toArray(function(err, results) {       
         if (err) { 
              reject(err);
         } else {
              resolve(results);
         }

      });
    });	
}

exports.GetProductListInStock = function(StockTag,BrandName)
{ 
    return new Promise(function(resolve, reject) 
    {
      dbtest.collection('thinginstock').find().sort({"class": 1,"subclass": 1,"tag": 1,"productnumber": 1}).toArray(function(err, results) {       
         if (err) { 
              reject(err);
         } else {
              resolve(results);
         }

      });
    });	
}

exports.GetProductPartialTag = function()
{ 
    return new Promise(function(resolve, reject) 
    {
      dbtest.collection('productpartialtag').find().toArray(function(err, results) {       
         if (err) { 
              reject(err);
         } else {
              resolve(results);
         }

      });
    });	
}

// 新增當地時區的時間物件
function DateTimezone(offset) {
    // 建立現在時間的物件
    d = new Date();
    // 取得 UTC time
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    // 新增不同時區的日期資料
    return new Date(utc + (3600000*offset));
}

// 計算當地時區的時間
function calcTime(city, offset) {
    // 建立現在時間的物件
    d = new Date();
    // 取得 UTC time
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    // 新增不同時區的日期資料
    nd = new Date(utc + (3600000*offset));
    // 顯示當地時間
    return "在 " + city + " 的本地時間是 " + nd.toLocaleString();
}
