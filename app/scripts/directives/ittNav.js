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
	        	onLogout: '&',
				inPlayer: '=?'
			},
			template: [
				'<div>',
				'	<header class="nav__header">',
				'		<div class="nav__item">',
				'			<img ng-if="!$ctrl.inPlayer" src="images/Narrasys_Banner.svg"/>',
				'			<img ng-if="$ctrl.inPlayer" src="images/customer/Narrasys-Tree.png"/>',
				'		</div>',
				'		<div class="nav__item" ng-if="$ctrl.appState.user._id">',
				'			<div class="nav__controls">',
				'				<div class="navControls__item item--left">',
				'					<div class="nav__user" ng-click="$ctrl.goToAccounts()">',
				'						<img ng-src="{{$ctrl.appState.user.avatar || \'/images/no-avatar.gif\'}}">',
				'						<a class="nav__button" ng-if="$ctrl.appState.user">{{$ctrl.appState.user.name}}</a>',
				'					</div>',
				'					<a class="nav__button" ng-if="$ctrl.currentPath !== \'/projects\' && $ctrl.canAccess" href="/#/projects">My Projects</a>',
				'					<a class="nav__button" ng-if="$ctrl.currentPath !== \'/stories\' && $ctrl.canAccess" href="/#/stories">My Narratives</a>',
				'				</div>',
				'				<div class="navControls__item item--right">',
				'					<a class="nav__button" ng-click="$ctrl.onLogout()">Log out</a>',
				'				<div>',
				'			</div>',
				'		</div>',
				'	</header>',
				'</div>'
			].join('\n'),
			controller: ['$location', 'appState', 'authSvc', function($location, appState, authSvc) {
				this.currentPath = $location.path();
				this.appState = appState;
				this.goToAccounts = goToAccounts;
				this.canAccess = authSvc.userHasRole('admin') || authSvc.userHasRole('customer admin');

				function goToAccounts() {
					$location.url('/account');
				}
			}],
			controllerAs: '$ctrl',
			bindToController: true
	    };
	}


})();
