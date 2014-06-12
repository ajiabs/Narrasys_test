'use strict';

angular.module('com.inthetelling.player')
	.directive('ittEpisode', function(modelSvc, analyticsSvc) {
		return {
			restrict: 'A',
			replace: true,
			templateUrl: "templates/episode/episode.html", // TODO use episode.templateUrl instead
			controller: 'EpisodeController',
			link: function(scope, element, attrs) {
				//				console.log('ittEpisode', scope, element, attrs);


				// TODO: this will break if the timeline and the episode timeline don't match.
				// TODO: check whether this gets called if multiple episodes are added to the timeline... I'm thinking probably not....
				analyticsSvc.captureActivity("episodeLoad");

			},

		};
	});
