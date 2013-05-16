describe("Viterbi", function() {
  var sentences = [];
  var answers = [];
  var gene_train_head = "";

  var rareKeyword = '_RARE_'

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
// at the moment these all get assigned I-GENE as our micro training data has
// no words that aren't rare to I-GENE and O are given equal prob., and the first
// category (I-GENE) is assigned to everything ...
// a better test would use a lower threshold
var gene_key_head_direct = "BACKGROUND I-GENE\n\
: I-GENE\n\
Ischemic I-GENE\n\
heart I-GENE\n\
disease I-GENE\n\
is I-GENE\n\
the I-GENE\n\
primary I-GENE\n\
cause I-GENE\n\
of O\n";

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
          return callback2.callCount > 0;
      });
      runs(function() {
        devData = callback2.mostRecentCall.args[0];
      });

      callback3 = jasmine.createSpy();
      callAjax(callback3,'gene.key.head');
      waitsFor(function() {
          return callback3.callCount > 0;
      });
      runs(function() {
        keyData = callback3.mostRecentCall.args[0];
      });

    });

    it("should be able to generate the correct frequency counts", function() {
      var result = count(trainingData);
      var word_tags = result.word_tags;
      // this is a subset of the correct counts ...
      expect(word_tags.get(['Comparison','O'])).toEqual(2);
      expect(word_tags.get(['Pharmacologic','O'])).toEqual(1);
      expect(word_tags.get(['and','O'])).toEqual(1);
      expect(word_tags.get(['with','O'])).toEqual(1);
      expect(word_tags.get(['alkaline','I-GENE'])).toEqual(1);
      expect(word_tags.get(['phosphatases','I-GENE'])).toEqual(1);
      expect(word_tags.get(['5','I-GENE'])).toEqual(1);
      expect(word_tags.get(['-','I-GENE'])).toEqual(1);
      expect(word_tags.get(['nucleotidase','I-GENE'])).toEqual(1);
      
      var grams = result.grams;
      expect(grams.get(['1','O'])).toEqual(43);
      expect(grams.get(['1','I-GENE'])).toEqual(5);
      expect(grams.get(['2','*','*'])).toEqual(3);
      expect(grams.get(['2','*','O'])).toEqual(3);
      expect(grams.get(['2','*','I-GENE'])).toEqual(0);
      expect(grams.get(['2','O','I-GENE'])).toEqual(2);
      expect(grams.get(['2','O','O'])).toEqual(39);
      expect(grams.get(['2','I-GENE','O'])).toEqual(1);
      expect(grams.get(['2','I-GENE','I-GENE'])).toEqual(3);
      expect(grams.get(['3','*','*','*'])).toEqual(0);
      expect(grams.get(['3','*','*','O'])).toEqual(3);
      expect(grams.get(['3','*','O','O'])).toEqual(3);
      expect(grams.get(['3','O','O','O'])).toEqual(36);
    });

    it("should be able to generate the correct frequency counts with infrequent cutoff", function() {
      var result = rarify(count(trainingData),'_RARE_',5);
      var word_tags = result.word_tags;
      // this is a subset of the correct counts ...
      expect(word_tags.get(['Comparison'])).toEqual(0);
      expect(word_tags.get(['Pharmacologic'])).toEqual(0);
      expect(word_tags.get(['and'])).toEqual(0);
      expect(word_tags.get(['with'])).toEqual(0);
      expect(word_tags.get(['alkaline'])).toEqual(0);
      expect(word_tags.get(['phosphatases'])).toEqual(0);
      expect(word_tags.get(['5'])).toEqual(0);
      expect(word_tags.get(['-'])).toEqual(0);
      expect(word_tags.get(['nucleotidase'])).toEqual(0);
      expect(word_tags.get(['_RARE_','O'])).toEqual(43);
      expect(word_tags.get(['_RARE_','I-GENE'])).toEqual(5);
      
      var grams = result.grams;
      expect(grams.get(['1','O'])).toEqual(43);
      expect(grams.get(['1','I-GENE'])).toEqual(5);
    });

    it("should be able to read in the dev file and tag it", function() {
       var c = count(trainingData);
       var result = rarify(c,rareKeyword,2);
       expect(tag(devData, result, rareKeyword)).toEqual(gene_key_head_direct.trim());
    });

    it("should be able to calculate HMM Conditional Trigram probabilities", function() {
       grams = new Hash({1:{},2:{},3:{}},0);
       grams.set(['3','*','*','O'],0.0);
       grams.set(['2','*','*'],0.0);
       expect(conditionalTrigramProbability('O','*','*',grams)).toEqual(0);
       grams.set(['3','*','*','O'],0.1);
       grams.set(['2','*','*'],0.5);
       expect(conditionalTrigramProbability('O','*','*',grams)).toEqual(0.2);
    });

    it("should be able to calculate HMM Trigram probabilities given a count object", function() {
       var c = count(trainingData);
       var grams = c.grams;
       expect(conditionalTrigramProbability('O','*','*',grams)).toEqual(grams.get(['3','*','*','O'])/grams.get(['2','*','*']));
       expect(conditionalTrigramProbability('I-GENE','*','*',grams)).toEqual(0);
       expect(conditionalTrigramProbability('I-GENE','I-GENE','*',grams)).toEqual(0);
       expect(conditionalTrigramProbability('STOP','I-GENE','I-GENE',grams)).toEqual(1/3);
    });

    it("should be able to calculate emission probabilities", function() {
       var c = count(trainingData);
       var grams = c.grams;
       var word_tags = c.word_tags;
       expect(emission('Comparison','O', word_tags, grams)).toEqual(2/43);
       expect(emission('Blah','O', word_tags, grams)).toEqual(0);
       expect(emission('alkaline','I-GENE', word_tags, grams)).toEqual(0.2);
       expect(emission('Comparison','I-GENE', word_tags, grams)).toEqual(0);
       expect(emission('alkaline','O', word_tags, grams)).toEqual(0);
       // TODO would be good to be checking for divide by zero
       grams.set(['1','O'],0);
       expect(emission('Comparison','O', word_tags, grams)).toEqual(0);
    });

    it("should be able to compute the viterbi algorithm", function() {
       var c = count(trainingData);
       var result = rarify(c,rareKeyword,2);
       var result2 = viterbi("Comparison with alkaline",result);
       expect(result2.tag_sequence).toEqual({0:'O',1:'O',2:'I-GENE',3:'STOP'});
       expect(result2.max).toEqual(10);

    });

    it("should be able to get appropriate sets for possible tags at each position in a sentence", function() {
       expect(getSet(-1)).toEqual({'*':undefined});
       expect(getSet(0)).toEqual({'*':undefined});
       expect(getSet(1)).toEqual({'O':undefined,'I-GENE':undefined,'STOP':undefined});
       expect(getSet(100)).toEqual({'O':undefined,'I-GENE':undefined,'STOP':undefined});

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
