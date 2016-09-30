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
				'<div>',
				'	<header class="nav__header">',
				'		<div class="nav__item">',
				'			<img src="images/Narrasys_Banner.svg"/>',
				'		</div>',
				'		<div class="nav__item" ng-if="$ctrl.appState.user._id">',
				'			<div class="nav__controls">',
				'				<div class="navControls__item item--left">',
				'					<div class="nav__user" ng-click="$ctrl.goToAccounts()">',
				'						<img ng-src="{{$ctrl.appState.user.avatar || \'/images/no-avatar.gif\'}}">',
				'						<a class="nav__button" ng-if="$ctrl.appState.user">{{$ctrl.appState.user.name}}</a>',
				'					</div>',
				'					<a class="nav__button" ng-if="$ctrl.currentPath !== \'/projects\'" href="/#/projects">My Projects</a>',
				'					<a class="nav__button" ng-if="$ctrl.currentPath !== \'/stories\'" href="/#/stories">My Narratives</a>',
				'				</div>',
				'				<div class="navControls__item item--right">',
				'					<a class="nav__button" ng-click="$ctrl.onLogout()">Log out</a>',
				'				<div>',
				'			</div>',
				'		</div>',
				'	</header>',
				'</div>'
			].join('\n'),
			controller: ['$location', 'appState', function($location, appState) {
				this.currentPath = $location.path();
				this.appState = appState;
				this.goToAccounts = goToAccounts;

				function goToAccounts() {
					$location.url('/account');
				}
			}],
			controllerAs: '$ctrl',
			bindToController: true
	    };
	}


})();
