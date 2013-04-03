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
	var word_tags = {};
	var grams = {};
	var lines = data.split('\n');
	var word, category;
	for(var i in lines){
		tokens = lines[i].split(' ');
		word = tokens[0];
		category = tokens[1];
		if(word !== ''){
			if (word_tags[word] === undefined){
			  word_tags[word] = {}; // e.g. 'mind' or 'resting'
			}
            if(grams[category] === undefined){
              grams[category] = 0;
            }
            grams[category]++;

	        c = word_tags[word][category]; // eg. 'O' or 'I-GENE'
	        c = (c === undefined ? 1 : c+1);
	        word_tags[word][category] = c;
	        //debugger
        }
	}
	//debugger
	var result = {};
	result['grams'] = grams;
	result['word_tags'] = word_tags;
	return result;
}

function rarify(data,rareSymbol,rareThreshold){
   var word_tags = data.word_tags;
   //debugger
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

function tag(devData, result){
	var lines = devData.split('\n');
	var word_tags = result.word_tags;
	var grams = result.grams;
	for(var i in lines){
		var word = lines[i];
		// so I need the emission probabilities looked up by word?
		var highest = 0;
		var output = '';
		for(var category in word_tags[word]){
			var emission = word_tags[word][category]/grams[category];
			if(emission > highest){
				highest = emission;
				output = category;
			}
		}
		lines[i] += ' '+output;
        
	}
	return lines.join('\n');
}

/*

1 WORDTAG O mind
20 WORDTAG O resting
1 WORDTAG I-GENE SOX
2 WORDTAG I-GENE holoenzyme
2 WORDTAG I-GENE hydrolase
2 WORDTAG I-GENE barley
2 WORDTAG O glotticq

*/
