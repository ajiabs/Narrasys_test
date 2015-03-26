

angular.module('com.inthetelling.story')
	.factory('Container', ['$resource', function ($resource) {
	return $resource('/v3/containers/:containerId', {_id:'@containerId'}, {
		'update': {
			method: 'PUT'
		}
	});
}]);
