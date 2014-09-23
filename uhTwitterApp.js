var searchTerm = "uhmultimediaHelp";
var beenHelped = "uhmultimediaBeenHelped"


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


var twitterCredentials = require("./twitterAPICredentials");
var twitterAPICredentials = {
    consumer_key: twitterCredentials.CONSUMER_KEY,
    consumer_secret: twitterCredentials.CONSUMER_SECRET,
    access_token_key: twitterCredentials.ACCESS_TOKEN_KEY,
    access_token_secret: twitterCredentials.ACCESS_TOKEN_SECRET
};
var twit = new twitter(twitterAPICredentials);

var helpManager =  require('./twitterQueueMgmt');


app.get('/', function(req, res){
   //When app starts, do a twitter search to populate the list
   twit
       .search(searchTerm,{},
       function (err, data) {
           if(err){
               console.log("Verification failed : " + err);
               res.render("single",{tweets:[helpManager.addTweet("Error " + JSON.stringify(err))]}); //Render blank
           }
           var tweets = data.statuses;
           var parsedTweets = helpManager.addTweets(tweets);

           var view_data = {
               "tweets" : parsedTweets
           };
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
            ioQueue.broadcastError(err,helpManager);
        }
        else {
            console.log("Tweeted: " + JSON.stringify(data));
            //Search again after status update, to see if there are any updates from Twitter outside of app
            twit
                .search(searchTerm,{},
                function (err, data) {
                    if(err){
                        return; //Don't refresh if it doesn't happen here
                    }
                    var tweets = data.statuses;
                    var parsedTweets = helpManager.addTweets(tweets);
                    parsedTweets.unshift(tweetUIObj.uiTweet); // The current object doesn't get added to the search results immediately, so we force it in here
                    ioQueue.broadcastRefresh(parsedTweets)
                });
        }
    });
    //Broadcast immediately, then refresh once the tweet gets processed
    ioQueue.broadcastHelp(tweetUIObj.uiTweet);
    res.send(tweetUIObj.uiTweet);
});

app.post("/postBeenHelped", function(req,res){
    var expert = req.body.expertName;
    var novice = req.body.noviceName;


    var tweetUIObj = helpManager.addTweetHelped(expert,novice);
    twit.updateStatus(tweetUIObj.fullString, function(err,data){
        if (err) {
            ioQueue.broadcastError(err,helpManager);
        }
        else {
            console.log("Tweeted: " + JSON.stringify(data));
            //Search again after status update, to see if there are any updates from Twitter outside of app
            twit
                .search(beenHelped,{},
                function (err, data) {
                    if(err){
                        return; //Don't refresh if it doesn't happen here
                    }
                    var tweets = data.statuses;
                    var parsedTweets = helpManager.addHelpedTweets(tweets);
                    parsedTweets.unshift(tweetUIObj.uiTweet); // The current object doesn't get added to the search results immediately, so we force it in here
                    ioQueue.broadcastRefreshBeenHelped(parsedTweets)
                });
        }
    });
    //Broadcast immediately, then refresh once the tweet gets processed
    ioQueue.broadcastBeenHelped(tweetUIObj.uiTweet);
    res.send(tweetUIObj.uiTweet);
});