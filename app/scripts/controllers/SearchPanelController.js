'use strict';

// Controller for the search panel overlay
angular.module('com.inthetelling.player')
.controller('SearchPanelController', function ($scope, videojs) {

	$scope.selectedItemTypes = {
		transcript: true,
		link: true,
		slide: true,
		indepth: true,
		project: true,
		discussion: true
	};

});
