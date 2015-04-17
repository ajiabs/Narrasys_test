

angular.module('com.inthetelling.story')
	.factory('Template', ['$resource', 'config', function ($resource, config) {
	return $resource(config.apiDataBaseUrl + '/v1/templates/:templateId', {_id:'@templateId'}, {
		'update': {
			method: 'PUT'
		}
	});
}]);
