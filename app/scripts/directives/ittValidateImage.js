/**
 * Created by githop on 7/12/16.
 */
(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittValidateImage', ittValidateImage);

	function ittValidateImage() {
	    return {
	        restrict: 'EA',
			require: '^ngModel',
			scope: {
	        	asset:'='
			},
			link: function(scope, elm, attrs, ngModelCtrl) {
				console.log(ngModelCtrl);
				// if (ngModelCtrl) {
				// 	ngModelCtrl.$validators.imageUpload = function(modelVal) {
				// 		console.log('not valid!');
				// 		return false
				// 	}
				// }

			}
	    };
	}


})();
