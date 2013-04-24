 // get the object we'll use for persistent storage
var storage = getStorage();

initStorage(storage);

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
        response = match.name + ' is a ' +match.object;
        
        /* bit ugly using the name as identifier, might be better
           to use something like a GUID to represent new entities
           and name them using a separate foaf:name triple. However, then
           we'd need a way to recognise existing entities.
        */
        name = match.name.replace(' ','_');
        storage.getDatabank()
            .add(stringToResource(name) + ' a ' + quote(match.object))
            .add(stringToResource(name) + ' foaf:name ' + quote(name))
    }
    else{
      response = handleQuestion(sentence);
        
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

// TODO add this to String itself e.g. String.prototype.removeStopWords = function()
function removePunctuation(sentence){
    return sentence.replace(/[^\w\s]/g,'');
}

function handleQuestion(sentence) {
       // want to query - can we do stop lists?
    response = 'what was that?';
    var databank = storage.getDatabank();
    sentence = removePunctuation(sentence); // could get this function in String itself
    var words = sentence.removeStopWords().split(' ');

    var bigrams = natural.NGrams.bigrams(words);
    for(var i in bigrams){
      words.push(bigrams[i].join('_'));
    }
    // http://code.google.com/p/rdfquery/wiki/RdfPlugin
    // not sure how to query the rdf store ....

    //$.rdf({databank:databank}).where('?name a ?type').select(['name','type'])
    //$.rdf({databank:databank}).where('?name a ?type').select(['name','type'])
    //debugger
    var type = '';
    var result = {};
    for(var i in words){
      result = $.rdf({databank:databank}).where('_:'+words[i]+' a ?type').select(['type'])[0];
      if(result !== undefined){
        response = "I know that "+words[i].replace('_',' ')+" is a " + result.type.value;
        break;
      }
    }
    return response;
}


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


