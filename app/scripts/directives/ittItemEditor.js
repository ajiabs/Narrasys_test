'use strict';

/* 
TODO: right now we're re-building the episode structure on every keystroke.  That's a tiny bit wasteful of cpu :)  At the very least, debounce input to a more reasonable interval
*/

angular.module('com.inthetelling.story')
	.directive('ittItemEditor', function ($rootScope, errorSvc, appState, modelSvc, timelineSvc, awsSvc, dataSvc) {
		return {
			restrict: 'A',
			replace: true,
			scope: {
				item: '=ittItemEditor'
			},
			templateUrl: 'templates/producer/item.html',
			controller: 'EditController',
			link: function (scope) {
				// console.log("ittItemEditor", scope.item);
				scope.uploadStatus = [];
				scope.uneditedItem = angular.copy(scope.item); // in case of cancel
				scope.annotators = modelSvc.episodes[appState.episodeId].annotators;
				scope.episodeContainerId = modelSvc.episodes[appState.episodeId].container_id;

				scope.languages = modelSvc.episodes[appState.episodeId].languages;

				scope.itemForm = {
					"transition": "",
					"highlight": "",
					"color": "",
					"typography": "",
					"timestamp": "",
					"position": "", // for image fills only
					"pin": "" // for image fills only
				};

				if (!scope.item.layouts) {
					scope.item.layouts = ["inline"];
				}

				// extract current event styles for the form
				if (scope.item.styles) {
					for (var styleType in scope.itemForm) {
						for (var i = 0; i < scope.item.styles.length; i++) {
							if (scope.item.styles[i].substr(0, styleType.length) === styleType) { // begins with styleType
								scope.itemForm[styleType] = scope.item.styles[i].substr(styleType.length); // Remainder of scope.item.styles[i]
							}
						}
					}
					// position and pin don't have a prefix because I was dumb when I planned this
					for (var j = 0; j < scope.item.styles.length; j++) {
						if (scope.item.styles[j] === 'contain' || scope.item.styles[j] === 'cover' || scope.item.styles[j] === 'center' || scope.item.styles[j] === 'fill') {
							scope.itemForm.position = scope.item.styles[j];
						}
						if (scope.item.styles[j] === 'tl' || scope.item.styles[j] === 'tr' || scope.item.styles[j] === 'bl' || scope.item.styles[j] === 'br') {
							scope.itemForm.pin = scope.item.styles[j];
						}
					}

				}
				if (!scope.item.producerItemType) {
					errorSvc.error({
						data: "Don't have a producerItemType for item " + scope.item._id
					});
				}
				// TODO:this breaks when editing sxs items within producer!
				scope.itemEditor = 'templates/producer/item/' + appState.product + '-' + scope.item.producerItemType + '.html';

				scope.appState = appState;

				scope.watchEdits = scope.$watch(function () {
					return scope.item;
				}, function () {

					// TODO throw away parts of scope.item.styles that match scene or episode defaults

					if (scope.item.yturl) {
						scope.item.url = embeddableYTUrl(scope.item.yturl);
					}
					//TODO: performance improvement, this resolve gets called a ton.  For example on every letter you type in an Author name.
					modelSvc.resolveEpisodeEvents(appState.episodeId); // <-- Only needed for layout changes, strictly speaking
					modelSvc.cache("event", scope.item);
					// Slight hack to simplify css for image-fill (ittItem does this too, but this is easier than triggering a re-render of the whole item)
					if (scope.item.asset) {
						scope.item.asset.cssUrl = "url('" + scope.item.asset.url + "');";
						scope.item.backgroundImageStyle = "background-image: url('" + scope.item.asset.url + "');";
					}
				}, true);

				// Transform changes to form fields for styles into item.styles[]:
				scope.watchStyleEdits = scope.$watch(function () {
					return scope.itemForm;
				}, function () {

					var styles = [];
					for (var styleType in scope.itemForm) {
						if (scope.itemForm[styleType]) {
							if (styleType === 'position' || styleType === 'pin') { // reason #2,142,683 why I should've specced these styles in some more structured way than a simple array
								styles.push(scope.itemForm[styleType]);
							} else {
								styles.push(styleType + scope.itemForm[styleType]);
							}
						}
					}
					scope.item.styles = styles;

					// Slight hack to simplify css for image-fill (ittItem does this too, but this is easier than triggering a re-render of the whole item)
					if (scope.item.asset) {
						scope.item.asset.cssUrl = "url('" + scope.item.asset.url + "');";
						scope.item.backgroundImageStyle = "background-image: url('" + scope.item.asset.url + "');";
					}
				}, true);

				scope.forcePreview = function () {
					// this is silly but it works.
					appState.editEvent.fnord = (appState.editEvent.fnord) ? "" : "fnord";
				};
				var isTranscript = function (item) {
					if (item._type === 'Annotation' && item.templateUrl.match(/transcript/)) {
						return true;
					} else {
						return false;
					}
				};
				scope.setItemTime = function () {
					// triggered when user changes start time in the input field

					// TODO ensure within episode duration. If too close to a scene start, match to scene start. If end time not in same scene, change end time to end of scene / beginning of next transcript

					if (scope.item._type === 'Scene') {
						modelSvc.resolveEpisodeEvents(appState.episodeId); // reparent events to new scene times if necessary

						// need to update timeline enter/exit for *all* scenes here, since changing one can modify others ...
						timelineSvc.updateSceneTimes(scope.item.episode_id);

					} else if (scope.item.stop) {
						scope.item.end_time = scope.item.start_time;
						modelSvc.resolveEpisodeEvents(appState.episodeId); // redundant but necessary
						timelineSvc.updateEventTimes(scope.item);
					} else {
						modelSvc.resolveEpisodeEvents(appState.episodeId); // in case the item has changed scenes

						// for now, just using end of scene if the currently set end time is invalid.
						if (scope.item.end_time <= scope.item.start_time || scope.item.end_time > modelSvc.events[scope.item.scene_id].end_time) {
							scope.item.end_time = modelSvc.events[scope.item.scene_id].end_time;
						}
						timelineSvc.updateEventTimes(scope.item);
					}

				};
				var sortByStartTime = function (a, b) {
					return a.start_time - b.start_time;
				};

				scope.setItemEndTime = function () {
					if (scope.item.end_time <= scope.item.start_time || scope.item.end_time > modelSvc.events[scope.item.scene_id].end_time) {
						scope.item.end_time = modelSvc.events[scope.item.scene_id].end_time;
					}
					timelineSvc.updateEventTimes(scope.item);
				};
				var getTranscriptItems = function () {
					var episode = modelSvc.episodes[appState.episodeId];
					var allItems = angular.copy(episode.items);
					return allItems.filter(isTranscript);
				};

				var getNextStartTime = function (currentScene, currentItem, items) {

					//HACK to work around TS-412
					if (!currentScene) {
						console.warn("getNextStartTime called with no scene (becuase it's being called for a scene event?)", currentItem, items);
						return false;
					}
					var nextItem;
					var nextStartTime = currentScene.end_time;
					items = items.sort(sortByStartTime);
					for (var i = 0, len = items.length; i < len; i++) {
						if (items[i]._id === currentItem._id) {
							//the next item start_time if less than scen end time
							nextItem = items[i + 1];
							break;
						}
					}
					if (nextItem) {
						if (nextItem.start_time < currentScene.end_time) {
							nextStartTime = nextItem.start_time;
						}
					}
					return nextStartTime;
				};
				var getCurrentScene = function (item) {
					if (item._type === 'Scene') {
						return item;
					} else {
						return modelSvc.events[scope.item.scene_id];
					}
				};
				scope.switchToAutoOrCustom = function (isSwitchingFromCustom) {
					if (isSwitchingFromCustom) {
						var items = isTranscript(scope.item) ? getTranscriptItems() : [];
						scope.item.end_time = getNextStartTime(getCurrentScene(scope.item), scope.item, items);
						scope.customEndTime = false;
					} else {
						scope.customEndTime = true;
					}
				};
				scope.isAutoEndTime = function () {
					var items = isTranscript(scope.item) ? getTranscriptItems() : [];
					var nextStartTime = getNextStartTime(getCurrentScene(scope.item), scope.item, items);
					if (scope.item.end_time === nextStartTime) {
						return true;
					} else {
						return false;
					}

				};
				scope.customEndTime = !scope.isAutoEndTime();
				scope.dismissalWatcher = $rootScope.$on("player.dismissAllPanels", scope.cancelEdit);

				scope.cancelEdit = function () {
					// hand off to EditController (with the original to be restored)
					scope.cancelEventEdit(scope.uneditedItem);
				};

				var embeddableYTUrl = function (origUrl) {
					var getYoutubeID = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
					var ytId = origUrl.match(getYoutubeID);
					if (ytId) {
						return "//www.youtube.com/embed/" + ytId[1];
					} else {
						return "";
					}
				};

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
				// being lazy for now, since events only have one of them
				scope.deleteAsset = function (assetId) {
					if (window.confirm("Are you sure you wish to delete this asset?")) {
						delete modelSvc.events[scope.item._id].asset;
						//TODO for whichever of these matches assetId, delete it
						delete scope.item.asset_id;
						delete modelSvc.events[scope.item._id].asset_id;
						delete scope.item.link_image_id;
						delete modelSvc.events[scope.item._id].link_image_id;
						delete scope.item.annotation_image_id;
						delete modelSvc.events[scope.item._id].annotation_image_id;
						delete scope.item.asset;
						dataSvc.deleteAsset(assetId);
					}
				};
				// In producer, assets might be shared by many events, so we avoid deleting them, instead just detach them from the event:
				scope.detachAsset = function (assetId) {
					if (assetId) {
						delete modelSvc.events[scope.item._id].asset;
						delete scope.item.asset;

						//TODO for whichever of these matches assetId, delete it
						delete scope.item.asset_id;
						delete scope.item.link_image_id;
						delete scope.item.annotation_image_id;

						scope.showUpload = false;
					}
				};

				scope.$on('$destroy', function () {
					scope.watchEdits();
					scope.dismissalWatcher();
					scope.watchStyleEdits();
				});
			}
		};
	});
