'use strict';

angular.module('com.inthetelling.player')
	.directive('ittItemEditor', function (modelSvc) {
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

				scope.save = function () {
					// TODO: validate data first

					for (var prop in scope.item) {
						if (scope.item.hasOwnProperty(prop)) {
							modelSvc.events[scope.item._id][prop] = angular.copy(scope.item[prop]);
						}
					}

					modelSvc.appState.editing = false;
					console.log("TODO: send item data to API for storage", scope.item);
					// TODO: also update timeline for start/end time changes
					//modelSvc
				};

				scope.cancelEdit = function () {
					modelSvc.appState.editing = false;
				};

			},

		};
	});
