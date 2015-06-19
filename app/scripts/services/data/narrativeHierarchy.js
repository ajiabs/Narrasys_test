angular.module('com.inthetelling.story')
	.factory('NarrativeHierarchy', ['$resource', function ($resource) {
	return $resource('/v3/narratives/:narrativeId/resolve', {_id:'@narrativeId'});
}]);
