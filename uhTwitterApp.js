 var tweetBodyText = "needs help. #uhmultimediaHelp @UHMultimedia";

 var express = require('express')
 , routes = require('./routes')
 , http = require('http')
 , path = require('path')
 , twitter = require('ntwitter')
 , url = require('url')
 , socketio = require('socket.io');



 var app = express();

 app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('secretsession'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

 app.configure('development', function(){
  app.use(express.errorHandler());
});



createTwitter = function()
{
  var twit = new twitter({
      consumer_key: '8gBrIpePkV04FhZTxDMGg',
      consumer_secret: 'J6F7rjxtHQbPZbLC8L1j6uZ3K7pT3SguU8SVm3lPar0',
      access_token_key: '363280840-P8zM1laadrBkCicpHLvn7Q1R9BU5atu87yy76pTq',
      access_token_secret: 'xGRgol6UgJRJthG5pQkGvVfRGcDezECfg4bGCS5Vk8s'
  });

return twit
}

twit = createTwitter();
var helpManager =  require('./twitterQueueMgmt');



var searchTerm = "uhmultimediaHelp";

    app.get('/', function(req, res){
      console.log("Entering Single User Example...");


   twit
       .search(searchTerm,{},
       function (err, data) {
           if(err){
               console.log("Verification failed : " + err);
           }
           console.log("Search Data Returned....");
           var tweets = data.statuses;
           var tweet;
           var len = tweets.length;
           var displayTweets = [];
           for  (var i =0 ; i<len; i++){
               tweet = tweets[i];
                parsedTweet = helpManager.addTweet(tweet);
               if (parsedTweet.minsAgo < 300)
               {
                displayTweets.push(parsedTweet);
               }
                 //queueList += "<li>" +  tweet.text +"..."+ tweet.created_at +"</li>"
           }

           var view_data = {
               "tweets" : displayTweets
           };
           //res.locals.script_url = script_url;
           console.log("Exiting Controller.");
           res.render("single", view_data);
       });
 });



var server = app.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});


 var ioQueue = require('./public/socketQueue');
 ioQueue.connectServer(server);



app.post("/postTweet", function(req,res){
    var fname = req.body.firstName;
    var lname = req.body.lastName;


    var tweetUIObj = helpManager.addTweetFromName(fname,lname);
    twit.updateStatus(tweetUIObj.fullString, function(err,data){
        if (err) {
            ioQueue.broadcastError(err);
        }
        else {
            console.log("Tweeted: " + JSON.stringify(data));
            //io.sockets.emit("help",parseData(data) );
        }
    });
    ioQueue.broadcastHelp(tweetUIObj.uiTweet);
    res.send(tweetUIObj.uiTweet);
});