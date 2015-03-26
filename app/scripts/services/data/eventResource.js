

angular.module('com.inthetelling.story')
	.factory('Event', ['$resource', function ($resource) {
	return $resource('/v3/events/:eventId', {_id:'@eventId'}, {
		'update': {
			method: 'PUT'
		},
		'create': {
			url: '/v3/episodes/:episodeId/events/:eventId'
		},
		'getAll' : {
			url: '/v3/episodes/:episodeId/events',
			method: 'GET',
			isArray: true
		}
	});
}]);
