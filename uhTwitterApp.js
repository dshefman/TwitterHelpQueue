
/**
 * Module dependencies.
 Added
 1. ntwitter - package for using Twitter API
 2. url - used to parse out different parts of URLs
 */

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

  /**
   * Above this line are Express Defaults.
   */
  var twit = new twitter({
      consumer_key: '8gBrIpePkV04FhZTxDMGg',
      consumer_secret: 'J6F7rjxtHQbPZbLC8L1j6uZ3K7pT3SguU8SVm3lPar0',
      access_token_key: '363280840-P8zM1laadrBkCicpHLvn7Q1R9BU5atu87yy76pTq',
      access_token_secret: 'xGRgol6UgJRJthG5pQkGvVfRGcDezECfg4bGCS5Vk8s'
  });

  /**
    * This demonstrates a use case where the Application itself is making all of the API calls on its
    * own behalf.
    */
  var parseData = function(tweet){
      var now = new Date();
      var tweetTime = new Date(tweet.created_at);
      var minsAgo = Math.round((now.getTime() - tweetTime.getTime()) / 1000 / 60);
      var hour24 = tweetTime.getHours();
      var currentTimezoneOffset = -5;
      hour24 = hour24+currentTimezoneOffset;
      var hour = (hour24 > 12) ? hour24-12: hour24;
      if (hour <10) {hour = "0" + hour;}
      var ampm = (hour24 < 12) ? "am" : "pm";
      var min = (tweetTime.getMinutes() <10 )? "0" + tweetTime.getMinutes() : tweetTime.getMinutes();
      var dateF = hour +":"+ min + " " + ampm;
      var endidx = tweet.text.indexOf('needs help. #uhmultimediaHelp @UHMultimedia');
      var coreTweet = tweet.text;
      if (endidx != -1) {
          coreTweet = tweet.text.substring(0,endidx);
      }
      console.log(tweet.text +" >>> " + dateF );
      return {text:coreTweet, minsAgo:minsAgo, dateF:dateF}
  };

var searchTerm = "uhmultimediaHelp";

    app.get('/', function(req, res){
      console.log("Entering Single User Example...");

  /* Be sure to include all 4 tokens.
   * Default keys don't work. I am leaving them to make it easier to compare to screenshots found at
   * https://github.com/drouillard/sample-ntwitter
   * NOTE: In a real application do not embedd your keys into the source code
   * TODO: Fill in your Application information here
   */


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
                parsedTweet = parseData(tweet);
               if (parsedTweet.minsAgo < 300)
               {
                displayTweets.push(parseData(tweet));
               }
                 //queueList += "<li>" +  tweet.text +"..."+ tweet.created_at +"</li>"
           }

           var view_data = {
               "tweets" : displayTweets
           };

           console.log("Exiting Controller.");
           res.render("single", view_data);
       });
 });

app.post("/postTweet", function(req,res){
     var tweet = "";
    tweet += req.body.firstName + " ";
    tweet += req.body.lastName + " ";
    tweet += "needs help. ";
    tweet += "#uhmultimediaHelp ";
    tweet += "@UHMultimedia ";

    var uniqueifer = new Date().getTime();
    tweet += uniqueifer;

    twit.updateStatus(tweet, function(err,data){
        if (err) {console.log("Error:" + err); }
        else {console.log("Tweeted: " + JSON.stringify(data));}
    });
    console.log("debug tweet: " +tweet);
    res.contentType('application/json');
    var data = JSON.stringify("/");
    res.header('Content-length',data.length);
    res.end(data);
});

/*http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});*/
var server = app.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});

var io = require('socket.io').listen(server);


//app.listen(8080)

io.sockets.on('connection', function(socket) {
    console.log('Connected to the server');
    socket.on('filters', function(msg){
        console.log('Received message :'+msg);
        twit.stream('statuses/filter', {'track':searchTerm},
            function(stream) {
                stream.on('data',function(data){
                    console.log(">> "+ JSON.stringify(data));
                        if (data.disconnect == null)
                        {
                            socket.emit('twitter',parseData(data))
                        }

                });
            });
    });
    socket.on('disconnect', function () {
        console.log('User disconnected');
    });
});

