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
				'<div class="spinner">',
				'	<div class="rotating pie"></div>',
				'	<div class="filler pie"></div>',
				'	<div class="mask"></div>',
				'</div>Loading',
				'</div>'
			].join(' '),
			controller: ['$rootScope', function($rootScope) {
				var ctrl = this;
				ctrl.isLoading = false;

				$rootScope.$on('$routeChangeStart', function() {
					console.log("loading route!");
					ctrl.isLoading = true;
				});

				$rootScope.$on('$routeChangeSuccess', function() {
					console.log('All done!');
					ctrl.isLoading = false;
				});
			}],
			controllerAs: 'routeLoadingCtrl',
			bindToController: true
	    };
	}


})();
