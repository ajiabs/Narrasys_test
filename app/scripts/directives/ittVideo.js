'use strict';

// use only for master asset!

angular.module('com.inthetelling.player')

.directive('ittVideo', function () {

	var uniqueDirectiveID = 0;

	return {
		restrict: 'A',
		replace: true,
		templateUrl: 'templates/video.html',
		controller: 'VideoController',
		scope: {
			video: "=ittVideo"
		},
		link: function (scope, element, attrs) {
			console.log('ittVideo', scope);

			scope.uid = ++uniqueDirectiveID;

			if (scope.video) {
				scope.registerVideo(element);
			} else {
				// episode data not here yet...
				var episodeWatcher = scope.$watch(function () {
					return scope.video;
				}, function (a, b) {
					if (a) {
						scope.registerVideo(element);
						episodeWatcher(); // stop watching;
					}
				});
			}

		},

	};
});
