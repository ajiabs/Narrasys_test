'use strict';

angular.module('com.inthetelling.player')
	.directive('ittItemEditor', function () {
		return {
			restrict: 'A',
			replace: true,
			scope: {
				item: '=ittItemEditor'
			},
			//template: '<div ng-include="item.templateUrl">Loading Item...</div>',
			templateUrl: 'templates/item/edit.html',
			controller: 'ItemController',
			link: function (scope, element, attrs) {
				console.log('ittEditor', scope, element, attrs);

			},

		};
	});
