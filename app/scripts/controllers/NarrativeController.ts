/**
 * Created by githop on 6/13/16.
 */
NarrativeCtrl.$inject = ['$scope', 'narrativeResolve'];

export default function NarrativeCtrl($scope, narrativeResolve) {
	$scope.narrativeResolve = narrativeResolve.n;
	$scope.customersResolve = narrativeResolve.c;
}


