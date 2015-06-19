

angular.module('com.inthetelling.story')
	.factory('Customer', ['$resource', function ($resource) {
	return $resource('/v3/customers/:customerId', {_id:'@customerId'}, {
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
