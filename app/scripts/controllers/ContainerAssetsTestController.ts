/**
 * Created by githop on 3/30/17.
 */

angular.module('com.inthetelling.story')
  .controller("ContainerAssetsTestController", ContainerAssetsTestController);

ContainerAssetsTestController.$inject = ['$scope', '$routeParams', 'authSvc'];

function ContainerAssetsTestController($scope, $routeParams, authSvc) {
  $scope.logout = authSvc.logout;
  $scope.containerId = $routeParams.containerId;
}
