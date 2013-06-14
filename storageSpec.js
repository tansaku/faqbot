describe("Storage", function() {
  //var storage;

  beforeEach(function() {
    //storage = getStorage(new TransientStorage());
  });

  afterEach(function() {

  });

  

  it("should be able to get a non null storage", function() {
    var storage = getStorage(new TransientStorage());
    expect(storage).not.toBeNull();
    expect(storage).toBeDefined();

  });

  it("should be able to get a blank storage", function() {
    var storage = getStorage(new TransientStorage());
    expect(storage).not.toBeNull();
    expect(storage).toBeDefined();
    expect(storage.backend instanceof TransientStorage).toBeTruthy();
    expect(storage.databank).not.toBeNull();
    expect(storage.databank).toBeDefined();
  });

  it("can be cleared", function() {
    var storage = getStorage(new TransientStorage());
    expect(storage).not.toBeNull();
    expect(storage).toBeDefined();
    var object = 'robot';
    var name = 'Robbie';
    storage.storeEntity(object, name);
    var databank = storage.getDatabank();
    var result = $.rdf({databank:databank}).where('_:'+name+' a ?type').select(['type'])[0];
    expect(result.type.value.trim()).toEqual(object);
    storage.clearDatabank();
    var result = $.rdf({databank:databank}).where('_:'+name+' a ?type').select(['type'])[0];
    expect(result).toBeNull();

  });


});
