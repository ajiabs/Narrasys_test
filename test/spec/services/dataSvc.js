'use strict';

describe('Service: dataSvc', function () {

	// load the service's module
	beforeEach(module('com.inthetelling.story'));

	// instantiate service
	var dataSvc;
	beforeEach(inject(function (_dataSvc_) {
		dataSvc = _dataSvc_;

		dataSvc.cache("styles", [{
			"_id": "1",
			"css_name": "one",
			"display_name": "One"
		}, {
			"_id": "2",
			"css_name": "two",
			"display_name": "Two"
		}, {
			"_id": "3",
			"css_name": "three",
			"display_name": "Three"
		}, {
			"_id": "4",
			"css_name": "four",
			"display_name": "Four"
		}, {
			"_id": "5",
			"css_name": "five",
			"display_name": "Five"
		}]);

		dataSvc.cache("templates", [{
			"_id": "template1",
			"url": "templates/foo.html"
		}]);

	}));

	it('dataSvc should exist', function () {
		expect(dataSvc).toNotEqual(undefined);
	});

	it('readCache should read the right thing from the cache', function () {
		var style = dataSvc.readCache("style", "css_name", "one");
		expect(style.id).toEqual('1');
	});

	it('prepItemForStorage should correctly convert the style names to IDs', function () {
		var item = {
			"styles": ["one", "two", "three"],
			"templateUrl": "templates/foo.html"
		};
		item = dataSvc.prepItemForStorage(item);
		expect(item.style_id).toEqual(['1', '2', '3']);
	});

	it('prepItemForStorage should (for now) ignore styles that weren\'t in the cache', function () {
		var item = {
			styles: ["six"],
			"templateUrl": "templates/foo.html"
		};
		item = dataSvc.prepItemForStorage(item);
		expect(item.style_id).toEqual([]);
	});

	it('prepItemForStorage should ignore the styleCss string', function () {
		var item = {
			styles: ["one", "two", "three"],
			styleCss: 'one two three four',
			"templateUrl": "templates/foo.html"
		};
		item = dataSvc.prepItemForStorage(item);
		expect(item.style_id).toEqual(['1', '2', '3']);
	});

});
