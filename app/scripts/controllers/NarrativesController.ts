/**
 * Created by githop on 6/14/16.
 */

/**
 * Created by githop on 6/13/16.
 */

export default function NarrativesCtrl($scope, narrativesResolve) {
	'ngInject';
	$scope.narrativesResolve = narrativesResolve.n;
	$scope.customersResolve = narrativesResolve.c;
}

