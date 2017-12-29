MongoClient = require('mongodb').MongoClient;

var dbOP;
MongoClient.connect('mongodb://orangepowerdata:mini0306@ds135547.mlab.com:35547/orangepower', function(err, database){ 
  if (err) return console.log(err);
  dbOP = database;
})

var Promise = require('rsvp').Promise;
var uniqid = require('uniqid');

exports.MakeOneBooking = function(_StoreName,_UserPicUrl,_UserID,_UserName,_Phone,_Year,_Month,_Day,_Hour,_Minute,_AdultNumber,_ChildNumber,_Note)
{
  	dbOP.collection('bookingsystem').save({unibookid:uniqid(),storename:_StoreName,userpicurl:_UserPicUrl,
  	 	                                    userid:_UserID,username:_UserName,phone:_Phone,year:_Year,month:_Month,day:_Day,hour:_Hour,
  	 	                                    minute:_Minute,adultnumber:_AdultNumber,childnumber:_ChildNumber,note:_Note,status:'等待排位'},function(err,result){
     	if(err)return console.log(err);
  	 });
}

exports.CheckBookingStatus = function(_UserID)
{
      return new Promise(function(resolve, reject) 
      {
		  dbOP.collection('bookingsystem').find({'userid':parseInt(_UserID,10)}).toArray(function(err, results) {
              if (err) { 
                  reject(err);
              } else {
                  resolve(results);
              }
          });
      });
}