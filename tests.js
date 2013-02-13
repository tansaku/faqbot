// would like to know about grouping tests within QUnit ...
test( "a basic test example", function() {
  var value = "hello";
  equal( value, "hello", "We expect value to be hello" );
});
test(  "testing NLP", function() {  
  var sentence = "There is a game engine Unreal Engine";
  var result = query(sentence);
  equal( result, "what was that?");
  // "game_engines", "Unreal Engine", {"name":"Unreal Engine","ident":"Unreal Engine"})
  });
var sentences = [];
var answers = [];
sentences[0] = "There is a game engine called Unreal Engine";
answers[0] = "Unreal Engine is a game engine";
sentences[1] = "There is a horse called Matilda";
answers[1] = "Matilda is a horse";
sentences[2] = "There is a course called ML";
answers[2] = "ML is a course";
for (var i in sentences){
  test(  "\""+sentences[i] + "\" --> \"" + answers[i]+ "\"", function() {  
    var result = query(sentences[i]);
    equal( result,  answers[i]);
  });
}
test(  "testing Natural", function() { 
  var result = natural.SoundEx.compare('phone', 'pone'); 
  equal( result, true, "We expect value to be true" );
 });