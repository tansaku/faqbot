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
        updateHistory(sentence + "<br/>");
        updateHistory(query(sentence) + "<br/>");
         
        return false;
    }
    
    $("form#chat").submit(function () {
        return handleChat($("input#sentence").val());
    });
});