$(document).ready(function () {
    // get the object we'll use for persistent storage
    var storage = getStorage();

    // We'll use the FOAF vocabularly to represent people
    // http://en.wikipedia.org/wiki/FOAF_%28software%29

    // TEMP
    // couple of tests to see if storage and RDF is working
    // add some people to the databank
    storage.getDatabank()
        .add('_:sam a foaf:Person .')
        .add('_:sam foaf:name "Sam Joseph" .')
        .add('_:dave a foaf:Person .')
        .add('_:dave foaf:name "Dave Snowdon" .');

    // run a query to find people and their names
    var options = { }
    options.databank = storage.getDatabank();
    $.rdf(options)
        .where('?person a foaf:Person')
        .where('?person foaf:name ?name')
        .each(function() {
            updateHistory('Found person: ' + this.name.value+"<br/>");
         });
    // END TEMP

    function query(sentence) {
        // check for sentence word by word in list (hashtable)
        var words = sentence.split(" ");
        var lookup = "";
        var prepend = "";
        
        // things to do here
        // 1. grab first response from google on query on what user said
        // --- need way to grab URL of request from Google
        // 2. process assertions, e.g. 'there is a course called Mobile Design & Programming'
        // --- that relies on some form of regex and also persistence
        // 3. process queries, e.g. what is the start date of Mobile Design & Programming
        // --- want to be able to check for bigrams/trigrams having removed stopwords
        // 4. want to log transcript to some persistence store
        // 5. could add eliza/twss code?
        
        // Using named capture and flag x (free-spacing and line comments)
        var assert = XRegExp('(?<assert>  (T|t)here(\\si|\')s\\sa ) \\s?  # assert  \n' +
                             '(?<object> [^\\s]* ) \\s?  # object \n' +
                             '(?<called> called ) \\s?  # called \n' +
                             '(?<name>   .* )     # name     ', 'x');
        // so perhaps we could just create a json structure to reflect the assertion ...
        // I guess ultimately we really want that flexible parse structure to handle
        // a) Mobile is a new course
        // b) I heard that there's a new course called Mobile
        // c) Have you signed up for that new Mobile course?
        var match = XRegExp.exec(sentence, assert)
        // want to check is match is undefined or not ...
        var response = "OK";
        if(match !== null)
            response = match.name + ' is a ' +match.object;
        return response;
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
