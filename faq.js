$(document).ready(function () {

    function updateHistory(sentence) {
        $("div#history").append(sentence);
    }
    
    function handleChat(sentence) {
        updateHistory("You: " + sentence + "<br/>");
        updateHistory("Bot: " + query(sentence) + "<br/>");
         
        return false;
    }
    
    function storage(){
        var github = new Github({
          token: "OAUTH_TOKEN",
          auth: "oauth"
        });
        var repo = github.getRepo('tansaku','faqbot');
        repo.read('master', 'initial_kb.json', function(err, data) {});
        repo = repo + "new data";
        repo.write('master', 'initial_kb.json', repo, 'new data', function(err) {});
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