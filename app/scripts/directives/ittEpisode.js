'use strict';

angular.module('com.inthetelling.player')
	.directive('ittEpisode', function() {
		return {
			restrict: 'A',
			replace: true,
			templateUrl: "templates/episode/episode.html", // TODO use episode.templateUrl instead
			controller: 'EpisodeController',
			link: function(scope, element, attrs) {
//				console.log('ittEpisode', scope, element, attrs);


			},

		};
	});
