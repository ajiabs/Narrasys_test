
angular.module('com.inthetelling.story')
	.factory('Group', ['$resource', function ($resource) {
	return $resource('/v3/groups/:groupId', {_id:'@groupId'}, {
		'update': {
			method: 'PUT'
		},
		'getAll' : {
			url: '/v3/groups',
			method: 'GET',
			isArray: true
		}
	});
}]);
