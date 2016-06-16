/**
 * Created by githop on 6/13/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.controller('NarrativeCtrl', NarrativeCtrl);

	function NarrativeCtrl($scope, narrativeResolve) {
		$scope.narrativeResolve = narrativeResolve;
	}

})();

