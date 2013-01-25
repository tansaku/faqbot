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

function getStorage() {
    // Create a databank and add some common prefixes
    var databank = $.rdf.databank()
        .prefix('foaf', 'http://xmlns.com/foaf/0.1/')
        .prefix('dc', 'http://purl.org/dc/elements/1.1/')
        .prefix('dct', 'http://purl.org/dc/terms/');

    if (typeof(Storage) != "undefined") {
        return new ChatbotStorage(databank, new PersistentStorage(databank));
    } else {
        alert("no web storage, using Transient storage");
        return new ChatbotStorage(databank, new TransientStorage(databank));
    }
}

function ChatbotStorage(db, backend) {
    this.databank = db;
    this.backend = backend;
    this.clearTranscript();
}

ChatbotStorage.prototype.getDatabank = function() {
    return this.databank;
}

ChatbotStorage.prototype.isEmpty = function() {
    return this.backend.getObject('rdf') == undefined;
}

ChatbotStorage.prototype.clearTranscript = function() {
    this.transcript = [ ];
}

ChatbotStorage.prototype.addToTranscript = function(who, what) {
    var entry =  { timestamp: new Date(), actor: who, text: what };
    this.transcript.push(entry);
}

ChatbotStorage.prototype.load = function() {
    var triples = this.backend.getObject('rdf');
    this.databank = $.rdf(triples);
    var ts = this.backend.getObject("transcript");
    if (ts !== undefined) {
        this.transcript = ts;
    }
}

ChatbotStorage.prototype.save = function() {
    this.backend.setObject("rdf", this.databank.dump());
    this.backend.setObject("transcript", this.transcript);
}


/*
 * Wrapper class using HTML5 storage. Need this because we can't seem to
 * return localStorage from functions
 */
function PersistentStorage(db) {
    this.databank = db;
}

PersistentStorage.prototype.getItem = function(key) {
    return localStorage.getItem(key);
}

PersistentStorage.prototype.setItem = function(key, value) {
    lcoalStorage.setItem(key, value)
}

PersistentStorage.prototype.getObject = function(key) {
    return localStorage.getObject(key);
}

PersistentStorage.prototype.setObject = function(key, value) {
    localStorage.setObject(key, value);
}

/*
 * Fallback class to give us the illusion of storage if HTML5 storage is
 * not available - works until we refresh or leave the page.
 */
function TransientStorage(db) {
    this.databank = db;
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

