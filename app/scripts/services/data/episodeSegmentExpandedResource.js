angular.module('com.inthetelling.story')
	.factory('EpisodeSegmentExpanded', ['$resource', 'config', function ($resource, config) {
	return $resource(config.apiDataBaseUrl + '/v3/episode_segments/:segmentId/resolve', {_id:'@segmentId'});
}]);
