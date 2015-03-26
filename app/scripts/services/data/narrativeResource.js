

angular.module('com.inthetelling.story')
	.factory('Narrative', ['$resource', function ($resource) {
	return $resource('/v3/narratives/:narrativeId', {_id:'@narrativeId'}, {
		'update': {
			method: 'PUT'
		},
		'getAll' : {
			url: '/v3/narratives',
			method: 'GET',
			isArray: true
		}
	});
}]);


