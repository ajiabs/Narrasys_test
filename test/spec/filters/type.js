'use strict';

describe('Filter: type', function () {

	// load the filter's module
	beforeEach(module('com.inthetelling.player'));

	// initialize a new instance of the filter before each test
	var typeFilter;
	beforeEach(inject(function ($filter) {
		typeFilter = $filter('type');
	}));

	// prepare a fresh items collection before each test
	var items;
	beforeEach(function() {
		items = [
			{type: "one"},
			{type: "two"},
			{type: "three"},
			{type: "four"},
			{type: "five"}
		];
	});

	it('should filter the items collection down to the allowed types', function () {
		var allowedTypes = ["one", "three", "five"];
		expect(typeFilter(items, allowedTypes)).toEqual([
			{type: "one"},
			{type: "three"},
			{type: "five"}
		]);
	});
	
	it('should ignore an allowed type not present in the collection', function () {
		var allowedTypes = ["one", "two", "FNORD"];
		expect(typeFilter(items, allowedTypes)).toEqual([
			{type: "one"},
			{type: "two"}
		]);
	});

	it('should ignore a collection item without a type field', function () {
		items.push({notype: "FNORD"});
		var allowedTypes = ["one", "two", "FNORD"];
		expect(typeFilter(items, allowedTypes)).toEqual([
			{type: "one"},
			{type: "two"}
		]);
	});

});
