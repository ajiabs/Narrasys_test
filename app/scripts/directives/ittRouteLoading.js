/**
 * Created by githop on 6/15/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittRouteLoading', ittRouteLoading);

	function ittRouteLoading() {
	    return {
	        restrict: 'EA',
            template: [
				'<div ng-if="routeLoadingCtrl.isLoading" class="loading routeLoading">',
				'	<div class="spinner">',
				'		<div class="rotating pie"></div>',
				'		<div class="filler pie"></div>',
				'		<div class="mask"></div>',
				'	</div><span class="loading__text">Loading</span>',
				'</div>'
			].join(' '),
			controller: function($rootScope, $scope, $timeout, ittUtils, errorSvc) {
				var ctrl = this;
				ctrl.isLoading = false;
				var threshold;

				//only show timer if loading time is longer than 500ms
				$rootScope.$on('$routeChangeStart', function() {
					threshold = $timeout(function() {
						ctrl.isLoading = true;
					}, 500)

				});

				$rootScope.$on('$routeChangeSuccess', function() {
					$timeout.cancel(threshold);
					ctrl.isLoading = false;
				});

				//do not show loading indicator
				//when we have errors
				$scope.$watch(function() {
					return errorSvc.errors.length
				}, function(newVal, oldVal) {
					if (newVal !== oldVal && newVal > 0) {
						$timeout.cancel(threshold);
						ctrl.isLoading = false;
					}
				});
			},
			controllerAs: 'routeLoadingCtrl',
			bindToController: true
	    };
	}


})();
