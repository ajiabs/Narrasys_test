/*jshint sub:true*/
'use strict';

/*
TODO: right now we're re-building the episode structure on every keystroke.  That's a tiny bit wasteful of cpu :)  At the very least, debounce input to a more reasonable interval


*/

/**
 * @ngDoc directive
 * @name iTT.directive:ittItemEditor
 * @restrict 'A'
 * @scope
 * @description
 * Directive for editing items in the producer / editor interface
 * @requires $rootScope
 * @requires $timeOut
 * @requires errorSvc
 * @requires appState
 * @requires modelSvc
 * @requires timelineSvc
 * @requires awsSvc
 * @requires dataSvc
 * @param {Object} Item object representing an Event object from the DB to be edited.
 */
angular.module('com.inthetelling.story')
	.directive('ittItemEditor', function ($rootScope, $timeout, errorSvc, appState, modelSvc, timelineSvc, awsSvc, dataSvc, selectService) {
		return {
			restrict: 'A',
			replace: true,
			scope: {
				item: '=ittItemEditor'
			},
			templateUrl: 'templates/producer/item.html',
			controller: 'EditController',
			link: function (scope) {

				timelineSvc.pause();
				timelineSvc.seek(scope.item.start_time);

				scope.uploadStatus = [];
				scope.uneditedItem = angular.copy(scope.item); // in case of cancel
				scope.uneditedItem['$$hashKey'] = scope.item['$$hashKey']; //Preserve the hashkey, which angular.copy strips out
				scope.annotators = modelSvc.episodes[appState.episodeId].annotators;
				scope.episodeContainerId = modelSvc.episodes[appState.episodeId].container_id;

				scope.languages = modelSvc.episodes[appState.episodeId].languages;
				scope.itemForm = selectService.setupItemForm(scope.item.styles, 'item');

				if (!scope.item.layouts) {
					console.log('set layouts array to inline');
					scope.item.layouts = ["inline"];
				}

				if (!scope.item.producerItemType) {
					errorSvc.error({
						data: "Don't have a producerItemType for item " + scope.item._id
					});
				}
				// TODO:this breaks when editing sxs items within producer!
				scope.itemEditor = 'templates/producer/item/' + appState.product + '-' + scope.item.producerItemType + '.html';
				scope.appState = appState;

				//watch templateUrl
				// TODO this still needs more performance improvements...

				scope.watchEdits = scope.$watch(function () {
					return scope.item;
				}, function (newItem, oldItem) {
					if (!oldItem) {
						return;
					}

					// console.log('item:', newItem);
					// console.log('templateUrl: ', newItem.templateUrl, '\n', 'layouts: ', newItem.layouts);
					// FOR DEBUGGING
					/*
										angular.forEach(Object.keys(newItem), function (f) {
											if (f !== '$$hashKey' && !(angular.equals(newItem[f], oldItem[f]))) {
												console.log("CHANGED:", f, newItem[f]);
											}
										});
					*/

					if (newItem.chapter_marker === false) {
						timelineSvc.removeEvent(newItem._id);
					}

					// Special cases:
					// if new template is image-fill,
					// 	set cosmetic to true, itemForm.
					// if old template was image-fill, set cosmetic to false
					// TODO this is fragile, based on template name:

					//seeing if we can put this logic below into select service

					//for changes to templateUrl, i.e. picking an option from the drop down.
					// if (newItem.templateUrl !== oldItem.templateUrl) {
                    //
					// 	if (newItem.templateUrl === 'templates/item/image-fill.html') {
					// 		scope.item.cosmetic = true;
					// 		scope.item.layouts = ["windowBg"];
					// 		scope.itemForm.position = "fill";
					// 	}
					// 	if (oldItem.templateUrl === 'templates/item/image-fill.html') {
					// 		scope.item.cosmetic = false;
					// 		scope.item.layouts = ["inline"];
					// 		scope.itemForm.position = "";
					// 		scope.itemForm.pin = "";
					// 	}
					// }


					//newItem is scope.item
					newItem = modelSvc.deriveEvent(newItem); // Overkill. Most of the time all we need is setLang...

					//for producers, if they edit a URL to link-embed template a site that cannot be embedded,
					//change the template URL to 'link'
					if (appState.product === 'producer' && newItem.noEmbed === true && (newItem.templateUrl === 'templates/item/link-embed.html' || newItem.templateUrl === 'templates/item/link-modal-thumb.html')) {
						newItem.templateUrl = 'templates/item/link.html';
					}

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
					// console.count('$watch turn');

					// console.group('itemStyles');
					// console.count('incoming item layouts');
					// console.log('Layouts:', newItem.layouts);
					// console.log('Styles:', newItem.styles);
					// console.log('styleCss:', newItem.styleCss);
					// console.log('\n');
					// console.log('itemForm.pin', scope.itemForm.pin);
					// console.log('itemForm.position', scope.itemForm.position);
					// console.groupEnd('itemStyles');

				}, true);

				// Transform changes to form fields for styles into item.styles[]:
				scope.watchStyleEdits = scope.$watch(function () {
					return scope.itemForm;
				}, function () {
					var styles = [];
					for (var styleType in scope.itemForm) {
						if (scope.itemForm[styleType]) {
							if (styleType === 'position') { // reason #2,142,683 why I should've specced these styles in some more structured way than a simple array
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
					if (currentItem._type === 'Chapter') { return false; }
					//HACK to work around TS-412
					if (!currentScene) {
						console.warn("getNextStartTime called with no scene (because it's being called for a scene event?)", currentItem, items);
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

				scope.assetUploaded = function (assetId) {
					scope.item.asset = modelSvc.assets[assetId];
					// TODO Shouldn't need to be worrying about asset field names here, handle this in modelSvc?
					if (scope.item._type === 'Link') {
						scope.item.link_image_id = assetId;
					} else if (scope.item._type === 'Annotation') {
						scope.item.annotation_image_id = assetId;
					} else {
						scope.item.asset_id = assetId;
					}
					scope.showUploadButtons = false;
					scope.showUploadField = false;
				};

				scope.replaceAsset = function () {
					console.log('replace asset!');
					scope.showUploadButtons = true;

					if (scope.item.sxs) { // we will delete assets atached to editor items, not from producer items
						scope.item.removedAssets = scope.item.removedAssets || [];
						// removedAsset will be used by editController on save to delete the old asset (if we're in editor)
						if (scope.item._type === 'Link') {
							scope.item.removedAssets.push(scope.item.link_image_id);
						} else if (scope.item._type === 'Annotation') {
							scope.item.removedAssets.push(scope.item.annotation_image_id);
						} else {
							scope.item.removedAssets.push(scope.item.asset_id);
						}
					}
				};

				scope.detachAsset = function() {
					// console.log(
					// 	'item:', scope.item,
					// 	'asset:', scope.item.asset,
					// 	'link_image_id:', scope.item.link_image_id,
					// 	'asset_id:', scope.item.asset_id,
					// 	'annotation_image_id:', scope.item.annotation_image_id
					// );
					if (scope.item.asset) {
						switch(scope.item.producerItemType) {
							case 'link':
								scope.item.asset = null;
								scope.item.link_image_id = null;
								scope.item.asset_id = null;
								scope.item.annotation_image_id = null;
								break;
							case 'transcript':
								scope.item.asset = null;
								scope.item.annotation_image_id = null;
								break;
							case 'image':
							case 'question':
							case 'file':
								scope.item.asset = null;
								scope.item.asset_id = null;
								break;
						}
					}
				};

				scope.attachChosenAsset = function (asset_id) {
					// console.log(scope.item);
					var asset = modelSvc.assets[asset_id];
					if (scope.item) {
						scope.item.asset = asset;
						selectService.onSelectChange(scope.item, scope.itemForm);
						if (scope.item._type === 'Upload' || scope.item._type === 'Plugin') {
							scope.item.asset_id = asset_id;
						} else if (scope.item._type === 'Link') {
							scope.item.link_image_id = asset_id;
							scope.item.asset_id = asset_id;
						} else if (scope.item._type === 'Annotation') {
							console.log('you are actually getting here!!');
							scope.item.asset_id = asset_id;
							scope.item.annotation_image_id = asset_id;
						} else {
							console.error("Tried to select asset for unknown item type", scope.item);
						}
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
