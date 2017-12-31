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
	  console.log(_UserID);
	  var Response = [];
      return new Promise(function(resolve, reject) 
      {
		  dbOP.collection('bookingsystem').find({'userid':_UserID}).toArray(function(err, results) {
		      for( var i = 0; i<results.length; i++ ) {
		          Response = Response + " .您訂位號 ["+results[i].unibookid+' '+results[i].year+"/"+results[i].month+"/"+results[i].day+" "+results[i].adultnumber+"大"+results[i].childnumber+"小 ] 的網路訂位狀態  = "+results[i].status;
		      }
		      console.log(Response);
              if (err) { 
                  reject(err);
              } else {
                  resolve(Response);
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