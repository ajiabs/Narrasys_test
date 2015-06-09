/*jshint sub:true*/
'use strict';

/* 
TODO: right now we're re-building the episode structure on every keystroke.  That's a tiny bit wasteful of cpu :)  At the very least, debounce input to a more reasonable interval

TODO some youtube-specific functionality in here.  Refactor into youtubeSvc if/when we decide we're going to keep it...

*/

angular.module('com.inthetelling.story')
	.directive('ittItemEditor', function ($rootScope, $timeout, errorSvc, appState, modelSvc, timelineSvc, awsSvc, dataSvc, youtubeSvc) {
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
				var widget;
				scope.startRecordVideo = function () {
					scope.isRecordingVideo = !scope.isRecordingVideo;
					var widgetwidth = 0.8 * (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth);
					if (widgetwidth > 500) {
						widgetwidth = 500;
					}
					widget = new window.YT.UploadWidget('recordWidgetContainer', {
						width: widgetwidth,
						events: {
							'onApiReady': function () {
								// console.log('youtube onApiReady');
								widget.setVideoPrivacy('unlisted');
								var d = new Date();
								var dateString = (d.getMonth() + 1) + "-" + d.getDate() + "-" + d.getFullYear() + " " + (d.getHours() % 12) + ":" + d.getMinutes() + (d.getHours() > 12 ? " pm" : " am");
								widget.setVideoTitle('In The Telling webcam recording: ' + dateString);
								// widget.setVideoDescription();
								// widget.setVideoKeywords();
							},
							'onUploadSuccess': function (ret) {
								var includeYoutubeQSParams = true;
								scope.item.url = youtubeSvc.createEmbedLinkFromYoutubeId(ret.data.videoId, includeYoutubeQSParams);
								scope.isRecordingVideo = false;
								scope.isProcessingVideo = true;

								// onProcessingComplete is not always fired by youtube; force it after 30 secs:
								$timeout(function () {
									console.log("Forcing process-complete");
									scope.isProcessingVideo = false;
								}, 30000);
							},
							'onProcessingComplete': function () {
								// console.log("youtube onProcessingComplete");
								scope.isProcessingVideo = false;
							}
						}
					});
				};

				timelineSvc.pause();
				timelineSvc.seek(scope.item.start_time);

				scope.uploadStatus = [];
				scope.uneditedItem = angular.copy(scope.item); // in case of cancel
				scope.uneditedItem['$$hashKey'] = scope.item['$$hashKey']; //Preserve the hashkey, which angular.copy strips out
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

				// TODO this still needs more performance improvements...
				scope.watchEdits = scope.$watch(function () {
					return scope.item;
				}, function (newItem, oldItem) {
					if (!oldItem) {
						return;
					}

					// FOR DEBUGGING
					/*
										angular.forEach(Object.keys(newItem), function (f) {
											if (f !== '$$hashKey' && !(angular.equals(newItem[f], oldItem[f]))) {
												console.log("CHANGED:", f, newItem[f]);
											}
										});
					*/

					if (newItem.yturl !== oldItem.yturl) {
						scope.item.url = embeddableYTUrl(newItem.yturl);
					}

					// Special cases:
					// if new template is image-fill, 
					// 	set cosmetic to true, itemForm.
					// if old template was image-fill, set cosmetic to false
					// TODO this is fragile, based on template name:
					if (newItem.templateUrl !== oldItem.templateUrl) {
						if (newItem.templateUrl === 'templates/item/image-fill.html') {
							scope.item.cosmetic = true;
							scope.item.layouts = ["windowBg"];
							scope.itemForm.position = "fill";
						}
						if (oldItem.templateUrl === 'templates/item/image-fill.html') {
							scope.item.cosmetic = false;
							scope.item.layouts = ["inline"];
							scope.itemForm.position = "";
							scope.itemForm.pin = "";
						}
					}

					scope.item = modelSvc.deriveEvent(newItem); // Overkill. Most of the time all we need is setLang...

					if (newItem.asset) {
						scope.item.asset.cssUrl = "url('" + newItem.asset.url + "');";
						scope.item.backgroundImageStyle = "background-image: url('" + newItem.asset.url + "');";
					} else {
						delete scope.item.asset;
						delete scope.item.backgroundImageStyle;
					}

					// TODO BUG items moved from one scene to another aren't being included in the new scene until the user hits save,
					// only in discover mode (review mode has no problem.)   This was also the case when we ran resolveEpisodeEvents on every edit, it's an older bug.
					// This _should_ be setting it, and it _is_ triggering sceneController precalculateSceneValues...  IT IS A MYSTERY
					if (newItem.start_time !== oldItem.start_time || newItem.start_time !== oldItem.end_time) {
						modelSvc.resolveEpisodeEvents(appState.episodeId);
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
					var url = youtubeSvc.embeddableYoutubeUrl(origUrl);
					return url ? url : "";
				};

				scope.uploadAsset = function (files) {
					scope.handleAssetUpload(files, scope.episodeContainerId)
						.then(function (file) {
							console.log("Successfully upload asset", file);

							scope.item.asset = modelSvc.assets[file._id];
							// TODO Shouldn't need to be worrying about asset field names here, handle this in modelSvc?
							if (scope.item._type === 'Link') {
								scope.item.link_image_id = file._id;
							} else if (scope.item._type === 'Annotation') {
								scope.item.annotation_image_id = file._id;
							} else {
								scope.item.asset_id = file._id;
							}
							scope.showUploadButtons = false;

						}, function (err) {
							errorSvc.error({
								data: err
							});
							// TODO reset the form
						});
				};

				scope.replaceAsset = function () {
					scope.showUploadButtons = true;
					scope.item.removedAssets = scope.item.removedAssets || [];
					// removedAsset will be used by editController on save to delete the old asset (if we're in editor)
					if (scope.item._type === 'Link') {
						scope.item.removedAssets.push(scope.item.link_image_id);
					} else if (scope.item._type === 'Annotation') {
						scope.item.removedAssets.push(scope.item.annotation_image_id);
					} else {
						scope.item.removedAssets.push(scope.item.asset_id);
					}

					console.log("Will delete:", scope.item.removedAssets);
				};

				// in SxS, event assets are only ever used in one event, so we can safely delete them.
				// We need to first store the event without the asset id, however, or else the server side will block the deletion

				// TODO editController saveEvent shoud check scope.removedAsset and try deleting that event if item.sxs

				// scope.OLDdeleteAsset = function (assetId) {
				// 	if (window.confirm("Are you sure you wish to delete this asset?")) {

				// 		// var assetKey;
				// 		// if (scope.item._type === 'Link') {
				// 		// 	assetKey = "link_image_id";
				// 		// } else if (scope.item._type === 'Annotation') {
				// 		// 	assetKey = "annotation_image_id";
				// 		// } else {
				// 		// 	assetKey = "asset_id";
				// 		// }

				// 		if (scope.item._id !== 'internal:editing') {
				// 			// Server enforces that you can't delete an asset which any event is using. So
				// 			// must store an (unedited) version of event without the asset, 
				// 			// before we can delete the asset itself
				// 			scope.uneditedItem[assetKey] = null;
				// 			delete scope.uneditedItem.asset;
				// 			dataSvc.storeItem(scope.uneditedItem).then(function () {
				// 				dataSvc.deleteAsset(assetId);
				// 			});
				// 		} else {
				// 			// event hasn't been stored yet, so it's safe to just delete the asset
				// 			dataSvc.deleteAsset(assetId);
				// 		}

				// 		delete modelSvc.events[scope.item._id].asset;
				// 		delete scope.item[assetKey];
				// 		delete modelSvc.events[scope.item._id][assetKey];
				// 		delete scope.item.asset;
				// 	}
				// };
				// In producer, assets might be shared by many events, so we avoid deleting them, instead just detach them from the event:
				scope.OLDdetachAsset = function (assetId) {
					if (assetId) {
						delete modelSvc.events[scope.item._id].asset;
						delete scope.item.asset;
						if (scope.item.asset_id === assetId) {
							delete scope.item.asset_id;
						}
						if (scope.item.link_image_id === assetId) {
							delete scope.item.link_image_id;
						}
						if (scope.item.annotation_image_id === assetId) {
							delete scope.item.annotation_image_id;
						}
						dataSvc.detachEventAsset(angular.copy(scope.item), assetId)
							.then(function () {}, function (data) {
								console.error("FAILED TO DETACH ASSET FROM ITEM IN DATASTORE", data);
							});
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
