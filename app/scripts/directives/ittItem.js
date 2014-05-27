'use strict';

angular.module('com.inthetelling.player')
	.directive('ittItem', function (modelSvc) {
		return {
			restrict: 'A',
			replace: true,
			scope: {
				item: '=ittItem'
			},
			//template: '<div ng-include="item.templateUrl">Loading Item...</div>',
			templateUrl: 'templates/item/item.html',
			controller: 'ItemController',
			link: function (scope, element, attrs) {
				//console.log('ittItem', scope, element, attrs);

				scope.edit = function () {
					console.log("Edit item", scope.item);
					modelSvc.appState.editing = angular.copy(scope.item); // to change this to  live preview, don't use angular.copy.  But need to stash a copy of the original in case the user wants to undo...
				};

			},

		};
	});
