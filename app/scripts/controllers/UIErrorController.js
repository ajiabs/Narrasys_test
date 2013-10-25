'use strict';

// UI Error Controller (Shows an error through the UI)
angular.module('com.inthetelling.player')
.controller('UIErrorController', function ($scope, $rootScope) {
	$scope.errorMsg = $rootScope.uiErrorMsg || 'The requested route does not exist. Please use /episode/<episodeId> format.';
});
