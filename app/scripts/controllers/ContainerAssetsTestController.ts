/**
 * Created by githop on 3/30/17.
 */

ContainerAssetsTestController.$inject = ['$scope', '$routeParams', 'authSvc'];

export default function ContainerAssetsTestController($scope, $routeParams, authSvc) {
  $scope.logout = authSvc.logout;
  $scope.containerId = $routeParams.containerId;
}
