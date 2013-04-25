function Hash(starting_state, default_return){
	this.default = undefined;
	if(default_return !== undefined){
		this.default = default_return;
	}
	this.hash = {};
	if(starting_state !== undefined){
		this.hash = starting_state;
	}
	
	this.get = function(array){
		var temp = this.hash;
		for(var i in array){
			if(temp[array[i]] === undefined){
				return this.default;
			}
			temp = temp[array[i]];
		}
		return temp;
	}
	this.delete = function(array){
		var temp = this.hash;
		for(var i in array){
			if(temp[array[i]] === undefined){
				return this.default;
			}
			if(i == array.length-1){
				temp[array[i]] = this.default;
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