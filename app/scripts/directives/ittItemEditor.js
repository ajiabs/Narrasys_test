'use strict';

/* WIP for Producer */

angular.module('com.inthetelling.story')
	.directive('autofocus', function () {
		return {
			link: function (scope, element) {
				element[0].focus();
			}
		};
	})
	.directive('ittItemEditor', function ($rootScope, appState, modelSvc, timelineSvc, awsSvc) {
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

				scope.uploadStatus = [];

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
					return appState.time;
				}, function () {
					if (scope.item) {
						scope.item.start_time = appState.time;
						scope.item.end_time = appState.time;
					}
				});

				scope.dismissalWatcher = $rootScope.$on("player.dismissAllPanels", scope.cancelEdit);

				scope.watchEdits = scope.$watch(function () {
					return appState.editing;
				}, function () {
					// console.log("updated appState.editing");

					modelSvc.cache("event", appState.editing);
				}, true);

				scope.watchTimeEdits = scope.$watch(function () {
					return appState.editing.start_time;
				}, function (newT, oldT) {
					if (newT !== oldT) {
						// console.log("Changed start time from ", oldT, " to ", newT);
						timelineSvc.updateEventTimes(appState.editing);
					}
				});

				scope.uploadAsset = function (files) {
					scope.uploads = awsSvc.uploadFiles(files);

					scope.uploads[0].then(function (data) {
						modelSvc.cache("asset", data.file);

						scope.item.asset = data.file;
						scope.item.asset_id = data.file._id; // TODO need to check the item type, this may need to be annotation_image_id or link_image_id instead
						delete scope.uploads;
					}, function () {
						// console.log("FAIL", );
					}, function (update) {
						scope.uploadStatus[0] = update;
					});
				};

				scope.$on('$destroy', function () {
					scope.watchEdits();
					scope.watchTimeEdits();
					scope.dismissalWatcher();
				});

			},

		};
	});
