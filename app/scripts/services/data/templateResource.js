

angular.module('com.inthetelling.story')
	.factory('Template', ['$resource', function ($resource) {
	return $resource('/v1/templates/:templateId', {_id:'@templateId'}, {
		'update': {
			method: 'PUT'
		}
	});
}]);
