describe("Hash", function() {
	var DEFAULT = 0;

	var hash;

	beforeEach(function() {
		hash = new Hash({}, DEFAULT);
	});

	describe("starting state", function () {
		it("should have starting state key/value pairs we pass in", function () {
		    hash = new Hash({'1':'a','2':'b','3':'c'}, DEFAULT);
		    expect(hash.get(['1'])).toEqual('a');
		    expect(hash.get(['2'])).toEqual('b');
		    expect(hash.get(['3'])).toEqual('c');
		    expect(hash.get(['4'])).toEqual(DEFAULT);
		});
	});
	describe("get", function () {
		it("should get the default value", function () {
		    expect(hash.get(['a'])).toEqual(DEFAULT);
		});
		it("should get the default value even when requesting nested hashes", function () {
		    expect(hash.get(['a','b'])).toEqual(DEFAULT);
		});
	});
	// TODO should check we throw an exception if get, delete or set is queried with something other than an array
	describe("delete", function () {
		it("should get the delete the appropriate value", function () {
			var value = 12;
			hash.set(['a'],value);
		    expect(hash.get(['a'])).toEqual(value);
		    hash.delete(['a']);
		    expect(hash.get(['a'])).toEqual(DEFAULT);
		});

	});
	describe("set", function () {
		it("should get the set value", function () {
			var value = 12;
			hash.set(['a'],value);
		    expect(hash.get(['a'])).toEqual(value);
		});
		it("should get the default value even when requesting nested hashes", function () {
			var value = 12;
			hash.set(['a','b'],value);
		    expect(hash.get(['a','b'])).toEqual(value);
		});
	});
});
