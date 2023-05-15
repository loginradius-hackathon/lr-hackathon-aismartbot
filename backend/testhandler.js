let handler=require('./index')

handler.handler( {"message":"Aggregation based on gender","realtime":false,"appname":"dev-sso"}, //event
    {}, //content
    function(data,ss) {  //callback function with two arguments 
        console.log(data);
    });