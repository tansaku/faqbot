 // get the object we'll use for persistent storage
var storage = getStorage();

initStorage(storage);

function query(storage, sentence) {
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


    // so perhaps we could just create a json structure to reflect the assertion ...
    // I guess ultimately we really want that flexible parse structure to handle
    // a) Mobile is a new course
    // b) I heard that there's a new course called Mobile
    // c) Have you signed up for that new Mobile course?
    var match = matchEntityAssertionRegex(sentence);
    // want to check is match is undefined or not ...
    var response = "OK";

    if(match !== null){
        response = match.name + ' is a ' +match.object;
        
        /* bit ugly using the name as identifier, might be better
           to use something like a GUID to represent new entities
           and name them using a separate foaf:name triple. However, then
           we'd need a way to recognise existing entities.
        */
        storage.storeEntity(match.object,match.name)

        // _:John a "person" ; foaf:name "John"    
        // _:John _:favourite_colour "blue" ; foaf:name "blue"    
        // _:favourite_color type_of_relation "between people"  ????  

        // "John" a "person" ???
        // foaf:name
        // foaf:type ?

    }
    else {
      var properties_match = matchPropertiesRegex(sentence);

      if( properties_match !== null){
         storage.storeProperty(properties_match.object, properties_match.relation, properties_match.name);
        return "The " + properties_match.relation +" for " + properties_match.object + " is " + properties_match.name;
      }
      else{
        response = handleQuestion(storage,sentence);
      }
        
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

function matchEntityAssertionRegex(sentence) {
    // Using named capture and flag x (free-spacing and line comments)
    var assert = XRegExp('(?<assert>  (T|t)here(\\si|\')s\\sa ) \\s?  # assert  \n' +
                         '(?<object> .* ) \\s  # object \n' +
                         '(?<called> called ) \\s?  # called \n' +
                         '(?<name>   .* )     # name     ', 'x');
    return XRegExp.exec(sentence, assert);  
}

function matchPropertiesRegex(sentence){
  //Unreal Engine has a website http://unrealengine.com  ---> _:Unreal_Engine has_a_website http://unrealengine.com
  //Unreal Engine's website is http://unrealengine.com
  var assert = XRegExp('(?<object> .+ ) \\s  # object \n' +
                     '(?<has_a> has\\sa ) \\s  # has_a \n' +
                     '(?<relation> .+ ) \\s  # relation \n' +
                     '(?<name>   .+ )     # name     ', 'x');
  return XRegExp.exec(sentence, assert);
}

// TODO add this to String itself e.g. String.prototype.removeStopWords = function()
function removePunctuation(sentence){
    return sentence.replace(/[^\w\s]/g,'');
}

function getPossibleEntities(sentence){
    sentence = removePunctuation(sentence); // could get this function in String itself
    var words = sentence.removeStopWords().split(' ');
    var bigrams = natural.NGrams.bigrams(words);
    for(var i in bigrams){  // e.g. "Unreal Engine"
      words.push(bigrams[i].join('_'));  // e.g. "Unreal_Engine"
    }
    return words;
}

function handleQuestion(storage, sentence) {
    // now this really needs refactoring!!!
    var response = 'why?';
    var words = getPossibleEntities(sentence);
    var type = '';
    var result = {};
    // TODO return all other relations for that thing, e.g. website etc.
    for(var i in words){
      // _:John a ?type
      result = storage.queryEntity(words[i]);
      if(result !== undefined){
        var obj = words[i].replace('_',' ')
        // to query a specific relation we have to look for all possible relations 
        // and see if any match any of the other words in the sentence
        //storage.queryProperty(name,relation);
        var allProps = storage.queryAllProperties(obj);
        response = "I know that "+obj+" is a " + result.type;
        for (var nr in allProps) {
          var relation = allProps[nr].relation;
          var name = allProps[nr].name;
          if ((result.type != name) && (relation.indexOf("foaf") == -1)) {
            debugger
            if(words.some(function(x){return x === relation})){
              response = "The " + relation + " for " + obj + " is " + name;
              break;
            }else{
              response += " and " + relation + " for " + obj + " is " + name;
            }
          }
        }
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
      showResponse('bot', query(storage, sentence) + "<br/>");
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
          //alert("from local file: " + turtle);
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


