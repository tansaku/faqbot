describe("FaqBot", function() {
  var sentences = [];
  var answers = [];

  it("should respond as expected ", function() {
    expect(query("There is a game engine Unreal Engine")).toEqual("why?");
  });

  // TODO ideally all this data would be in starting knowledge base for bot as well?
  // would be nice if we had this in some separate file perhaps? fixture? !!
  sentences.push("There is a game engine called Unreal Engine");
  answers.push("Unreal Engine is a game engine");
  // should be pushing some expected knowledge structure on here
  sentences.push("There is a horse called Matilda");
  answers.push("Matilda is a horse");
  sentences.push("There is a course called ML");
  answers.push("ML is a course");
  //sentences.push("Gandalf is a wizard"); // will require new regex - next step extract existing one
  //answers.push("Gandalf is a wizard");
  sentences.push("Unreal Engine has a website http://unrealengine.com");
  answers.push("The website for Unreal Engine is http://unrealengine.com");

  sentences.push("What do you know about Robbie?");
  answers.push("I know that Robbie is a robot");
/*
  sentences.push("There is a game engine called Unity3D");
  answers.push("Unity3D is a game engine");
  sentences.push("Unity3D has a URL of http://www.studica.com/unity");
  answers.push("The URL for Unreal Engine is http://www.studica.com/unity");
  sentences.push("Unity3D has a type of integrated");
  answers.push("The type for Unreal Engine is integrated");
  sentences.push("Unity3D has a typeof 3D");
  answers.push("The type for Unity3D is 3D");
  sentences.push("What type of game engine is Unity3D?");
  answers.push("The type for Unity3D is '3D'")

  sentences.push("There is a game engine Crysis");
  answers.push("Crysis is a game engine");

  sentences.push("There is a game engine Source");
  answers.push("Source is a game engine");
  sentences.push("Source has a URL of http://source.valvesoftware.com/sourcesdk/sourceu.php");
  answers.push("The URL for Source is http://source.valvesoftware.com/sourcesdk/sourceu.php");
*/

  var checkAnswer = function(i){
    it( "should respond to \""+sentences[i] + "\" with --> \"" + answers[i]+ "\"", function() {  
        expect(query(sentences[i])).toEqual(answers[i]);
        // ideally we should be checking that data is stored in knowledge base ...
        // and dumping the knowledge base on each test iteration here ...
      });
  }

  for (var i in sentences){
    checkAnswer(i);
  }
  
  it("should match entity assertion regex", function() {
    // websites have URLs
    var result = matchEntityAssertionRegex("There is a robot called Robbie");
    expect(result).toNotEqual(null);
    expect(result).toNotEqual(undefined);
    expect(result.object).toEqual("robot");
    expect(result.name).toEqual("Robbie");
  });

  it("should be able to store named entities", function() {
    var object = 'robot';
    var name = 'Robbie';
    storeEntity(object, name);
    var databank = storage.getDatabank();
    var result = $.rdf({databank:databank}).where('_:'+name+' a ?type').select(['type'])[0];
    expect(result.type.value.trim()).toEqual(object);
  });

  it("should be able to query databank", function() {
    var object = 'robot';
    var name = 'Robbie';  
    storeEntity(object, name);
    var result = queryEntity(name);
    expect(result.name).toEqual(object);
  })

  it("should be able to query databank and fail properly", function() {
    // TODO should add something to refresh databank between each test
    var object = 'flower';
    var name = 'Bert';  
    var result = queryEntity(name);
    expect(result).toEqual(undefined);
  })

  it("should match properties regex", function() {
    // websites have URLs
    var result = matchPropertiesRegex("Unreal Engine has a website http://unrealengine.com");
    expect(result).toNotEqual(null);
    expect(result).toNotEqual(undefined);
    expect(result.object).toEqual("Unreal Engine");
    expect(result.relation).toEqual("website");
    expect(result.name).toEqual("http://unrealengine.com");
  });

  it("should be able to store properties relations", function() {
    var object = 'Unreal Engine';
    var relation = 'website';
    var name = 'http://unrealengine.com';
    var real_name = "Unreal_Engine";
    storeProperty(object, relation, name);
    var databank = storage.getDatabank();
    var result = $.rdf({databank:databank}).where('_:'+real_name+' sam:website ?url').select(['url'])[0];
    expect(result.url.value).toEqual(name);
  });


  it("should remove punctuation", function() {
    expect(removePunctuation("Hello. How are you?")).toEqual("Hello How are you");
  });

  it("should respond from database when asked about a one word item", function() {
    expect(query("There is a course called ML")).toEqual("ML is a course");
    expect(query("What do you know about ML")).toEqual("I know that ML is a course");
    expect(query("What do you know about ML?")).toEqual("I know that ML is a course");
  });

  it("should respond from database when asked about a two word item", function() {
    expect(query("There is a game engine called Unreal Engine")).toEqual("Unreal Engine is a game engine");
    expect(query("What do you know about Unreal Engine")).toEqual("I know that Unreal Engine is a game engine");
    expect(query("What do you know about Unreal Engine?")).toEqual("I know that Unreal Engine is a game engine");
  });


  // not sure how/if we can have pending specs

});
