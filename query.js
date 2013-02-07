function query(sentence) {
    // check for sentence word by word in list (hashtable)
    var words = sentence.split(" ");
    var lookup = "";
    var prepend = "";
    // seems like persistence is the key step here ...
    // dialogue history to a gist
    // can we check changes to the knowledge base directly into github ...
    // then we would get versioning .... 
    // would be nice to have local stub of that to allow for testing and working when off the grid ...
    // if we stick stuff in a json file in github what happens to our query speed? worry about optimizing that later ...
    // gradually load more and more of that data into the memory of the browser in the background as the human is typing so that 
    // we can do immediate in memory search on the JSON data?
    
    // things to do here
    // 1. grab first response from google on query on what user said
    // --- need way to grab URL of request from Google
    // 2. process assertions, e.g. 'there is a course called Mobile Design & Programming'
    // --- that relies on some form of regex and also persistence
    // 3. process queries, e.g. what is the start date of Mobile Design & Programming
    // --- want to be able to check for bigrams/trigrams having removed stopwords
    // 4. want to log transcript to some persistence store
    // 5. could add eliza/twss code?
    // 6. could add joke of the day code - looks like we can't due to cross-server scripting constraint
    // 7. chuck norris code might work
    
    // Using named capture and flag x (free-spacing and line comments)
    var assert = XRegExp('(?<assert>  (T|t)here(\\si|\')s\\sa ) \\s?  # assert  \n' +
                         '(?<object> .* ) \\s  # object \n' +
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
     console.log("test");
    if(match !== null){
        appendToData(match.object); 
        response = match.name + ' is a ' +match.object;
    }
    else{
         // want to query - can we do stemming?
        response = 'what was that?';
    }
       
    /*
            $.getJSON("http://www.joke-db.com/widgets/src/wp/clean/monkey/123?callback=?",null
              {
        url: 
    }).done(function ( data ) {
        console.log("test");
      if( console && console.log ) {
        console.log("Sample of data:", data);
      }
    }); */
    // $.icndb.getRandomJoke(12) // this was for chuck norris
    return response;
}

data = {};

// we could try for a unit test on this ...
function appendToData(match){
    if(data[match.object] == undefined)
        data[match.object] = [match.name];
    else
        data[match.object].push(match.name);
}