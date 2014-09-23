var ioQueue = new socketQueue();
var socket = ioQueue.connectClient(io, window.location.hostname);
var RETURN_KEY=13;


var resetInputs = function(){
    $('#firstName').val("firstName");
    $('#lastName').val("lastName");
    $('#expertName').val("Helper's full name")
    $('#noviceName').val("Your full name")
};


$(document).ready(function(){
    console.log("ready");

    ioQueue.onConnect();
    var uiList = $('#tweetlist');
    ioQueue.onHelp(uiList);
    ioQueue.onRefresh(uiList);
    var uiBeenHelpedList = $('#helpedList');
    ioQueue.onBeenHelped(uiBeenHelpedList);
    ioQueue.onBeenHelpedRefresh(uiBeenHelpedList);

    $("#send").click(function() {
     jQuery.post("/postTweet", {
          'firstName': $('#firstName').val(),
          'lastName' : $('#lastName').val()
         },
         resetInputs)
      });

    $("#helpedBtn").click(function() {
        jQuery.post("/postBeenHelped", {
                'expertName': $('#expertName').val(),
                'noviceName' : $('#noviceName').val()
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
