var ioQueue = new socketQueue();
var socket = ioQueue.connectClient(io, window.location.hostname);
var RETURN_KEY=13;


var resetInputs = function(){
    $('#firstName').val("firstName");
    $('#lastName').val("lastName");
};


$(document).ready(function(){
    console.log("ready");

    ioQueue.onConnect();
    var uiList = $('ol');
    ioQueue.onHelp(uiList);
    ioQueue.onRefresh(uiList);

    $("#send").click(function() {
     jQuery.post("/postTweet", {
          'firstName': $('#firstName').val(),
          'lastName' : $('#lastName').val()
         },
         resetInputs)
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
