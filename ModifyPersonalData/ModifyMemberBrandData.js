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

// #年月 #店名 #查詢 #加班資訊
exports.ShowMemberBrandData = function()
{
    return new Promise(function(resolve, reject) 
    {
		    dbtoken.collection('memberbrandinformation').find().toArray(function(err, results) {
				if (err) { 
		              reject(err);
		        } else {
		              resolve(results);
		        }		          
		    });
    });
}

exports.UpdateDataBrandData = function(_uniID,_Name,_Updatechoose,_Content)
{
  console.log('_uniID =',_uniID);console.log('_Name =',_Name);console.log('_Updatechoose =',_Updatechoose);console.log('_Content =',_Content);
  if(_Content ==''){
    console.log('Dont do nothing ');
  }else if(_Updatechoose == '員工職稱'){
      UpdateUserBrandTitle(_uniID,_Name,_Content);
  }else if(_Updatechoose == '品牌名稱'){
      UpdateUserBrandName(_uniID,_Name,_Content);
  }else if(_Updatechoose == '工作地點'){
      UpdateUserBrandPlace(_uniID,_Name,_Content);
  }else if(_Updatechoose == '基本月薪'){
      UpdateUserMonthSalary(_uniID,_Name,_Content);
  }else if(_Updatechoose == '伙食獎金'){
      UpdateUserFoodSalary(_uniID,_Name,_Content);
  }else if(_Updatechoose == '全勤獎金'){
      UpdateUserWithoutSalary(_uniID,_Name,_Content);
  }else if(_Updatechoose == '職稱獎金'){
      UpdateUserTitleSalary(_uniID,_Name,_Content);
  }else if(_Updatechoose == '額外獎金'){
      UpdateUserExtraSalary(_uniID,_Name,_Content);
  }else if(_Updatechoose == '勞健保'){
      UpdateUserLawSalary(_uniID,_Name,_Content);
  }

}

function UpdateUserLawSalary(_uniID,_Name,_Content){
  dbtoken.collection('memberbrandinformation').findOneAndUpdate({uniID:_uniID,name:_Name},{
    $set: 
    {
      userlawsalary:_Content
    }
  },{
      upsert: true
  },(err, result) => {
    if (err) return res.send(err)
  });
}

function UpdateUserExtraSalary(_uniID,_Name,_Content){
  dbtoken.collection('memberbrandinformation').findOneAndUpdate({uniID:_uniID,name:_Name},{
    $set: 
    {
      userextrasalary:_Content
    }
  },{
      upsert: true
  },(err, result) => {
    if (err) return res.send(err)
  });
}

function UpdateUserTitleSalary(_uniID,_Name,_Content){
  dbtoken.collection('memberbrandinformation').findOneAndUpdate({uniID:_uniID,name:_Name},{
    $set: 
    {
      usertitlesalary:_Content
    }
  },{
      upsert: true
  },(err, result) => {
    if (err) return res.send(err)
  });
}

function UpdateUserWithoutSalary(_uniID,_Name,_Content){
  dbtoken.collection('memberbrandinformation').findOneAndUpdate({uniID:_uniID,name:_Name},{
    $set: 
    {
      userwithoutsalary:_Content
    }
  },{
      upsert: true
  },(err, result) => {
    if (err) return res.send(err)
  });
}

function UpdateUserFoodSalary(_uniID,_Name,_Content){
  dbtoken.collection('memberbrandinformation').findOneAndUpdate({uniID:_uniID,name:_Name},{
    $set: 
    {
      userfoodsalary:_Content
    }
  },{
      upsert: true
  },(err, result) => {
    if (err) return res.send(err)
  });
}

function UpdateUserMonthSalary(_uniID,_Name,_Content){
  dbtoken.collection('memberbrandinformation').findOneAndUpdate({uniID:_uniID,name:_Name},{
    $set: 
    {
      usermonthsalary:_Content
    }
  },{
      upsert: true
  },(err, result) => {
    if (err) return res.send(err)
  });
}

function UpdateUserBrandPlace(_uniID,_Name,_Content){
  dbtoken.collection('memberbrandinformation').findOneAndUpdate({uniID:_uniID,name:_Name},{
    $set: 
    {
      userbrandplace:_Content
    }
  },{
      upsert: true
  },(err, result) => {
    if (err) return res.send(err)
  });
}

function UpdateUserBrandName(_uniID,_Name,_Content){
  dbtoken.collection('memberbrandinformation').findOneAndUpdate({uniID:_uniID,name:_Name},{
    $set: 
    {
      userbrandname:_Content
    }
  },{
      upsert: true
  },(err, result) => {
    if (err) return res.send(err)
  });
}

function UpdateUserBrandTitle(_uniID,_Name,_Content){
  dbtoken.collection('memberbrandinformation').findOneAndUpdate({uniID:_uniID,name:_Name},{
    $set: 
    {
      userbrandtitle:_Content
    }
  },{
      upsert: true
  },(err, result) => {
    if (err) return res.send(err)
  });
}