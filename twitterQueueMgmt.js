var twitterQueueMgmt = function() {
    var queue = [];
    var currentTimezoneOffset = -5;
    var treatNegativeHoursAsNextDay = true;
    var tweetExpirationDurationInMinutes = 300;

    var tweetBodyText = " needs help. #uhmultimediaHelp @UHMultimedia";

    var parseData = function(tweetObj){

        var coreText = tweetObj.text;
        var endIdx = coreText.indexOf(tweetBodyText);
        var isSystemGeneratedTweet = endIdx != -1;
        if (isSystemGeneratedTweet) {
            coreText = coreText.substring(0,endIdx);
        }
        else {
           coreText = parseRealTweet(tweetObj);
        }
        var rtn = {text:coreText,
            dateF: formatTweetDate(tweetObj.created_at),
            minsAgo:calculateMinutesAgo(tweetObj.created_at)};

        //log(rtn.dateF + " >>> " + rtn.text);

        return rtn;
    };

    var parseRealTweet = function(tweetObj){
        var rtn = "";
        if (tweetObj.hasOwnProperty("user")){
            rtn += tweetObj.user.name + " >> ";
        }
        rtn += tweetObj.text;
        return rtn;
    };

    var formatTweetDate = function (created_at){
        /*
         Convert the tweet time which 24 hour GMT to 12 hour local  as 07:05 pm
         */
        var tweetTime = new Date(created_at);
        var hour24 = tweetTime.getHours();
        /* Given that I teach an evening class and I'm -5 timeszones away
         a tweet after midnight (0) GMT, should really be +24 so that the math ends up correct
         */
        hour24 = hour24 + currentTimezoneOffset;
        if (hour24 <=0 && treatNegativeHoursAsNextDay) {hour24+=24;}
        var hour = (hour24 > 12) ? hour24-12: hour24;
        if (hour <10) {hour = "0" + hour;}
        var ampm = (hour24 < 12) ? "am" : "pm";
        var min = (tweetTime.getMinutes() <10 )? "0" + tweetTime.getMinutes() : tweetTime.getMinutes();
        var dateF = hour +":"+ min + " " + ampm;
        return dateF;
    };

    var calculateMinutesAgo = function(created_at)
    {
        var now = new Date();
        var tweetTime = new Date(created_at);
        var minsAgo = Math.round((now.getTime() - tweetTime.getTime()) / 1000 / 60);
        return minsAgo;
    };

    var addTweet = function(tweet)
    {
        var tweetObj = tweet;
        if (typeof tweet == "string"){
           tweetObj = {text:tweet, created_at: new Date()}
        }
        var rtn = parseData(tweetObj);
        if (rtn.minsAgo <= tweetExpirationDurationInMinutes)
        {
            queue.push(rtn);
        }
        //log("addTweet:>" + JSON.stringify(rtn) +"<")
        return rtn
    };

    var addTweets = function(tweets){
        resetQueue();
        var len = tweets.length;
        var tweet;
        for  (var i =0 ; i<len; i++){
            tweet = tweets[i];
            addTweet(tweet);
        }
        return queue;
    };

    var resetQueue = function(){
        queue = [];
    };

    var addTweetFromName = function (firstName,lastName){
        var tweet = "";
        tweet += firstName + " ";
        tweet += lastName ;
        tweet += tweetBodyText;

        var uniqueifer = new Date().getTime();
        tweet += " ~" +uniqueifer;

        return {fullString:tweet,
                uiTweet: addTweet(tweet)};

    };

    var setCurrentTimezoneFromGMT = function(val){
        currentTimezoneOffset = val;
    };

    var setTweetExpirationInMinutes = function(val){
        tweetExpirationDurationInMinutes = val;
    };

    var log = function(msg){
        console.log(msg);
    };

    return {
        queue: queue,
        addTweet:addTweet,
        addTweets:addTweets,
        addTweetFromName:addTweetFromName,
        setTimezoneOffset:setCurrentTimezoneFromGMT,
        setMinutesToTweetExpiration: setTweetExpirationInMinutes
    };
};

try
{
    module.exports = new twitterQueueMgmt();
}
catch (e)
{
    //Not running in node. Could be testing
}