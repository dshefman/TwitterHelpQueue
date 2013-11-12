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

  var parseData = function(tweet){

      var endidx = tweet.text.indexOf(tweetBodyText);
      var coreTweet = tweet.text;
      var minsAgo = calculateMinutesAgo(tweet);
      var dateF = formatTweetDate(tweet);
      if (endidx != -1) {
          coreTweet = tweet.text.substring(0,endidx);
      }
      console.log(tweet.text +" >>> " + dateF );
      return {text:coreTweet, dateF:dateF, minsAgo:minsAgo}
  };

 var calculateMinutesAgo = function(tweet)
 {
     var now = new Date();
     var tweetTime = new Date(tweet.created_at);
     var minsAgo = Math.round((now.getTime() - tweetTime.getTime()) / 1000 / 60);
     return minsAgo;
 }

 var formatTweetDate = function (tweet){
     /*
        Convert the tweet time which 24 hour GMT to 12 hour local  as 07:05 pm
      */
     var currentTimezoneOffset = -5;
     var tweetTime = new Date(tweet.created_at);
     var hour24 = tweetTime.getHours();
     /* Given that I teach an evening class and I'm -5 timeszones away
        a tweet after midnight (0) GMT, should really be +24 so that the math ends up correct
      */
     hour24 = hour24+currentTimezoneOffset;
     if (hour24 <=0) {hour24+=24;}
     var hour = (hour24 > 12) ? hour24-12: hour24;
     if (hour <10) {hour = "0" + hour;}
     var ampm = (hour24 < 12) ? "am" : "pm";
     var min = (tweetTime.getMinutes() <10 )? "0" + tweetTime.getMinutes() : tweetTime.getMinutes();
     var dateF = hour +":"+ min + " " + ampm;
     return dateF;
 }

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
           //res.locals.script_url = script_url;
           console.log("Exiting Controller.");
           res.render("single", view_data);
       });
 });



var server = app.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});


var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket) {
    console.log('Connected to the server');
    io.sockets.emit('connect');
    socket.on('help', function(msg)
    {
        io.sockets.emit('message', msg);
    })
    socket.on('disconnect', function () {
        console.log('User disconnected');
    });
});



app.post("/postTweet", function(req,res){
    var tweet = "";
    tweet += req.body.firstName + " ";
    tweet += req.body.lastName + " ";
    tweet += tweetBodyText;

    var uniqueifer = new Date().getTime();
    tweet += uniqueifer;

    var parsedTweet = parseData({text:tweet, created_at: new Date()})
    twit.updateStatus(tweet, function(err,data){
        if (err) {
            console.log("Error:" + err);
            io.sockets.emit("help", parseData({text:JSON.stringify(err), created_at: new Date()}));
        }
        else {
            console.log("Tweeted: " + JSON.stringify(data));
            //io.sockets.emit("help",parseData(data) );
        }
    });
    io.sockets.emit("help",parsedTweet );
    console.log("debug tweet: " +tweet);
    res.send(parsedTweet);
});