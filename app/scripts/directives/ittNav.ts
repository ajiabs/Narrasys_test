/**
 * Created by githop on 9/22/16.
 */

const bannerImg = require('../../images/Narrasys_Banner.svg');
const logo = require('../../images/customer/Narrasys-Tree.png');

export default function ittNav() {
  return {
    restrict: 'EA',
    scope: {
      onLogout: '&',
      inPlayer: '=?'
    },
    template: `
      <div>
      	<header class="nav__header">
      		<div class="nav__item">
      			<img ng-if="!$ctrl.inPlayer" ng-src="{{::$ctrl.bannerImg}}"/>
      			<img ng-if="$ctrl.inPlayer" ng-src="{{::$ctrl.logo}}"/>
      		</div>
      		<div class="nav__item" ng-if="$ctrl.appState.user._id">
      			<div class="nav__controls">
      				<div class="navControls__item item--left">
      					<div class="nav__user" ng-click="$ctrl.goToAccounts()">
      						<img ng-src="{{$ctrl.appState.user.avatar || $ctrl.noAvatar}}">
      						<a class="nav__button" ng-if="$ctrl.appState.user">{{$ctrl.appState.user.name}}</a>
      					</div>
      					<a class="nav__button" ng-if="$ctrl.currentPath !== '/projects' && $ctrl.canAccess" href="/#/projects">My Projects</a>
      					<a class="nav__button" ng-if="$ctrl.currentPath !== '/stories' && $ctrl.canAccess" href="/#/stories">My Narratives</a>
      				</div>
      				<div class="navControls__item item--right">
      					<a class="nav__button" ng-click="$ctrl.onLogout()">Log out</a>
      					<a class="nav__button"  ng-if="$ctrl.canAccess" target="_blank" rel="noopener noreferrer" href="https://support.narrasys.com">Help</a>
      				<div>
      			</div>
      		</div>
      	</header>
      </div>
      `,
    controller: ['$location', 'appState', 'authSvc', function ($location, appState, authSvc) {
      var ctrl = this;
      ctrl.currentPath = $location.path();
      ctrl.appState = appState;
      ctrl.goToAccounts = goToAccounts;
      ctrl.bannerImg = bannerImg;
      ctrl.noAvatar = appState.noAvatarImg;
      ctrl.logo = logo;
      authSvc.authenticate().then(function () {
        ctrl.canAccess = authSvc.userHasRole('admin') || authSvc.userHasRole('customer admin') || authSvc.userHasRole('instructor');
      });
      function goToAccounts() {
        if (ctrl.canAccess) {
          $location.url('/account');
        }
      }
    }],
    controllerAs: '$ctrl',
    bindToController: true
  };
}
