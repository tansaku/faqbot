describe("FaqBot", function() {
  var sentences = [];
  var answers = [];

  it("should respond as expected ", function() {
    expect(query("There is a game engine Unreal Engine")).toEqual("what was that?");
  });

  
  sentences[0] = "There is a game engine called Unreal Engine";
  answers[0] = "Unreal Engine is a game engine";
  sentences[1] = "There is a horse called Matilda";
  answers[1] = "Matilda is a horse";
  sentences[2] = "There is a course called ML";
  answers[2] = "ML is a course";

  for (var i in sentences){
    it( "should respond to \""+sentences[i] + "\" with --> \"" + answers[i]+ "\"", function() {  
      expect(query(sentences[i])).toEqual(answers[i]);
    });
  }


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
