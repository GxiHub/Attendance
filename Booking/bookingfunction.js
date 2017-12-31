MongoClient = require('mongodb').MongoClient;

var dbOP;
MongoClient.connect('mongodb://orangepowerdata:mini0306@ds135547.mlab.com:35547/orangepower', function(err, database){ 
  if (err) return console.log(err);
  dbOP = database;
})

var Promise = require('rsvp').Promise;
var uniqid = require('uniqid');

exports.MakeOneBooking = function(_StoreName,_UserPicUrl,_UserID,_UserGender,_UserName,_Phone,_Year,_Month,_Day,_Hour,_Minute,_AdultNumber,_ChildNumber,_Note)
{
  	dbOP.collection('bookingsystem').save({unibookid:uniqid(),storename:_StoreName,userpicurl:_UserPicUrl,userid:_UserID,usergender:_UserGender,
  	 	                                    username:_UserName,phone:_Phone,year:_Year,month:_Month,day:_Day,hour:_Hour,minute:_Minute,
  	 	                                    adultnumber:_AdultNumber,childnumber:_ChildNumber,note:_Note,status:'等待排位'},function(err,result){
     	if(err)return console.log(err);
  	 });
}

exports.CheckBookingStatusByFBID = function(_UserID)
{
      return new Promise(function(resolve, reject) 
      {
		  dbOP.collection('bookingsystem').find({'userid':_UserID}).toArray(function(err, results) {
              if (err) { 
                  reject(err);
              } else {
                  resolve(results);
              }
          });
      });
}

exports.CheckBookingStatusByphone = function(_UserPhone)
{
      return new Promise(function(resolve, reject) 
      {
		  dbOP.collection('bookingsystem').find({'phone':_UserPhone}).toArray(function(err, results) {
              if (err) { 
                  reject(err);
              } else {
                  resolve(results);
              }
          });
      });
}