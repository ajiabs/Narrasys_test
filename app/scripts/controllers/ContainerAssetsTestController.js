/**
 * Created by githop on 12/12/15.
 */
'use strict';

export default function ContainerAssetsTestController($scope, $routeParams) {
	'ngInject';
	$scope.containerId = $routeParams.containerId;
}
