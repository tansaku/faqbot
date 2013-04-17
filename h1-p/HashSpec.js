describe("Hash", function() {
	var DEFAULT = {};

	var hash;

	beforeEach(function() {
		hash = new Hash();
	});

	describe("get", function () {
		it("should get the default value", function () {
		    expect(hash.get(['a'])).toEqual(DEFAULT);
		});
		it("should get the default value even when requesting nested hashes", function () {
		    expect(hash.get(['a','b'])).toEqual(DEFAULT);
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
