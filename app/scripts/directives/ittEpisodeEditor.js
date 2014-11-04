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

				console.log("ittEpisodeEditor");

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
					return scope.langForm;
				}, function () {
					console.log("Scope langForm changed", scope.langForm);
					// TODO ensure a default language is selected
					var languageCount = 0;
					var lastSelectedLanguage = "";
					for (var lang in scope.langForm) {
						console.log("L", lang, scope.langForm[lang]);
						if (scope.langForm[lang]) {
							languageCount++;
							lastSelectedLanguage = lang;
						} else {
							if (scope.episode.defaultLanguage === lang) {
								scope.episode.defaultLanguage = false;
							}
						}
					}
					scope.languageCount = languageCount;
					if (scope.episode.defaultLanguage === false) {
						scope.episode.defaultLanguage = lastSelectedLanguage; // ensure a valid selection
					}

				}, true);

				scope.appState = appState;

				// Angular1.3 dependency: watchGroup
				// Deep-watching the entire episode is not so much with the good performance characteristics
				// so we instead only watch the editable fields 

				// TODO worth doing this in itemEdit as well?
				scope.watchEdits = scope.$watchGroup(
					// I am kind of amazed that using appState.lang works here, these strings must get recalculated every tick
					[
						'episode.title[appState.lang]',
						'episode.description[appState.lang]',
						'episode.templateUrl',
						'episode.navigation_depth'
					],
					function () {
						//						console.log("DETECTED CHANGE");

						modelSvc.deriveEpisode(scope.episode);
						modelSvc.resolveEpisodeContainers(scope.episode._id); // only needed for navigation_depth changes

					});

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
