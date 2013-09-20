$(document).ready(function(){
    console.log("ready");
    $("#send").click(function() {
      console.log("onClick");
      var req = jQuery.post("/postTweet", {
          'firstName': $('#firstName').val(),
          'lastName' : $('#lastName').val()},
          'json').error(function(){
              alert("an error occured");

          }).success(function(data){
              console.log("redirect to " +data);
              window.location = data;
          })
      })
    });