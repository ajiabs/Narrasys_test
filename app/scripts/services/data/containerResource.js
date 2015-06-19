

angular.module('com.inthetelling.story')
	.factory('Container', ['$resource', 'config', function ($resource, config) {
	return $resource(config.apiDataBaseUrl + '/v3/containers/:containerId', {_id:'@containerId'}, {
		'get': {
			isArray: true
		},
		'update': {
			method: 'PUT'
		}
	});
}]);
