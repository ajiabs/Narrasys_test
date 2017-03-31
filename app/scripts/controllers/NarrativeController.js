/**
 * Created by githop on 6/13/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.controller('NarrativeCtrl', NarrativeCtrl);

  NarrativeCtrl.$inject = ['$scope', 'narrativeResolve', 'authSvc'];

	function NarrativeCtrl($scope, narrativeResolve, authSvc) {
		$scope.narrativeResolve = narrativeResolve.n;
		$scope.customerResolve = narrativeResolve.c;

		$scope.logout = authSvc.logout;
	}

})();

