'use strict';

export default function EventTestController($scope, $routeParams, mockSvc, modelSvc, appState) {
	'ngInject';
	console.log('EventTestContrller');

	mockSvc.mockEpisode("ep1");
	appState.episodeId = "ep1";

	appState.product = 'producer';
	appState.lang = "en";

	// $scope.itemId = $routeParams["eventId"];

	$scope.item = modelSvc.events[$routeParams.eventId];

	console.log(modelSvc);

}
