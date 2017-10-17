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

exports.PrintUserTokenData = function()
{
  return new Promise(function(resolve, reject) 
  {
      dbtoken.collection('usertokenrelatedinformationcollection').find().sort({"name": 1}).toArray(function(err, results) {
        if (err){ 
                  reject(err);
        } else {
                  resolve(results);
        }
      });
  });
}