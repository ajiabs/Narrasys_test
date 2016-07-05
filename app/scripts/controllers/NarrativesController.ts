/**
 * Created by githop on 6/14/16.
 */

/**
 * Created by githop on 6/13/16.
 */
NarrativesCtrl.$inject = ['$scope', 'narrativesResolve'];

export default function NarrativesCtrl($scope, narrativesResolve) {
	$scope.narrativesResolve = narrativesResolve.n;
	$scope.customersResolve = narrativesResolve.c;
}

