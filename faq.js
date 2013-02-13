$(document).ready(function () {
    // get the object we'll use for persistent storage
    var storage = getStorage();

    initStorage(storage);

    showTranscript(storage);

    function updateHistory(who, sentence) {
        var prefix = '';
        if (who == 'bot') {
            prefix = 'Bot: ';
        } else if (who == 'human') {
            prefix = 'You: ';
        }

        var fmt = '<span class="' + who +'">'+prefix+sentence+'</span><br/>';
        $("div#history").append(fmt);
    }
    
    function showResponse(who, what) {
        storage.addToTranscript(who, what);
        updateHistory(who, what);
    }

    /*
     * handle commands to the bot that should not appear in the transcipt or
     * affect the KB.
     */
    function handleCommand(sentence) {
        if (sentence == 'show kb') {
            alert(storage.getKnowledgeBaseAsText());
        } else if (sentence == 'show transcript') {
            alert(storage.getTranscript());
        } else {
            return false; // was not a command
        }
    }

    function handleChat(sentence) {
        if (!handleCommand(sentence)) {
            showResponse('human', sentence + "<br/>");
            showResponse('bot', query(sentence) + "<br/>");
            storage.save();
        }
         
        return false;
    }


     // not functional yet - just Sam playing around with github accesss
     // TODO move this to storage.js    
    function storageGithub(){
        var github = new Github({
          token: "OAUTH_TOKEN",
          auth: "oauth"
        });
        var repo = github.getRepo('tansaku','faqbot');
        repo.read('master', 'initial_kb.json', function(err, data) {});
        repo = repo + "new data";
        repo.write('master', 'initial_kb.json', repo, 'new data', function(err) {});
    }


    // If storage is empty (this is the first time we are called) then
    // add some basic knowledge 
    function initStorage(storage) {
        if (storage.isEmpty()) {
            // load the initial knowledge base from a text file in turtle format
            $.get('initial_kb.txt', function(turtle) {
                storage.loadKnowledgeBaseFromString(turtle);
                alert("from local file: " + turtle);
                storage.save();
            }, 'text');
        } else {
            storage.load();
        }
    } 

    function showTranscript(storage) {
        var transcript = storage.getTranscript();
        if (transcript.length > 0) {
            for (var i=0; i<transcript.length; ++i) {
                // TODO: show timestamps for old chats
                updateHistory(transcript[i].actor, transcript[i].text);
            }
        }
    }

    function stringToResource(s) {
//	return '_:' + s.replace(' ', '_').replace('\'', '').replace.('"','');
	return '_:' + s;
    }

    function quote(s) {
        return '"' + s + '"';
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
