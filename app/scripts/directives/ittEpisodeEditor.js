'use strict';

/* 
TODO: right now we're re-building the episode structure on every keystroke.  That's a tiny bit wasteful of cpu :)  At the very least, debounce input to a more reasonable interval

TODO: some redundancy with ittItemEditor, esp. in the 'styles'.  I expect the episode styling to drift away from the event styling, though, so letting myself repeat myself repeat myself for now


*/

angular.module('com.inthetelling.story')
	.directive('ittEpisodeEditor', function ($rootScope, appState, modelSvc) {
		return {
			restrict: 'A',
			replace: true,
			scope: {
				episode: '=ittEpisodeEditor'
			},
			templateUrl: 'templates/producer/episode.html',
			controller: 'EditController',
			link: function (scope) {

				// console.log("ittEpisodeEditor");

				scope.uploadStatus = [];
				scope.uneditedEpisode = angular.copy(scope.episode); // in case of cancel
				scope.episodeForm = {
					"transition": "",
					"highlight": "",
					"color": "",
					"typography": "",
					"timestamp": ""
				};

				// extract current event styles for the form
				if (scope.episode.styles) {
					for (var styleType in scope.episodeForm) {
						for (var i = 0; i < scope.episode.styles.length; i++) {
							if (scope.episode.styles[i].substr(0, styleType.length) === styleType) { // begins with styleType
								scope.episodeForm[styleType] = scope.episode.styles[i].substr(styleType.length); // Remainder of scope.episode.styles[i]
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
						console.log("DETECTED CHANGE", newVal, oldVal);
						if (newVal[0] !== oldVal[0]) { // templateUrl
							// Some templates have built-in color and typography selections; need to update them along with the template.
							// TODO This would be a lot simpler if I hadn't chosen such a dumb structure for style info...
							console.log("Template changed from ", oldVal[0], " to ", newVal[0]);
							console.log(scope.episode.styles);
							var fixStyles = [];
							var oldCustomer = oldVal[0].match('templates/episode/(.*).html')[1];
							var newCustomer = newVal[0].match('templates/episode/(.*).html')[1];

							// remove color-oldVal and typography-oldVal.
							angular.forEach(scope.episode.styles, function (style) {
								if (style.toLowerCase() !== "color" + oldCustomer && style.toLowerCase() !== "typography" + oldCustomer) {
									fixStyles.push(style);
								}
							});
							// add color-newVal and typography-newVal (only for ep templates that use this:)
							angular.forEach(["eliterate", "gw", "purdue", "usc", "columbia", "columbiabusiness"], function (customer) {
								if (newCustomer === customer) {
									fixStyles.push("color" + customer[0].toUpperCase() + customer.substring(1));
									fixStyles.push("typography" + customer[0].toUpperCase() + customer.substring(1));
								}
							});
							scope.episode.styles = angular.copy(fixStyles);
							console.log("Updated styles:", scope.episode.styles);

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

				scope.$on('$destroy', function () {
					scope.watchEdits();
					scope.dismissalWatcher();
					scope.languageWatcher();
					// scope.watchStyleEdits();
				});
			}
		};
	});
