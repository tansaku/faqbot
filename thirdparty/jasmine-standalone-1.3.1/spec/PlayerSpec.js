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

});

describe("Player", function() {
  var player;
  var song;

  beforeEach(function() {
    player = new Player();
    song = new Song();
  });

  it("should be able to play a Song", function() {
    player.play(song);
    expect(player.currentlyPlayingSong).toEqual(song);

    //demonstrates use of custom matcher
    expect(player).toBePlaying(song);
  });

  describe("when song has been paused", function() {
    beforeEach(function() {
      player.play(song);
      player.pause();
    });

    it("should indicate that the song is currently paused", function() {
      expect(player.isPlaying).toBeFalsy();

      // demonstrates use of 'not' with a custom matcher
      expect(player).not.toBePlaying(song);
    });

    it("should be possible to resume", function() {
      player.resume();
      expect(player.isPlaying).toBeTruthy();
      expect(player.currentlyPlayingSong).toEqual(song);
    });
  });

  // demonstrates use of spies to intercept and test method calls
  it("tells the current song if the user has made it a favorite", function() {
    spyOn(song, 'persistFavoriteStatus');

    player.play(song);
    player.makeFavorite();

    expect(song.persistFavoriteStatus).toHaveBeenCalledWith(true);
  });

  //demonstrates use of expected exceptions
  describe("#resume", function() {
    it("should throw an exception if song is already playing", function() {
      player.play(song);

      expect(function() {
        player.resume();
      }).toThrow("song is already playing");
    });
  });
});