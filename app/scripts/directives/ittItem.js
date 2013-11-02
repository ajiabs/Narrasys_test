'use strict';

// "Transmedia" Item Directive
angular.module('com.inthetelling.player')
.directive('ittItem', function () {
	return {
		restrict: 'A',
		replace: false,
		template: '<div ng-include="item.templateUrl">Loading Item...</div>',
		scope: {
			item: '=ittItem'
		},
		controller: function($scope, modalMgr) {
			// pass through method to modal.createItemDetailOverlay() for templates
			$scope.launchDetailView = function() {
				modalMgr.createItemDetailOverlay($scope);
			};
		}
	};
});
