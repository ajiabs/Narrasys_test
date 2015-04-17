

angular.module('com.inthetelling.story')
	.factory('Episode', ['$resource', 'config', function ($resource, config) {
	return $resource(config.apiDataBaseUrl + '/v3/episodes/:episodeId', {_id:'@episodeId'}, {
		'update': {
			method: 'PUT'
		},
		'getAll' : {
			url: '/v3/episodes',
			method: 'GET',
			isArray: true
		},
		'getEpisodeForEpisodeSegment' : {
			url: '/v3/episode_segments/:episodeSegmentId/resolve',
			method: 'GET',
			isArray: true
		}
	});
}]);

//TODO: get episode_segments/:id/resolve
// this returns an episode as it is
