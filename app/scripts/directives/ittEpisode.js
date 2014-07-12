'use strict';

angular.module('com.inthetelling.player')
	.directive('ittEpisode', function(analyticsSvc) {
		return {
			restrict: 'A',
			replace: true,
			template: '<span ng-include="episode.templateUrl">Loading Item...</span>',
			controller: 'EpisodeController',
			link: function(scope, element, attrs) {
								console.log('ittEpisode', scope, element, attrs);


				// TODO: this will break if the timeline and the episode timeline don't match.
				// TODO: check whether this gets called if multiple episodes are added to the timeline... I'm thinking probably not....
				analyticsSvc.captureEpisodeActivity("episodeLoad");

			},

		};
	});
