var socket = io.connect(document.location);

$(document).ready(function(){
    console.log("ready");
    $("#send").click(function() {
      console.log("onClick");
     jQuery.post("/postTweet", {
          'firstName': $('#firstName').val(),
          'lastName' : $('#lastName').val()},
          'json').error(function(){
              alert("an error occured");

          }).success(function(){
              console.log("successfully posted");

          })
      });
    socket.on('connect',function() {
        console.log('Client has connected to the server!');
        socket.emit('filters',"uhmultimediaHelp");
        listen();
    });
});

function listen(){
    socket.on('twitter', function (data) {

        console.log('Twitter' + JSON.stringify(data));
        //image_url = '<img src="'+data.user.profile_image_url+'" alt="'+data.user.screen_name+'" />';
        var tweet = data;
        $('ol').prepend("<li>" + tweet.text +"... " + tweet.minsAgo +" mins ago </li>");
    });

}