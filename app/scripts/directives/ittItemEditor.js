'use strict';

/* 

WIP for Producer 


TODO: right now we're re-building the episode structure on every keystroke.  That's a tiny bit wasteful of cpu :)  At the very least, debounce input to a more reasonable interval
*/

angular.module('com.inthetelling.story')
	.directive('autofocus', function ($timeout) {
		return {
			link: function (scope, element) {
				$timeout(function () { // give any child directives time to render themselves...

					element.find('input,textarea')[0].focus();
				});
			}
		};
	})
	.directive('ittItemEditor', function ($rootScope, appState, modelSvc, timelineSvc, awsSvc, dataSvc) {
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
				// console.log("itemEditController", scope.item);
				scope.uploadStatus = [];
				scope.uneditedItem = angular.copy(scope.item); // in case of cancel

				scope.annotators = modelSvc.episodes[appState.episodeId].annotators;

				scope.itemForm = {
					"transition": "",
					"highlight": "",
					"color": "",
					"typography": "",
					"timestamp": ""
				};

				if (!scope.item.layouts) {
					scope.item.layouts = ["inline"];
				}

				// extract current event styles for the form
				if (scope.item.styles) {
					for (var styleType in scope.itemForm) {

						for (var i = 0; i < scope.item.styles.length; i++) {

							console.log(scope.item.styles[i].substr(0, styleType.length) === styleType, scope.item.styles[i].substr(0, styleType.length));
							if (scope.item.styles[i].substr(0, styleType.length) === styleType) { // begins with styleType
								scope.itemForm[styleType] = scope.item.styles[i].substr(styleType.length); // Remainder of scope.item.styles[i]
							}
						}
					}

					console.log("Done:", scope.itemForm);
				}

				// TODO:this breaks when editing sxs items within producer!
				scope.itemEditor = 'templates/producer/item/' + appState.product + '-' + scope.item.producerItemType + '.html';

				scope.appState = appState;

				scope.watchEdits = scope.$watch(function () {
					return scope.item;
				}, function () {

					// TODO Combine styles data into styles array, (throwing away those that match scene or episode defaults?)

					modelSvc.resolveEpisodeEvents(appState.episodeId); // Only needed for layout changes, strictly speaking; would it be more performant to put that in its own watch?
					modelSvc.cache("event", scope.item);
				}, true);

				// Transform changes to form fields for styles into item.styles[]:
				scope.watchStyleEdits = scope.$watch(function () {
					return scope.itemForm;
				}, function () {
					console.log("itemForm:", scope.itemForm);
					var styles = [];
					for (var styleType in scope.itemForm) {
						if (scope.itemForm[styleType]) {
							styles.push(styleType + scope.itemForm[styleType]);
						}
					}
					scope.item.styles = styles;
					console.log(scope.item.styles);
				}, true);

				scope.forcePreview = function () {
					// this is silly but it works.
					appState.editing.fnord = (appState.editing.fnord) ? "" : "fnord";
				};

				scope.setItemTime = function () {
					// triggered when user changes start time in the input field (which is ng-model'ed to appState.time)

					// // TODO ensure within episode duration. If too close to a scene start, match to scene start. If end time not in same scene, change end time to end of scene / beginning of next transcript
					if (scope.item) {
						scope.item.start_time = appState.time;
						// set end time:

						if (scope.item.stop) {
							scope.item.end_time = scope.item.start_time;
						} else {
							// TODO
							// if end time is "auto"
							// 	if transcript set end time to start of next transcript
							// 	if scene set end time to start of next scene or duration of episode
							// 	else set end time to end of scene
							// else
							// 	sanity-check end time (make sure within scene duration, and after start time.)

							// for now, just using end of scene if the currently set end time is invalid.
							modelSvc.resolveEpisodeEvents(appState.episodeId); // in case the item has changed scenes
							if (scope.item.end_time <= scope.item.start_time || scope.item.end_time > modelSvc.events[scope.item.scene_id].end_time) {
								scope.item.end_time = modelSvc.events[scope.item.scene_id].end_time;
							}
						}
					}
					timelineSvc.updateEventTimes(scope.item);

					// Since we've manipulated the timeline directly, need to let timelineSvc keep up with us:
					timelineSvc.seek(appState.time);

				};

				scope.setItemEndTime = function () {
					//console.log("END TIME", scope);
					// TODO ensure within same scene, not before start
					if (scope.item.end_time <= scope.item.start_time || scope.item.end_time > modelSvc.events[scope.item.scene_id].end_time) {
						scope.item.end_time = modelSvc.events[scope.item.scene_id].end_time;
					}
					timelineSvc.updateEventTimes(scope.item);
				};

				// watch for user seeking manually:
				scope.watchSeek = scope.$watch(function () {
					return appState.time;
				}, function (newV, oldV) {
					if (newV === oldV) {
						return;
					}
					if (scope.item) {
						scope.setItemTime();
					}
				});

				scope.dismissalWatcher = $rootScope.$on("player.dismissAllPanels", scope.cancelEdit);

				scope.cancelEdit = function () {
					// hand off to itemEditController (with the original to be restored)
					scope.cancelEventEdit(scope.uneditedItem);
				};

				// TODO eventually move uploadAsset and deleteAsset into controller but they're fine here for now

				scope.uploadAsset = function (files) {
					scope.uploads = awsSvc.uploadFiles(files);

					scope.uploads[0].then(function (data) {
						modelSvc.cache("asset", data.file);

						scope.item.asset = modelSvc.assets[data.file._id];
						// TODO Shouldn't need to be worrying about asset field names here, handle this in modelSvc?
						if (scope.item._type === 'Upload') {
							scope.item.asset_id = data.file._id;
						} else if (scope.item._type === 'Link') {
							scope.item.link_image_id = data.file._id;
						} else if (scope.item._type === 'Annotation') {
							scope.item.annotation_image_id = data.file._id;
						}
						delete scope.uploads;
					}, function () {
						// console.log("FAIL", );
					}, function (update) {
						scope.uploadStatus[0] = update;
					});
				};

				// in SxS, event assets are only ever used in one event, so we can safely delete them.
				// TODO determine which of asset_id, link_image_id, annotation_image_id we're really trying to delete.
				// being lazy for now, since events only ever have one of them
				scope.deleteAsset = function (assetId) {
					if (window.confirm("Are you sure you wish to delete this asset?")) {
						delete modelSvc.events[scope.item._id].asset;
						delete modelSvc.events[scope.item._id].asset_id;
						delete modelSvc.events[scope.item._id].link_image_id;
						delete modelSvc.events[scope.item._id].annotation_image_id;
						delete scope.item.asset;
						delete scope.item.asset_id;
						delete scope.item.link_image_id;
						delete scope.item.annotation_image_id;
						dataSvc.deleteAsset(assetId);
					}
				};
				// In producer, assets might be shared by many events, so we avoid deleting them, instead just detach them from the event:
				scope.detachAsset = function (assetId) {
					delete modelSvc.events[scope.item._id].asset;
					delete scope.item.asset;
					delete scope.item.asset_id;
					delete scope.item.link_image_id;
					delete scope.item.annotation_image_id;
				};

				scope.$on('$destroy', function () {
					scope.watchEdits();
					scope.watchSeek();
					scope.dismissalWatcher();
				});

			},

		};
	});
