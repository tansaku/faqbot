// should use a gist - use API to grab data from that
// or trying to grab it from my file system - 
// but either way we are now testing something that doesn't operate immediately
// so we have to have a special type of test - have to look up testing 
// ajax http calls in jasmine
function grab() {
$.get('http://127.0.0.1/~sam/Github/faqbot/h1-p/gene.train.head', function(data) {
    $('#result').text(data);
    // so issue here is that we'd be quite happy to block waiting for this data
    // having pulled it in a single time ...
}, "text");
}

// so now we are pulling in data from file system - could pull in larger file?
// test will be slow .. so? could be separate test ... not sure how we can 
// write results out ... just dump to browser?
// need some other kind of interface to use system other than testing one ...
// just like we have in faqbot ...

function callAjax(callback,filename) {
	return $.ajax({
	    url: "/~sam/Github/faqbot/h1-p/"+filename,
	    success: callback
	});
}

// could have been testing this at a much lower level?
function count(data){
	// Comparison O
	var word_tags = new Hash({},0);
	var grams = new Hash({1:{},2:{},3:{}},0);
	var lines = data.split('\n');
	var word, category; // could start with category being *, increment grams, and then ...
	var category_minus_one = '*';
	var category_minus_two = '*';
	for(var i in lines){
		//debugger
		tokens = lines[i].split(' ');
		word = tokens[0];
		category = tokens[1]; // e.g. 'O' or 'I-GENE'
		if(word === ''){ // is this our sentence break identifier
			category = 'STOP';
		}
		else{
			word_tags.set([word,category],word_tags.get([word,category])+1)
		}
        grams.set([1,category], grams.get([1,category])+1);
        grams.set([2,category_minus_one,category], grams.get([2,category_minus_one,category])+1);
        grams.set([3,category_minus_two,category_minus_one,category], grams.get([3,category_minus_two,category_minus_one,category])+1);

        if(category === 'STOP'){
        	category_minus_one = '*';
			category_minus_two = '*';
			grams.set([2,category_minus_two,category_minus_one], grams.get([2,category_minus_two,category_minus_one])+1);// HACK!!!!
        }
        else{
	        category_minus_two = category_minus_one;
        	category_minus_one = category;
        }
        
	}
	//debugger
	var result = {};
	result['grams'] = grams;
	result['word_tags'] = word_tags;

	// so this function could be moved out of the larger one, tested independently perhaps
	// currently relying on closing around the grams data object ...
	// TODO pull these out
	// TODO switch word_tags to using my hashes
	result.hmm = function(z,y,x){
		var numerator = result['grams'].get(['3',x,y,z]);

		var denominator = result['grams'].get(['2',x,y]);
		if(denominator == 0 ){
			return 0;
		}
		return numerator/denominator;
	};
	result.emission = function(x,y){
		var c = result['word_tags'].get([x,y]) || 0;
		var d = result.get(['grams','1',category]); // this being wrong didn't trip a test ...
        return c/d;
	}
	return result;
}

function rarify(data,rareSymbol,rareThreshold){
   // NOTE THIS IS CHANGING UNDERLYING DATA STRUCTURE ... 
   var word_tags = data.word_tags;
   //debugger

   // seems like we should initialize the rare keyword
   // although rare should never be one I guess - makes no sense ...
   // TODO keys method for Hash object?
   for(var word in word_tags.hash){
   	  var sum = 0;
   	  for(var category in word_tags.get([word])){
   	  	 sum+= word_tags.get([word,category]);
   	  }
   	  if(sum<rareThreshold){
   	  	 for(var category in word_tags.get([word])){
   	  	    word_tags.set([rareSymbol,category],word_tags.get([rareSymbol,category]) + word_tags.get([word,category]));
   	     }
   	  	 word_tags.delete([word]);
   	  }
   }
   data.word_tags = word_tags;
   return data;
}

function getSet(position){
	if(position == -1 || position == 0){
		return {'*':undefined};
	}
	return {'O':undefined,'I-GENE':undefined,'STOP':undefined};
}

function viterbi(sentence,result){


	//Input: a sentence x_1 ... x_n, parameters q(s|u, v) and e(x|s).

	//Initialization: Set pi(0,*,*) = 1
	var pi = new Hash();
	// NEED DEFAULT VALUES
	pi.set([0,'*','*'],1);
	//Definition: S_-1 = S_0 = {*}, S_k = S for k element of {1...n} set of possible tags
    
	//Algorithm:
	//For k = 1...n,
	var words = sentence.split(' ');
	var n = words.length;
	debugger
	for(var k in words){
	//  For u element of  S_k-1, v element of S_k,
	  for(var u in getSet(k-1)){
        for(var v in getSet(k)){
	    // pi(k,u,v) = max_(w elementof S_k-2) (pi(k-1,w,u) x q(v|w,u) x e(x_k|v))
	      var max = 0;
	      var temp = 0;
	      var temp_pi = 0;
	      for(var w in getSet(k-2)){
	      	// TODO really should pull out all these functions for testing
	      	temp_pi = pi.get([k-1,w,u]);
	      	if(temp_pi === undefined){
	      		temp_pi = 0;
	      	}
            temp = temp_pi * result.hmm(v,w,u) * result.emission(words[k],v);
            if(temp > max){
            	max = temp;
            }
	      }
	      pi.set([k,u,v],max);
	    }
	  }
	}
	//Return max_[u element of S_n-1,v element of S_n] (pi(n,u,v) x q(STOP|u,v))
	var max = 0;
	var temp = 0;
	for(var u in getSet(n-1)){
		for(var v in getSet(n)){
			temp = pi.get([n,u,v]) * q.hmm('STOP',u,v);
			if(temp > max){
            	max = temp;
            }
		}
	}
	return max;
}

function tag(devData, result, rareSymbol){
	var lines = devData.split('\n');
	var word_tags = result.word_tags;
	for(var i in lines){
		var word = lines[i];
		// so I need the emission probabilities looked up by word
		var highest = 0;
		var output = '';
        // if we haven't encountered word we need to assign using _RARE_
        if(word !== ''){
        	//debugger
	        if(word_tags.get([word]) === 0){
	        	word = rareSymbol;
	        }
			for(var category in word_tags.get([word])){
				var emission = word_tags.get([word,category])/result.grams.get([1,category]);
				if(emission > highest){
					highest = emission;
					output = category;
				}
			}
			lines[i] = lines[i]+' '+output;
			lines[i] = lines[i].trim()
		}
        // would like to return the data, but need to output file for NLP
	}
	return lines.join('\n').trim();
} // all getting a bit smelly - could we have driven this with more fine-grained tests.

/*

1 WORDTAG O mind
20 WORDTAG O resting
1 WORDTAG I-GENE SOX
2 WORDTAG I-GENE holoenzyme
2 WORDTAG I-GENE hydrolase
2 WORDTAG I-GENE barley
2 WORDTAG O glotticq

*/
