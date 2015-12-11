/**
 * Created by githop on 12/11/15.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittLoading', ittLoading);

	function ittLoading() {
		return {
			scope: true,
			templateUrl: 'templates/loading.html'
		};
	}
})();
