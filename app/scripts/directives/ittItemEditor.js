'use strict';

/* WIP for Producer */

angular.module('com.inthetelling.player')
	.directive('ittItemEditor', function(modelSvc, appState) {
		return {
			restrict: 'A',
			replace: true,
			scope: {
				item: '=ittItemEditor'
			},
			//template: '<div ng-include="item.templateUrl">Loading Item...</div>',
			templateUrl: 'templates/item/edit.html',
			controller: 'ItemController',
			link: function(scope, element, attrs) {
				// console.log('ittEditor', scope, element, attrs);

				if (!scope.item.layouts) {
					scope.item.layouts = [];
				}

				scope.$watch(function() {
					return scope.item.end_time;
				}, function(newVal) {
					scope.item.noEndTime = (newVal === '');
				});


				scope.save = function() {
					// TODO: validate data first

					scope.item = modelSvc.deriveEvent(scope.item);
					for (var prop in scope.item) {
						if (scope.item.hasOwnProperty(prop)) {
							modelSvc.events[scope.item._id][prop] = angular.copy(scope.item[prop]);
						}
					}
					modelSvc.resolveEpisodeEvents(scope.item.episode_id);

					//TODO need to update timeline if event start/end times have changed


					appState.editing = false;
					// console.log("TODO: send item data to API for storage", scope.item);
					// TODO: also update timeline for start/end time changes
					//modelSvc
				};

				scope.updateStyles = function() {
					scope.item.styles = [];
					angular.forEach([scope.item.customTransition, scope.item.customTypography, scope.item.customColor, scope.item.customTimestamp], function(style) {
						if (style) {
							scope.item.styles.push(style);
						}
					});
					scope.item.styleCss = scope.item.styles.join(" ");
				};

				scope.cancelEdit = function() {
					appState.editing = false;
				};

			},

		};
	});
