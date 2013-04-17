function Hash(){
	this.hash = {};
	this.get = function(array){
		var temp = this.hash;
		for(var i in array){
			if(temp[array[i]] === undefined){
				temp[array[i]] = {};
			}
			temp = temp[array[i]];
		}
		return temp;
	}
	this.set = function(array, value){
		var temp = this.hash;
		for(var i in array){
			if(temp[array[i]] === undefined){
				temp[array[i]] = {};
			}
			if(i == array.length-1){
				temp[array[i]] = value;
			}
			temp = temp[array[i]];
		}

		return temp;
	}
}