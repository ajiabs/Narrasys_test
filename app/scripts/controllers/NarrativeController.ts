/**
 * Created by githop on 6/13/16.
 */

export default function NarrativeCtrl($scope, narrativeResolve) {
	$scope.narrativeResolve = narrativeResolve.n;
	$scope.customersResolve = narrativeResolve.c;
}


