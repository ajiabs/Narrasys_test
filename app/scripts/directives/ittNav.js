/**
 * Created by githop on 9/22/16.
 */
(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittNav', ittNav);

	function ittNav() {
	    return {
	        restrict: 'EA',
			scope: {
	        	onLogout: '&'
			},
			template: [
				'<div class="ancillaryNav">',
				'	<a class="button" ng-if="$ctrl.currentPath !== \'/stories\'" href="/#/stories">Narratives</a>',
				'	<a class="button" href="/#/account">Account</a>',
				'	<a class="button" ng-if="$ctrl.currentPath !== \'/projects\'" href="/#/projects">Projects</a>',
				'	<a class="button" ng-click="$ctrl.onLogout()">Log out</a>',
				'</div>'
			].join('\n'),
			controller: ['$location', function($location) {
				this.currentPath = $location.path();
			}],
			controllerAs: '$ctrl',
			bindToController: true
	    };
	}


})();
