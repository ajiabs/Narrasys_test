/**
 * Created by githop on 7/12/16.
 */
(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittValidateImage', ittValidateImage);

	function ittValidateImage(ittUtils) {
	    return {
	        restrict: 'EA',
			require: '^ngModel',
			scope: {
	        	item:'=',
			},
			link: function(scope, elm, attrs, ngModelCtrl) {
				if (ngModelCtrl) {
					//set to valid right off the bat, then use $watch below
					//to update validity on subsequent selections.
					ngModelCtrl.$validators.imageUpload = function() {
						return true;
					};
					var linkImgNoTitleTmpl = 'templates/item/link-withimage-notitle.html';
					var linkImgTmpl = 'templates/item/link.html';
					scope.$watch(function(){
						return scope.item;
					}, function(newVal){
						var tmplUrl = newVal.templateUrl;
						var asset = newVal.asset;

						if (tmplUrl === linkImgNoTitleTmpl && ittUtils.existy(asset)) {
							ngModelCtrl.$setValidity('imageUpload', true);
						} else if (tmplUrl === linkImgTmpl) {
							ngModelCtrl.$setValidity('imageUpload', true);
						} else {
							ngModelCtrl.$setValidity('imageUpload', false);
						}
					}, true);
				}

			}
	    };
	}


})();
