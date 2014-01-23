var ioQueue = new socketQueue();
var socket = ioQueue.connectClient(io, window.location.hostname);
var RETURN_KEY=13;


$(document).ready(function(){
    console.log("ready");

    ioQueue.onConnect();
    ioQueue.onHelp($('ol'));

    $("#send").click(function() {
     jQuery.post("/postTweet", {
          'firstName': $('#firstName').val(),
          'lastName' : $('#lastName').val()
         },
          function(data, status){
              $('#firstName').val("firstName");
              $('#lastName').val("lastName");
          })
      });

    $("#firstName").keyup(function(event){
        if(event.keyCode == RETURN_KEY){
            $("#send").click();
        }
    });
    $("#lastName").keyup(function(event){
        if(event.keyCode == RETURN_KEY){
            $("#send").click();
        }
    });
});
