
var socket = io.connect(window.location.hostname,{
    'reconnect': true,
    'reconnection delay': 500,
    'max reconnection attempts': 10
});

$(document).ready(function(){
    console.log("ready");
    $("#send").click(function() {
      console.log("onClick");
     jQuery.post("/postTweet", {
          'firstName': $('#firstName').val(),
          'lastName' : $('#lastName').val()},
          'json').error(function(err){
              alert("an error occured. " +JSON.stringify(err));

          }).success(function(data){
              console.log("adding Data " + JSON.stringify(data));
              $('ol').prepend("<li>" + tweet.text +"... " + tweet.dateF +" </li>");
              $('firstName').val("");
              $('lastName').val("");
          })
      });
    socket.on('connect',function() {
        console.log('Client has connected to the server!');
        //socket.emit('filters',"uhmultimediaHelp");
        listen();
    });
    socket.on("help", function(msg){
        console.log("adding Data " + JSON.stringify(msg));
        $('ol').prepend("<li>" + msg.text +"... " + msg.dateF +" </li>");
    })
    $("#firstName").keyup(function(event){
        if(event.keyCode == 13){
            $("#send").click();
        }
    });
    $("#lastName").keyup(function(event){
        if(event.keyCode == 13){
            $("#send").click();
        }
    });
});

function listen(){
    socket.on('twitter', function (data) {

        console.log('Twitter' + JSON.stringify(data));
        //image_url = '<img src="'+data.user.profile_image_url+'" alt="'+data.user.screen_name+'" />';
        var tweet = data;
        $('ol').prepend("<li>" + tweet.text +"... " + tweet.dateF +" </li>");
    });

}