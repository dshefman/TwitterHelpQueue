var socketQueue = function (){
    var io;
    var clientSocket;

    var CONNECT = "connect";
    var HELP = "help";

    var connect = function(server)
    {
       io = require('socket.io').listen(server);

        io.sockets.on('connection', function(socket) {
            console.log('Connected to the server');
            io.sockets.emit(CONNECT);
            socket.on('disconnect', function () {
                console.log('User disconnected');
            });
        });
    }



    var broadcastHelp = function(uiTweet){
        log("debug tweeet > " + uiTweet)
        io.sockets.emit("help", uiTweet);
    }

    var broadcastError = function(error, helpManager){
       log("ERROR > " + err)
       uiTweet = helpManager.addTweet("Error " + JSON.stringify(error));
       broadcastHelp(uiTweet);
    }

    var connectRemote = function(localIO, hostname){
          clientSocket = localIO.connect(hostname,{
              'reconnect': true,
              'reconnection delay': 500,
              'max reconnection attempts': 10
          });
        return clientSocket;
    }

    var onConnect = function(){
          clientSocket.on(CONNECT,function() {
              console.log('Client has connected to the server!');
          });
    }

    var uiList;
    var onHelp = function(uiList){
        this.uiList = uiList;
        var self = this;
        clientSocket.on(HELP, function(msg){
            self.uiList.prepend("<li>" + msg.text +"... " + msg.dateF +" </li>");
        });
    }

    var log = function(msg){
        console.log(msg);
    }

    return {
          connectServer: connect,
          broadcastHelp: broadcastHelp,
          broadcastError: broadcastError,

          connectClient: connectRemote,
          onConnect: onConnect,
          onHelp: onHelp
    } ;
}

try
{
    module.exports = new socketQueue();
}
catch (e)
{
    //Not running in node. Could be testing
}