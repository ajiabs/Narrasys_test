
angular.module('com.inthetelling.story')
	.factory('NarrativePurchase', ['$resource', function ($resource) {
	return $resource('/v3/narrative_purchases/:narrativePurchaseId', {_id:'@narrativePurchaseId'}, {
		'update': {
			method: 'PUT'
		},
		'create': {
			url: '/v3/users/:userId/narrative_purchases'
		},
		'getAll': {
			url: '/v3/users/:userId/narrative_purchases'
		}
	});
}]);
