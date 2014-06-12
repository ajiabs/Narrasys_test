'use strict';

/* 
NOTE: when authoring templates make sure that outgoing links call the link() function, 
so they get logged properly: don't draw plain hrefs
*/


angular.module('com.inthetelling.player')
	.directive('ittItem', function(modelSvc, analyticsSvc, timelineSvc) {
		return {
			restrict: 'A',
			replace: true,
			scope: {
				item: '=ittItem'
			},
			template: '<div ng-click="editItem()" ng-include="item.templateUrl">Loading Item...</div>',
			controller: 'ItemController',
			link: function(scope, element, attrs) {
				// console.log('ittItem', scope, element, attrs);

				scope.toggleDetailView = function() {
					console.log("Item toggleDetailView");
					if (scope.item.showInlineDetail) {
						// if inline detail view is visible, close it. (If a modal is visible, this is inaccessible anyway, so no need to handle that case.)
						scope.item.showInlineDetail = false;
					} else {
						analyticsSvc.captureEventActivity("clicked", scope.item._id);
						if (element.closest('.content').width() > 500) {
							// show detail inline if there's room for it:
							scope.item.showInlineDetail = true;
						} else {
							// otherwise pop a modal:
							timelineSvc.pause();
							modelSvc.appState.itemDetail = scope.item;
						}
					}
				};

				scope.forceModal = function() {
					modelSvc.appState.itemDetail = scope.item;
				};

			}
		};
	});
