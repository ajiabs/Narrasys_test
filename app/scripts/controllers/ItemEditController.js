'use strict';

angular.module('com.inthetelling.story')
	.controller('ItemEditController', function ($scope, appState) {

		$scope.addItem = function (type) {
			console.log("adding item of type ", type);
			appState.editing = {
				"type": type
			};

		};

	});
