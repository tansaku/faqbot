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

function incrementOneGramCount(one_grams,category){
    if(one_grams[category] === undefined){
      one_grams[category] = 0;
    }
    one_grams[category]++;
}

function incrementTwoGramCount(two_grams,category_minus_one,category){
    if(two_grams[category_minus_one] === undefined){
      two_grams[category_minus_one] = {};
    }
    if(two_grams[category_minus_one][category] === undefined){
      two_grams[category_minus_one][category] = 0;
    }
    two_grams[category_minus_one][category]++;
}

function incrementThreeGramCount(three_grams,category_minus_two,category_minus_one,category){
    if(three_grams[category_minus_two] === undefined){
      three_grams[category_minus_two] = {};
    }
    if(three_grams[category_minus_two][category_minus_one] === undefined){
      three_grams[category_minus_two][category_minus_one] = {};
    }
    if(three_grams[category_minus_two][category_minus_one][category] === undefined){
      three_grams[category_minus_two][category_minus_one][category] = 0;
    }
    three_grams[category_minus_two][category_minus_one][category]++;
}


// could have been testing this at a much lower level?
function count(data){
	// Comparison O
	var word_tags = {};
	var grams = {'1':{},'2':{},'3':{}};
	var lines = data.split('\n');
	var word, category; // could start with category being *, increment grams, and then ...
	var category_minus_one = '*';
	var category_minus_two = '*';
	var c;
	for(var i in lines){
		//debugger
		tokens = lines[i].split(' ');
		word = tokens[0];
		category = tokens[1];
		if(word === ''){ // is this our sentence break identifier
			category = 'STOP';
		}
		else{
			if (word_tags[word] === undefined){
			  word_tags[word] = {}; // e.g. 'mind' or 'resting'
			}

	        c = word_tags[word][category]; // eg. 'O' or 'I-GENE'
	        c = (c === undefined ? 1 : c+1);
	        word_tags[word][category] = c;
		}
		//
        incrementOneGramCount(grams['1'],category);
        incrementTwoGramCount(grams['2'],category_minus_one,category);
        incrementThreeGramCount(grams['3'],category_minus_two,category_minus_one,category);

        if(category === 'STOP'){
        	category_minus_one = '*';
			category_minus_two = '*';
			incrementTwoGramCount(grams['2'],category_minus_two,category_minus_one);// HACK!!!!
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
	result.hmm = function(z,y,x){
		var numerator = 0;
		if(result['grams']['3'][x] !== undefined && result['grams']['3'][x][y] !== undefined && result['grams']['3'][x][y][z] !== undefined){
			numerator = result['grams']['3'][x][y][z];
		}
		var denominator = 1;
		if(result['grams']['2'][x] !== undefined && result['grams']['2'][x][y] !== undefined ){
			denominator = result['grams']['2'][x][y];;
		}
		return numerator/denominator;
	};
	result.emission = function(x,y){
		var c = result['word_tags'][x][y] || 0;
		var d = result['grams']['1'][category] || 0;
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
   for(var word in word_tags){
   	  var sum = 0;
   	  for(var category in word_tags[word]){
   	  	 sum+= word_tags[word][category];
   	  }
   	  if(sum<rareThreshold){
  		if(word_tags[rareSymbol] === undefined){
  			word_tags[rareSymbol] = {};
  		}
   	  	 for(var category in word_tags[word]){

   	  		if(word_tags[rareSymbol][category] === undefined){
   	  			word_tags[rareSymbol][category] = 0;
   	  		}
   	  	    word_tags[rareSymbol][category] += word_tags[word][category];
   	     }
   	  	 delete word_tags[word];
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
	      for(var w in getSet(k-2)){
	      	// TODO would like pi.get to give us back 0 if
	      	// there is no entry there ...
	      	// really should pull out all these functions for testing
            temp = pi.get([k-1,w,u]) * result.hmm(v,w,u) * result.emission(words[k],v);
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
	var one_grams = result.grams['1'];
	for(var i in lines){
		var word = lines[i];
		// so I need the emission probabilities looked up by word
		var highest = 0;
		var output = '';
        // if there is no entry for that word we need to assign using _RARE_
        if(word !== ''){
        	//debugger
	        if(word_tags[word] === undefined){
	        	word = rareSymbol;
	        }
			for(var category in word_tags[word]){
				var emission = word_tags[word][category]/one_grams[category];
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
