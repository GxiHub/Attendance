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
	dbtest.collection('thinginstock').findOneAndUpdate({productnumber:_StockTag},{
	    $set: 
	    {
	      status: '出庫'
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
    var now = new Date();
   	dbtest.collection('thinginstock').save({TID:Date.now(),brandname:_BrandName,productnumber:_StockTag,product:_ProductName,tag:_Tag,class:_Class,subclass:_SubClass,grade:_Grade,status:'在庫',instocktime:date.format(now,'YYYY/MM/DD')},function(err,result){
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
      dbtest.collection('thinginstock').find().toArray(function(err, results) {       
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