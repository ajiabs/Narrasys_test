'use strict';

/* 
TODO: right now we're re-building the episode structure on every keystroke.  That's a tiny bit wasteful of cpu :)  At the very least, debounce input to a more reasonable interval

TODO: some redundancy with ittItemEditor, esp. in the 'styles'.  I expect the episode styling to drift away from the event styling, though, so letting myself repeat myself repeat myself for now


*/

angular.module('com.inthetelling.story')
	.directive('ittEpisodeEditor', function ($rootScope, appState) {
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

				scope.appState = appState;

				scope.watchEdits = scope.$watch(function () {
					return scope.episode;
				}, function () {
					console.log("Editing episode...");
					// // TODO throw away parts of scope.episode.styles that match scene or episode defaults

					// // TODO trigger scene rerender (or see if just triggering its  precalculateSceneValues() would be sufficient instead)
					// // modelSvc.events[scope.episode.scene_id]

					// modelSvc.resolveEpisodeEvents(appState.episodeId); // <-- Only needed for layout changes, strictly speaking
					// modelSvc.cache("event", scope.episode);
				}, true);

				scope.dismissalWatcher = $rootScope.$on("player.dismissAllPanels", scope.cancelEdit);

				scope.cancelEdit = function () {
					// hand off to EditController (with the original to be restored)
					scope.cancelEpisodeEdit(scope.uneditedItem);
				};

				scope.$on('$destroy', function () {
					scope.watchEdits();
					scope.dismissalWatcher();
					scope.watchStyleEdits();
				});
			}
		};
	});
