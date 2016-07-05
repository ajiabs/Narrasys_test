/**
 * Created by githop on 12/12/15.
 */

ContainerAssetsTestController.$inject = ['$scope', '$routeParams'];

export default function ContainerAssetsTestController($scope, $routeParams) {
	$scope.containerId = $routeParams.containerId;
}
