/**
 * Created by githop on 6/14/16.
 */

/**
 * Created by githop on 6/13/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.controller('NarrativesCtrl', NarrativesCtrl);

	function NarrativesCtrl($scope, authSvc,  narrativesResolve) {
		$scope.narrativesResolve = narrativesResolve.n;
		$scope.customersResolve = narrativesResolve.c;
		$scope.logout = authSvc.logout;
	}


})();

