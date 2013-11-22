'use strict';

angular.module('com.inthetelling.player')
.directive('ittNavigationPanel', function () {
	return {
		restrict: 'A',
		replace: true,
		scope: true,
		templateUrl: 'templates/panels/navigationPanel.html',
		controller: 'NavigationPanelController'
	};
});
