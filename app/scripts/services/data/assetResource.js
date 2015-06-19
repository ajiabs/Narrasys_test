

angular.module('com.inthetelling.story')
	.factory('Asset', ['$resource', 'config', function ($resource, config) {
	return $resource(config.apiDataBaseUrl + '/v1/assets/:assetId', {_id:'@assetId'}, {
		'update': {
			method: 'PUT'
		},
		'create': {
			url: config.apiDataBaseUrl + '/v1/containers/:containerId/assets'
		},
		'getAll' : {
			url: config.apiDataBaseUrl + '/v1/containers/:containerId/assets',
			method: 'GET',
			isArray: false
		}
	});
}]);
