

angular.module('com.inthetelling.story')
	.factory('Event', ['$resource','config', function ($resource, config) {
	return $resource(config.apiDataBaseUrl + '/v3/events/:eventId', {_id:'@eventId'}, {
		'update': {
			method: 'PUT'
		},
		'create': {
			url: config.apiDataBaseUrl + '/v3/episodes/:episodeId/events/:eventId'
		},
		'getAll' : {
			url: config.apiDataBaseUrl + '/v3/episodes/:episodeId/events',
			method: 'GET',
			isArray: true
		},
		'getSegmentEvents' : {
			url: config.apiDataBaseUrl + '/v3/episode_segments/:segmentId/events',
			method: 'GET',
			isArray: true
		}

	});
}]);
