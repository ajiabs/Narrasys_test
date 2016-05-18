/**
 * Created by githop on 5/18/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittPlayer', ittPlayer);

	function ittPlayer() {
	    return {
	        restrict: 'EA',
	        controller: 'PlayerController',
			templateUrl: 'templates/player.html'
	    };
	}


})();
