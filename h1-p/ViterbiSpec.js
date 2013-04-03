describe("Viterbi", function() {
  var sentences = [];
  var answers = [];
  var gene_train_head = "";

  var gene_train_head_direct = "Comparison O\n\
Comparison O\n\
with O\n\
alkaline I-GENE\n\
phosphatases I-GENE\n\
and O\n\
5 I-GENE\n\
- I-GENE\n\
nucleotidase I-GENE\n\
\n\
Pharmacologic O\n";

  // what's the approach to test ajax calls in jasmine
  //$.get('http://127.0.0.1/~sam/Github/faqbot/h1-p/gene.train.head', function(data) {
    // so issue here is that we'd be quite happy to block waiting for this data
    // having pulled it in a single time ...
    // TODO make sure this blocks before we get to specs
    //gene_train_head = data;

  //}, "text");

  describe("counting", function () {
    var callback,trainingData,devData,keyData;

    beforeEach(function() {
      callback = jasmine.createSpy();
      callAjax(callback,'gene.train.head2');
      waitsFor(function() {
          return callback.callCount > 0;
      });
      runs(function() {
        trainingData = callback.mostRecentCall.args[0];
      });

      callback2 = jasmine.createSpy();
      callAjax(callback2,'gene.dev.head');
      waitsFor(function() {
          return callback.callCount > 0;
      });
      runs(function() {
        devData = callback.mostRecentCall.args[0];
      });

      callback3 = jasmine.createSpy();
      callAjax(callback3,'gene.key.head');
      waitsFor(function() {
          return callback.callCount > 0;
      });
      runs(function() {
        keyData = callback.mostRecentCall.args[0];
      });

    });

    it("should be able to generate the correct frequency counts", function() {
      var result = count(trainingData);
      var word_tags = result.word_tags;
      // this is a subset of the correct counts ...
      expect(word_tags['Comparison']['O']).toEqual(2);
      expect(word_tags['Pharmacologic']['O']).toEqual(1);
      expect(word_tags['and']['O']).toEqual(1);
      expect(word_tags['with']['O']).toEqual(1);
      expect(word_tags['alkaline']['I-GENE']).toEqual(1);
      expect(word_tags['phosphatases']['I-GENE']).toEqual(1);
      expect(word_tags['5']['I-GENE']).toEqual(1);
      expect(word_tags['-']['I-GENE']).toEqual(1);
      expect(word_tags['nucleotidase']['I-GENE']).toEqual(1);
      
      var grams = result.grams;
      expect(grams['O']).toEqual(43);
      expect(grams['I-GENE']).toEqual(5);
    });

    it("should be able to generate the correct frequency counts with infrequent cutoff", function() {
      var result = rarify(count(trainingData),'_RARE_',5);
      var word_tags = result.word_tags;
      // this is a subset of the correct counts ...
      expect(word_tags['Comparison']).toEqual(undefined);
      expect(word_tags['Pharmacologic']).toEqual(undefined);
      expect(word_tags['and']).toEqual(undefined);
      expect(word_tags['with']).toEqual(undefined);
      expect(word_tags['alkaline']).toEqual(undefined);
      expect(word_tags['phosphatases']).toEqual(undefined);
      expect(word_tags['5']).toEqual(undefined);
      expect(word_tags['-']).toEqual(undefined);
      expect(word_tags['nucleotidase']).toEqual(undefined);
      expect(word_tags['_RARE_']['O']).toEqual(43);
      expect(word_tags['_RARE_']['I-GENE']).toEqual(5);
      
      var grams = result.grams;
      expect(grams['O']).toEqual(43);
      expect(grams['I-GENE']).toEqual(5);
    });

    it("should be able to read in the dev file and tag it", function() {
       var result = rarify(count(trainingData),'_RARE_',5);
       expect(tag(devData, result)).toEqual(keyData);
    });

  });


  describe("ajax", function () {
    var callback,data;

    beforeEach(function() {
      callback = jasmine.createSpy();
      callAjax(callback,'gene.train.head');
      waitsFor(function() {
          return callback.callCount > 0;
      });
      runs(function() {
        data = callback.mostRecentCall.args[0];
      });
    });

    it("should make a real AJAX request", function () {
      runs(function() {
        expect(callback.mostRecentCall.args[0]).toEqual(gene_train_head_direct);
      });
    });
  });



  




});
