

angular.module('com.inthetelling.story')
	.factory('Timeline', ['$resource', function ($resource) {
	return $resource('/v3/timelines/:timelineId', {_id:'@timelineId'}, {
		'update': {
			method: 'PUT'
		},
		'create': {
			url: '/v3/narratives/:narrativeId/timelines'
		},
		'save': {
			url: '/v3/narratives/:narrativeId/timelines'
		}
	});
}]);
