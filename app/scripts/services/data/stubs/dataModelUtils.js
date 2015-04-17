angular.module('com.inthetelling.story')
	.service('DataModelUtils', function DataModelUtils() {
		this.data = [];

		this.getData = function () {
			return this.data;
		};

		this.setData = function (data) {
			this.data = data;
		};

		this.findOne = function (Id) {
			// find the item that matches that id
			console.log("finding one", Id);
			var list = $.grep(this.getData(), function (element, index) {
				return (element._id == Id);
			});
			if (list.length === 0) {
				return {};
			}
			// even if list contains multiple items, just return first one
			return list[0];
		};

		this.findAll = function () {
			return this.getData();
		};

		// options parameter is an object with key value pairs
		// in this simple implementation, value is limited to a single value (no arrays)
		this.findMany = function (options) {
			// find items that match all of the options
			var list = $.grep(this.getData(), function (element, index) {
				var matchAll = true;
				$.each(options, function (optionKey, optionValue) {
		//			console.log(optionKey, optionValue);
		//			console.log('actualValue:', element[optionKey]);
					if (element[optionKey] != optionValue) {
			//			console.log('no match');
						matchAll = false;
						return false;
					}
				});
				return matchAll;
			});
			//console.log('match list', list);
			return list
		};

		// add a new data item that does not exist already
		// must compute a new unique id and backfill in
		this.addOne = function (dataItem) {
			// must calculate a unique ID to add the new data
			var newId = this.newId();
			dataItem._id = newId;
			this.data.push(dataItem);
			return dataItem;
		};

		// return an id to insert a new data item at
		this.newId = function () {
			var text = "";
			var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

			for (var i = 0; i < 5; i++)
				text += possible.charAt(Math.floor(Math.random() * possible.length));

			return text;
		};

		this.updateOne = function (Id, dataItem) {
			// find the item that matches that id
			var items = this.getData();
			var match = null;
			for (var i = 0; i < items.length; i++) {
				if (items[i]._id == Id) {
					match = items[i];
					break;
				}
			}
			if (!angular.isObject(match)) {
				return {};
			}
			angular.extend(match, dataItem);
			return match;
		};

		this.deleteOne = function (Id) {
			// delete the item that matches that id
			var items = this.getData();
			var match = false;
			for (var i = 0; i < items.length; i++) {
				if (items[i]._id == Id) {
					match = true;
					items.splice(i, 1);
					break;
				}
			}
			return match;
		};

	});


