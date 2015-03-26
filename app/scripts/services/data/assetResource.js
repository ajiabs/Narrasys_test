

angular.module('com.inthetelling.story')
	.factory('Asset', ['$resource', function ($resource) {
	return $resource('/v1/assets/:assetId', {_id:'@assetId'}, {
		'update': {
			method: 'PUT'
		},
		'create': {
			url: '/v3/containers/:containerId/assets'
		},
		'getAll' : {
			url: '/v3/containers/:containerId/assets',
			method: 'GET',
			isArray: true
		}
	});
}]);
