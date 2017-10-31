/**
 * Created by githop on 6/13/16.
 */



NarrativeCtrl.$inject = ['$scope', 'narrativeResolve', 'authSvc'];

export  default function NarrativeCtrl($scope, narrativeResolve, authSvc) {
  $scope.narrativeResolve = narrativeResolve.n;
  $scope.customerResolve = narrativeResolve.c;

  $scope.logout = authSvc.logout.bind(authSvc);
}

