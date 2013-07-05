describe("Storage", function() {
  var storage;

  beforeEach(function() {
    storage = getStorage(new TransientStorage());
  });

  afterEach(function() {

  });

  

  it("should be able to get a non null storage", function() {
    expect(storage).not.toBeNull();
    expect(storage).toBeDefined();

  });

  it("should be able to get a blank storage", function() {
    expect(storage).not.toBeNull();
    expect(storage).toBeDefined();
    expect(storage.backend instanceof TransientStorage).toBeTruthy();
    expect(storage.databank).not.toBeNull();
    expect(storage.databank).toBeDefined();
  });

  it("should be able to store properties relations", function() {
    var object = 'Unreal Engine';
    var relation = 'website';
    var name = 'http://unrealengine.com';
    var real_name = "Unreal_Engine";
    storage.storeProperty(object, relation, name);
    var result = storage.queryProperty(object, relation);
    expect(result.value).toEqual(name);
  });


  it("should be able to retrieve all properties", function() {
    var data = [ { name: 'http://unrealengine.com',
                   relation: 'website' },
                 { name: '3D',
                   relation: 'type' } ];
    var object = 'Unreal Engine';
    var real_name = "Unreal_Engine";
    for (var i in data) {
        storage.storeProperty(object, data[i].relation, data[i].name);
    }

    var result = storage.queryAllProperties(object);
    expect(result instanceof Array).toBeTruthy();
    expect(result.length).toEqual(2);

    for (var i in data) {
      expect(result).toContain(data[i]);
    }
  });

  it("should be able to query databank for propertiesand fail properly", function() {
    // TODO should add something to refresh databank between each test
    var object = 'flower';
    var name = 'Bert';  
    var relation = 'colour';
    var result = storage.queryProperty(name,relation);
    expect(result).toEqual(undefined);
  });


  it("should be able to store named entities", function() {
    var object = 'robot';
    var name = 'Robbie';
    storage.storeEntity(object, name);
    var result = storage.queryEntity(name);
    expect(result.type).toEqual(object);
  });

  it("should be able to query databank", function() {
    var object = 'robot';
    var name = 'Robbie';  
    storage.storeEntity(object, name);
    var result = storage.queryEntity(name);
    expect(result.type).toEqual(object);
  })

  it("should be able to query databank and fail properly", function() {
    // TODO should add something to refresh databank between each test
    var object = 'flower';
    var name = 'Bert';  
    var result = storage.queryEntity(name);
    expect(result).toEqual(undefined);
  })

  it("can be cleared", function() {
    var storage = getStorage(new TransientStorage());
    expect(storage).not.toBeNull();
    expect(storage).toBeDefined();
    var object = 'robot';
    var name = 'Robbie';
    storage.storeEntity(object, name);
    var result = storage.queryEntity(name);
    expect(result.type).toEqual(object);
    storage.clearDatabank();
    var result = storage.queryEntity(name);
    expect(result).toBeUndefined();

  });


});
