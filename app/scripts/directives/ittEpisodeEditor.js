'use strict';

/* 
TODO: right now we're re-building the episode structure on every keystroke.  That's a tiny bit wasteful of cpu :)  At the very least, debounce input to a more reasonable interval

TODO: some redundancy with ittItemEditor, esp. in the 'styles'.  I expect the episode styling to drift away from the event styling, though, so letting myself repeat myself repeat myself for now
*/

angular.module('com.inthetelling.story')
	.directive('ittEpisodeEditor', function ($rootScope, appState, modelSvc, dataSvc, awsSvc, youtubeSvc) {
		return {
			restrict: 'A',
			replace: true,
			scope: {
				episode: '=ittEpisodeEditor'
			},
			templateUrl: 'templates/producer/episode.html',
			controller: 'EditController',
			link: function (scope) {
				scope.episodeContainerId = modelSvc.episodes[appState.episodeId].container_id;

				var container = modelSvc.containers[scope.episodeContainerId];
				scope.customer = modelSvc.customers[container.customer_id];

				if (scope.episode.master_asset_id && scope.episode.master_asset_id !== "") {
					scope.masterAsset = modelSvc.assets[scope.episode.master_asset_id];
				}
				scope.uploadStatus = [];
				scope.uneditedEpisode = angular.copy(scope.episode); // in case of cancel.   Must be a copy, not the original!
				scope.itemForm = {
					"transition": "",
					"highlight": "",
					"color": "",
					"typography": "",
					"timestamp": ""
				};

				// extract current event styles for the form
				if (scope.episode.styles) {
					for (var styleType in scope.itemForm) {
						for (var i = 0; i < scope.episode.styles.length; i++) {
							if (scope.episode.styles[i].substr(0, styleType.length) === styleType) { // begins with styleType
								scope.itemForm[styleType] = scope.episode.styles[i].substr(styleType.length); // Remainder of scope.episode.styles[i]
							}
						}
					}
				}

				// extract episode languages for the form
				scope.langForm = {};
				for (var j = 0; j < scope.episode.languages.length; j++) {
					scope.langForm[scope.episode.languages[j].code] = true;
				}
				scope.langForm[scope.episode.defaultLanguage] = true;

				scope.languageWatcher = scope.$watch(function () {
					return [scope.langForm, scope.episode.defaultLanguage];
				}, function () {
					var languageCount = 0; // not sure if necessary -- can use languages.length instead? 
					var lastSelectedLanguage = ""; // convenience to stuff into default if the old default is no longer valid
					var newLanguages = []; // will replace the existing episode languages array
					for (var lang in scope.langForm) {
						if (scope.langForm[lang]) {
							languageCount++;
							lastSelectedLanguage = lang;
							newLanguages.push({
								'code': lang
							});
						} else {
							// language not selected; remove it as default if it was one
							if (scope.episode.defaultLanguage === lang) {
								scope.episode.defaultLanguage = false;
							}
						}
					}
					scope.languageCount = languageCount;

					// ensure there is a valid default selection:
					if (scope.episode.defaultLanguage === false) {
						scope.episode.defaultLanguage = lastSelectedLanguage;
					}

					// set the default inside in the languages structure:
					angular.forEach(newLanguages, function (lang) {
						if (lang.code === scope.episode.defaultLanguage) {
							lang.default = true;
						}
					});

					scope.episode.languages = angular.copy(newLanguages);

				}, true);

				// Transform changes to form fields for styles into item.styles[]:
				scope.watchStyleEdits = scope.$watch(function () {
					return scope.itemForm;
				}, function () {
					// console.log("itemForm:", scope.itemForm);
					var styles = [];
					for (var styleType in scope.itemForm) {
						if (scope.itemForm[styleType]) {
							styles.push(styleType + scope.itemForm[styleType]);
						}
					}
					scope.episode.styles = styles;
					modelSvc.deriveEpisode(scope.episode);
					modelSvc.resolveEpisodeEvents(scope.episode._id); // needed for template or style changes
				}, true);

				scope.appState = appState;

				// Angular1.3 dependency: watchGroup
				// Deep-watching the entire episode is not so much with the good performance characteristics so we instead only watch the editable fields 
				// TODO would it be worth using watchGroup in itemEdit as well?
				scope.watchEdits = scope.$watchGroup(
					// I am kind of amazed that using appState.lang works here, these strings must get recalculated every tick
					[
						'episode.templateUrl',
						'episode.title[appState.lang]',
						'episode.description[appState.lang]',
						'episode.navigation_depth'
					],
					function (newVal, oldVal) {
						// console.log("DETECTED CHANGE", newVal, oldVal);
						if (newVal[0] !== oldVal[0]) { // templateUrl
							// Some templates have built-in color and typography selections; need to update them along with the template.
							// TODO This would be a lot simpler if I hadn't chosen such a dumb structure for style info...
							// console.log("Template changed from ", oldVal[0], " to ", newVal[0]);
							// console.log(scope.episode.styles);
							var fixStyles = [];

							//oldVal may be empty if newly created episode
							if (oldVal[0]) {
								var oldCustomer = oldVal[0].match('templates/episode/(.*).html')[1];
								// remove color-oldVal and typography-oldVal.
								angular.forEach(scope.episode.styles, function (style) {
									if (style.toLowerCase() !== "color" + oldCustomer && style.toLowerCase() !== "typography" + oldCustomer) {
										fixStyles.push(style);
									}
								});
							}

							var newCustomer = newVal[0].match('templates/episode/(.*).html')[1];
							// add color-newVal and typography-newVal (only for ep templates that use this:)
							angular.forEach(["eliterate", "gw", "purdue", "usc", "columbia", "columbiabusiness"], function (customer) {
								if (newCustomer === customer) {
									fixStyles.push("color" + customer[0].toUpperCase() + customer.substring(1));
									fixStyles.push("typography" + customer[0].toUpperCase() + customer.substring(1));
								}
							});
							scope.episode.styles = angular.copy(fixStyles);
							// console.log("Updated styles:", scope.episode.styles);

						}

						modelSvc.deriveEpisode(scope.episode);
						modelSvc.resolveEpisodeContainers(scope.episode._id); // only needed for navigation_depth changes
						modelSvc.resolveEpisodeEvents(scope.episode._id); // needed for template or style changes

					}
				);

				scope.dismissalWatcher = $rootScope.$on("player.dismissAllPanels", scope.cancelEdit);

				scope.cancelEdit = function () {
					// hand off to EditController (with the original to be restored)
					scope.cancelEpisodeEdit(scope.uneditedEpisode);
				};
				scope.detachMasterAsset = function () {
					//TODO: removing a property on json object during PUT doesn't delete the property. let's set it to an empty string.
					scope.episode.master_asset_id = null;
					//delete scope.episode.master_asset_id;
					scope.masterAsset = {};

					appState.duration = 0;
					dataSvc.detachMasterAsset(scope.episode);

					modelSvc.deriveEpisode(scope.episode);
					modelSvc.resolveEpisodeContainers(scope.episode._id); // only needed for navigation_depth changes
					modelSvc.resolveEpisodeAssets(scope.episode._id);
				};

				scope.setMasterAsset = function (asset) {
					// console.log("asset:", asset);

					if (!scope.episode.template_id) {
						//set the default template url...
						scope.episode.templateUrl = "templates/episode/episode.html";
					}
					scope.episode.master_asset_id = asset._id;
					scope.masterAsset = asset;

					appState.duration = modelSvc.assets[scope.episode.master_asset_id].duration;
					//Should we store the episode with the new master asset id here, after uploading or selecting or attaching you tube... or should we wait until save?
					//dataSvc.storeEpisode(scope.episode);

					modelSvc.deriveEpisode(scope.episode);
					modelSvc.resolveEpisodeContainers(scope.episode._id); // only needed for navigation_depth changes
					modelSvc.resolveEpisodeAssets(scope.episode._id);
				};
				scope.uploadAsset = function (files) {
					scope.uploads = awsSvc.uploadFiles(files);

					scope.uploads[0].then(function (data) {
						modelSvc.cache("asset", data.file);

						var previousMasterAsset = angular.copy(scope.masterAsset);
						scope.checkAndConfirmDuration(previousMasterAsset, data.file, function (confirmed) {
							if (confirmed) {
								modelSvc.cache("asset", data.file);
								var asset = modelSvc.assets[data.file._id];
								scope.setMasterAsset(asset);
							}
						});
						delete scope.uploads;
					}, function () {
						//console.log("FAIL", );
					}, function (update) {
						scope.uploadStatus[0] = update;
					});
				};

				var createAsset = function (containerId, episodeId, asset) {
					dataSvc.createAsset(scope.episodeContainerId, asset)
						.then(function (data) {
							data.you_tube_url = asset.url;
							data.duration = asset.duration;

							modelSvc.cache("asset", data);
							var modelAsset = modelSvc.assets[data.file._id];
							modelAsset.you_tube_url = asset.url;
							modelAsset.duration = asset.duration;
							scope.setMasterAsset(modelAsset);
							modelSvc.deriveEpisode(scope.episode);
							modelSvc.resolveEpisodeContainers(scope.episode._id); // only needed for navigation_depth changes
							modelSvc.resolveEpisodeAssets(scope.episode._id);
						}, function () {
							console.warn("dataSvc.createAsset failed");
						});
				};
				scope.attachYouTube = function (url) {
					url = youtubeSvc.embeddableYoutubeUrl(url);

					if (typeof (scope.masterAsset) === 'undefined') {
						scope.masterAsset = {};
						scope.masterAsset.urls = {};
					}

					scope.episode.masterAsset = scope.masterAsset;
					modelSvc.deriveEpisode(scope.episode);
					modelSvc.resolveEpisodeContainers(scope.episode._id); // only needed for navigation_depth changes
					modelSvc.resolveEpisodeAssets(scope.episode._id);

					// defined but never used.  Did I remove something that was using this?
					//var hasMasterAsset = (typeof scope.masterAsset !== 'undefined' && typeof scope.masterAsset._id !== 'undefined');

					var youtubeId = youtubeSvc.extractYoutubeId(url);
					if (youtubeId) {
						youtubeSvc.getVideoData(youtubeId)
							.then(function (data) {
								var asset = {}; //createDefaultAsset()
								asset.you_tube_url = asset.url = url;
								asset.duration = data.duration;
								asset.name = data.title;
								asset.description = data.description;
								asset.content_type = "video/x-youtube";
								createAsset(scope.episodeContainerId, scope.episode._id, asset);
							}, function (error) {
								console.log("Error getting duration from youtube:", error);
								var asset = {}; //createDefaultAsset()
								asset.you_tube_url = asset.url = url;
								asset.duration = 0;
								createAsset(scope.episodeContainerId, scope.episode._id, asset);
							});
					} else {
						console.warn("attachYoutube tried to attach a bad URL", url);
					}
				};

				scope.deleteAsset = function (assetId) {
					console.log("deleteAsset", assetId);
					console.warn("NOT IMPLEMENTED");
					//TODO (in Editor / SxS episode this will be useful, since those assets are tied to individual events so can safely be deleted)
				};
				// In producer, assets might be shared by many events, so we avoid deleting them, instead just detach them from the event/episode:
				scope.detachAsset = function () {
					scope.detachMasterAsset();
					scope.showUpload = false;
				};

				scope.selectText = function (event) {
					event.target.select(); // convenience for selecting the episode url
				};

				scope.$on('$destroy', function () {
					scope.watchEdits();
					scope.dismissalWatcher();
					scope.languageWatcher();
					scope.watchStyleEdits();
				});
			}
		};
	});
