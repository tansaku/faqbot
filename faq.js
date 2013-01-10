$(document).ready(function () {

    function query(sentence) {
        // check for sentence word by word in list (hashtable)
        var words = sentence.split(" ");
        var lookup = "";
        var prepend = "";
    
        return "OK";
    }
    
    function updateHistory(sentence) {
        $("div#history").append(sentence);
    }
    
    function handleChat(sentence) {
        updateHistory("You: " + sentence + "<br/>");
        updateHistory("Bot: " + query(sentence) + "<br/>");
         
        return false;
    }
    
    $("input#sentence").keypress(function(event) {
    if (event.which == 13) {
        event.preventDefault();
        $("form#chat").submit();
    }
});
    
    $("form#chat").submit(function () {
        return handleChat($("input#sentence").val());
    });
});