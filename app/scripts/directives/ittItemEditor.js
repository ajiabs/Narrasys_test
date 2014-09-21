'use strict';

/* WIP for Producer */

angular.module('com.inthetelling.story')
	.directive('ittItemEditor', function (appState, timelineSvc) {
		return {
			restrict: 'A',
			replace: true,
			scope: {
				item: '=ittItemEditor'
			},
			//template: '<div ng-include="item.templateUrl"></div>',
			templateUrl: 'templates/producer/item.html',
			controller: 'ItemEditController',
			link: function (scope) {
				console.log('ittEditor', scope);

				if (scope.item.type) {
					scope.itemTemplateUrl = 'templates/producer/item/' + scope.item.type + '.html';
				}

				scope.appState = appState;

				scope.setItemTime = function () {
					// triggered when user changes start time in the input field
					if (scope.item) {
						scope.item.start_time = appState.time;
						scope.item.end_time = appState.time;
					}
					// Since we've manipulated the timeline directly, need to let timelineSvc keep up with us:
					timelineSvc.seek(appState.time);
				};

				// watch for user seeking manually:
				scope.unwatch = scope.$watch(function () {
					return appState.time
				}, function () {
					console.log("time changed!");
					if (scope.item) {
						scope.item.start_time = appState.time;
						scope.item.end_time = appState.time;
					}
				});

				// delete scope.item.asjson;
				// scope.originalItem = angular.copy(scope.item);
				// scope.item.asjson = $filter("pretty")(scope.item);

				// var unwatch = scope.$watch(function () {
				// 	return scope.item.asjson;
				// }, function (updated) {

				// 	try {
				// 		scope.item = JSON.parse(updated);
				// 		scope.item.asjson = $filter("pretty")(scope.item);
				// 		scope.item.editwarning = false;
				// 	} catch (e) {
				// 		scope.item.editwarning = true;
				// 	}

				// });

				// scope.$on('$destroy', function () {
				// 	unwatch();
				// });

				// scope.save = function () {
				// 	dataSvc.storeItem(angular.copy(scope.item)).then(function (ret) {
				// 		console.log(ret);
				// 	});
				// };

				// scope.reset = function () {
				// 	console.log("reset");
				// 	scope.item = angular.copy(scope.originalItem);
				// 	scope.item.asjson = $filter("pretty")(scope.item);
				// };

				///////

				// if (!scope.item.layouts) {
				// 	scope.item.layouts = [];
				// }

				// scope.$watch(function () {
				// 	return scope.item.end_time;
				// }, function (newVal) {
				// 	scope.item.noEndTime = (newVal === '');
				// });

				// scope.save = function () {
				// 	// TODO: validate data first

				// 	scope.item = modelSvc.deriveEvent(scope.item);
				// 	for (var prop in scope.item) {
				// 		if (scope.item.hasOwnProperty(prop)) {
				// 			modelSvc.events[scope.item._id][prop] = angular.copy(scope.item[prop]);
				// 		}
				// 	}
				// 	modelSvc.resolveEpisodeEvents(scope.item.episode_id);

				// 	//TODO need to update timeline if event start/end times have changed

				// 	appState.editing = false;
				// 	// console.log("TODO: send item data to API for storage", scope.item);
				// 	// TODO: also update timeline for start/end time changes
				// 	//modelSvc
				// };

				// scope.updateStyles = function () {
				// 	scope.item.styles = [];
				// 	angular.forEach([scope.item.customTransition, scope.item.customTypography, scope.item.customColor, scope.item.customTimestamp], function (style) {
				// 		if (style) {
				// 			scope.item.styles.push(style);
				// 		}
				// 	});
				// 	scope.item.styleCss = scope.item.styles.join(" ");
				// };

				// scope.cancelEdit = function () {
				// 	appState.editing = false;
				// };

			},

		};
	});
