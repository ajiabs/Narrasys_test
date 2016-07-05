'use strict';
EventTestController.$inject = ['$scope', '$routeParams', 'mockSvc', 'modelSvc', 'appState'];
export default function EventTestController($scope, $routeParams, mockSvc, modelSvc, appState) {

	mockSvc.mockEpisode("ep1");
	appState.episodeId = "ep1";

	appState.product = 'producer';
	appState.lang = "en";

	// $scope.itemId = $routeParams["eventId"];

	$scope.item = modelSvc.events[$routeParams.eventId];

	console.log(modelSvc);

}
