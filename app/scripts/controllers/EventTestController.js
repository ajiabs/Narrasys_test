'use strict';

angular.module('com.inthetelling.story')
  .controller('EventTestController', EventTestController);

EventTestController.$inject = ['$scope', '$routeParams', 'mockSvc', 'modelSvc', 'appState'];

function EventTestController($scope, $routeParams, mockSvc, modelSvc, appState) {
  // console.log('EventTestContrller');

  mockSvc.mockEpisode("ep1");
  appState.episodeId = "ep1";

  appState.product = 'producer';
  appState.lang = "en";

  // $scope.itemId = $routeParams["eventId"];

  $scope.item = modelSvc.events[$routeParams.eventId];

  console.log(modelSvc);

}
