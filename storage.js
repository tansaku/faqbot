/*
 * Get the storage object to use
 */
if (typeof(Storage) != "undefined") {
    // Yay, we have HTML5 local storage
    
    // add methods to allow storage of general objects (storing anything
    // other than strings may not work in all browsers)
    Storage.prototype.getObject = function(key) {
        var value = this.getItem(key);
        return value && JSON.parse(value);
    }

    Storage.prototype.setObject = function(key, value) {
        this.setItem(key, JSON.stringify(value));
    }
 }

function getStorage(backend) {
    // Create a databank and add some common prefixes
    var databank = $.rdf.databank()
        .prefix('foaf', 'http://xmlns.com/foaf/0.1/')
        .prefix('dc', 'http://purl.org/dc/elements/1.1/')
        .prefix('dct', 'http://purl.org/dc/terms/')
        .prefix('sam', 'http://linklens.blogspot.com/');    

    if(backend !== undefined) {
        return new ChatbotStorage(databank, backend);
    } else if (typeof(Storage) != "undefined") {
        return new ChatbotStorage(databank, new LocalStorage());
    } else {
        alert("no web storage, using Transient storage");
        return new ChatbotStorage(databank, new TransientStorage());
    }
}

function trim1 (str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function ChatbotStorage(db, backend) {
    this.databank = db;
    this.backend = backend;
    this.clearTranscript();
}

ChatbotStorage.prototype.getDatabank = function() {
    return this.databank;
}

ChatbotStorage.prototype.getTranscript = function() {
    return this.transcript;
}

ChatbotStorage.prototype.getKnowledgeBaseAsText = function() {
    return this.backend.getItem('rdf');
}

ChatbotStorage.prototype.isEmpty = function() {
    return this.backend.getItem('rdf') == undefined;
}

ChatbotStorage.prototype.clearDatabank = function() {
    this.databank = null;
    this.backend.setItem("rdf", null);
}

ChatbotStorage.prototype.storeEntity = function(object,name){
  name = name.replace(' ','_');
  this.getDatabank()
      .add(stringToResource(name) + ' a ' + quote(object))
      .add(stringToResource(name) + ' foaf:name ' + quote(name));
}

ChatbotStorage.prototype.clearTranscript = function() {
    this.transcript = [ ];
}

ChatbotStorage.prototype.addToTranscript = function(who, what) {
    var entry =  { timestamp: new Date(), actor: who, text: what };
    this.transcript.push(entry);
}

ChatbotStorage.prototype.loadKnowledgeBaseFromString = function(turtle) {
    this.databank.load(turtle, { format: 'text/turtle'});
}

ChatbotStorage.prototype.load = function() {
    var turtle = this.getKnowledgeBaseAsText();
    if (turtle !== null) {
        // trim any whitespace
        turtle = trim1(turtle);

        // trim any surrounding double quotes
        if (turtle.substring(0,1) === '"') {
            turtle = turtle.substring(1, turtle.length-2);
        }
        this.databank.load(turtle, { format: 'text/turtle'});
    }

    var ts = this.backend.getObject("transcript");
    if (ts != null) {
        this.transcript = ts;
    }
}

ChatbotStorage.prototype.save = function() {
    var turtle = this.databank.dump({ format: 'text/turtle'});
    this.backend.setItem("rdf", turtle);
    this.backend.setObject("transcript", this.transcript);
}


/*
 * Wrapper class using HTML5 storage. Need this because we can't seem to
 * return localStorage from functions
 */
function LocalStorage() {
}

LocalStorage.prototype.getItem = function(key) {
    return localStorage.getItem(key);
}

LocalStorage.prototype.setItem = function(key, value) {
    localStorage.setItem(key, value)
}

LocalStorage.prototype.getObject = function(key) {
    return localStorage.getObject(key);
}

LocalStorage.prototype.setObject = function(key, value) {
    localStorage.setObject(key, value);
}

/*
 * Fallback class to give us the illusion of storage if HTML5 storage is
 * not available - works until we refresh or leave the page.
 */
function TransientStorage() {
    this.store = new Object();
}

TransientStorage.prototype.getItem = function(key) {
    return this.store[key];
}

TransientStorage.prototype.setItem = function(key, value) {
    this.store[key] = value;
}

TransientStorage.prototype.getObject = function(key) {
    return this.getItem(key);
}

TransientStorage.prototype.setObject = function(key, value) {
    this.setItem(key, value);
}

