

angular.module('com.inthetelling.story')
	.factory('Customer', ['$resource', 'config', function ($resource, config) {
	return $resource(config.apiDataBaseUrl + '/v3/customers/:customerId', {_id:'@customerId'}, {
		'update': {
			method: 'PUT'
		},
		'getAll' : {
			url: '/v3/customers',
			method: 'GET',
			isArray: true
		}
	});
}]);
