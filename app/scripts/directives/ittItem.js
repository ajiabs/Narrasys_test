'use strict';

// "Transmedia" Item Directive
angular.module('com.inthetelling.player')
	.directive('ittItem', function(videojs, $rootScope, $timeout) {
		return {
			restrict: 'A',
			replace: false,
			template: '<div ng-include="item.templateUrl">Loading Item...</div>',
			scope: {
				item: '=ittItem'
			},
			link: function(scope, element, attrs) {

				scope.item.boCSS = scope.item.essentialCSS + " " + scope.item.styleCSS;

				scope.$watch('item.isActive', function(newVal, oldVal) {
					if (newVal) {
						// console.log("ITEM ENTERING", scope.item);
						if (scope.item.stop) {
							videojs.player.pause();
						}
						if (attrs.autoscroll) {
							$timeout(function() {
								$rootScope.$emit('item.autoscroll');
							});
						}
					} else if (oldVal) {
						// console.log("ITEM EXITING",scope.item);
					}
				});

				scope.toggleDetailView = function() {
					if (scope.item.showInlineDetail) {
						// if inline detail view is visible, close it. (If a modal is visible, this is inaccessible anyway, so no need to handle that case.)
						scope.item.showInlineDetail = false;
					} else {
						videojs.player.pause();
						if (element.closest('.content').width() > 500) {
							// otherwise show detail inline if there's room for it:
							scope.item.showInlineDetail = !scope.item.showInlineDetail;
						} else {
							scope.showModal();
						}
					}
				};

			},
			controller: "ItemController"
		};
	});
