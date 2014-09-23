var socketQueue = function (){
    var io;
    var clientSocket;

    var CONNECT = "connect";
    var HELP = "help";
    var REFRESH = "refresh";
    var BEEN_HELPED = "beenHelped";
    var BEEN_HELPED_REFRESH = "refreshBeenHelped"

    var connectServer = function(server)
    {
       io = require('socket.io').listen(server);

        io.sockets.on('connection', function(socket) {
            console.log('Connected to the server');
            io.sockets.emit(CONNECT);
            socket.on('disconnect', function () {
                console.log('User disconnected');
            });
        });
    };



    var broadcastHelp = function(uiTweet){
        log("debug tweet > " + uiTweet);
        io.sockets.emit(HELP, uiTweet);
    };

    var broadcastRefresh = function(uiTweets){
        io.sockets.emit(REFRESH, uiTweets);
    };

    var broadcastBeenHelped = function(uiTweet){
        log("debug tweet > " + uiTweet);
        io.sockets.emit(BEEN_HELPED, uiTweet);
    };

    var broadcastRefreshBeenHelped = function(uiTweets){
        io.sockets.emit(BEEN_HELPED_REFRESH, uiTweets);
    };

    var broadcastError = function(error, helpManager){
       log("ERROR > " + error);
       var uiTweet = helpManager.addTweet("Error " + JSON.stringify(error));
       broadcastHelp(uiTweet);
    };

    var connectClient = function(localIO, hostname){
          clientSocket = localIO.connect(hostname,{
              'reconnect': true,
              'reconnection delay': 500,
              'max reconnection attempts': 10
          });
        return clientSocket;
    };

    var onConnect = function(){
          clientSocket.on(CONNECT,function() {
              console.log('Client has connected to the server!');
          });
    };

    var uiList;
    var onHelp = function(uiList){
        this.uiList = uiList;
        var self = this;
        clientSocket.on(HELP, function(msg){
            self.uiList.prepend(generateListHTML(msg.text, msg.dateF));
        });
    };

    var onRefresh = function(uiList){
        this.uiList = uiList;
        var self = this;
        clientSocket.on(REFRESH, function(msg){
            var html = "";
            var msgList = msg;
            var len = msgList.length;
            for (var i= 0; i< len; i++) {
                //log("onRefresh :" + JSON.stringify(msgList[i]));
                html += generateListHTML(msgList[i].text, msgList[i].dateF);
            }

            self.uiList.html(html);
        });
    };

    var onBeenHelped = function(uiList){
        this.uiList = uiList;
        var self = this;
        clientSocket.on(BEEN_HELPED, function(msg){
            self.uiList.prepend(generateListHTML(msg.text, msg.dateF));
        });
    };

    var onBeenHelpedRefresh = function(uiList){
        this.uiList = uiList;
        var self = this;
        clientSocket.on(BEEN_HELPED_REFRESH, function(msg){
            var html = "";
            var msgList = msg;
            var len = msgList.length;
            for (var i= 0; i< len; i++) {
                //log("onRefresh :" + JSON.stringify(msgList[i]));
                html += generateListHTML(msgList[i].text, msgList[i].dateF);
            }

            self.uiList.html(html);
        });
    };

    var generateListHTML = function(text, dateF)
    {
        return "<li>" + text +"... " + dateF +" </li>"

    };

    var log = function(msg){
        console.log(msg);
    };

    return {
          connectServer: connectServer,
          broadcastHelp: broadcastHelp,
          broadcastError: broadcastError,
          broadcastRefresh: broadcastRefresh,

          broadcastBeenHelped: broadcastBeenHelped,
          broadcastRefreshBeenHelped: broadcastRefreshBeenHelped,

          connectClient: connectClient,
          onConnect: onConnect,
          onHelp: onHelp,
          onRefresh: onRefresh,
          onBeenHelped: onBeenHelped,
          onBeenHelpedRefresh: onBeenHelpedRefresh
    };
};

try
{
    module.exports = new socketQueue();
}
catch (e)
{
    //Not running in node. Could be testing
}