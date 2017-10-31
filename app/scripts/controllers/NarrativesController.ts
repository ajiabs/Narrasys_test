/**
 * Created by githop on 6/14/16.
 */

/**
 * Created by githop on 6/13/16.
 */

NarrativesCtrl.$inject = ['$scope', 'authSvc', 'narrativesResolve'];

export default function NarrativesCtrl($scope, authSvc, narrativesResolve) {
  $scope.customersResolve = narrativesResolve.c;
  $scope.logout = authSvc.logout.bind(authSvc);
}



