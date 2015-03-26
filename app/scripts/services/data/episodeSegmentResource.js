
angular.module('com.inthetelling.story')
	.factory('EpisodeSegment', ['$resource', function ($resource) {
	return $resource('/v3/episode_segments/:episodeSegmentId', {_id:'@episodeSegmentId'}, {
		'update': {
			method: 'PUT'
		},
		'save': {
			url: '/v3/timelines/:timelineId/episode_segments'
		},
		'getAll' : {
			url: '/v3/timelines/:timelineId/episode_segments',
			method: 'GET',
			isArray: true
		}
	});
}]);
