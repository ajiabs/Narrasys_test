'use strict';

// Force scenes to render scenes sequentially instead of all in one ng-repeat, because it looks faster that way.

// (why don't all ng-repeats do this?  More to the point, why don't all of OUR ng-repeats do this?)

angular.module('com.inthetelling.story')
	.directive('ittReviewMode', function (appState, $timeout) {
		return {
			restrict: 'A',
			replace: false,
			scope: {
				allScenes: '=ittReviewMode'
			},
			templateUrl: '/templates/episode/components/reviewmode-scenes.html',
			link: function (scope) {
				// console.log('ittReviewMode', scope);

				// scope.scenes is what is being displayed right now. scope.allScenes is a reference to the original episode data,
				// which is handy if the episode data hasn't loaded before this gets invoked.
				scope.appState = appState;

				scope.scenes = [];

				var delay = 100; // would be better if there were a way to directly determine whether the prev scene has finished rendering, but this will do for now
				var cur = 0;
				scope.isLoading = true;

				scope.addOne = function () {
					cur++;
					if (scope.allScenes) {
						scope.scenes = scope.allScenes.slice(0, cur);
						if (cur < scope.allScenes.length) {
							$timeout(scope.addOne, delay);
						} else {
							scope.isLoading = false;
							scope.scenes = scope.allScenes; // swap in the original data reference once we think we're done loading, so in case users start adding new scenes later we're not stuck with a partial slice
							console.log("stopping");
						}
					} else {
						// No scenes loaded yet, so wait for them and try again.  (TODO see if this still works ok if users are editing or adding scenes while in review mode)
						var loadWatcher = scope.$watch(function () {
							return scope.allScenes;
						}, function () {
							if (scope.allScenes) {
								loadWatcher();
								scope.addOne();
							}
						});
					}
				};
				$timeout(scope.addOne, delay);
			}
		};
	});
