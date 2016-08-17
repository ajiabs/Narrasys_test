/**
 * Created by githop on 7/12/16.
 */
(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittValidImage', ittValidImage);

	function ittValidImage(ittUtils) {
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
					scope.$watch(watchItem, handleChanges, true);
				}

				function watchItem() {
					return scope.item;
				}

				function handleChanges(newVal) {
					var tmplUrl = newVal.templateUrl;
					var asset = newVal.asset;

					switch(tmplUrl) {
						case 'templates/item/link-withimage-notitle.html':
							if (ittUtils.existy(asset)) {
								ngModelCtrl.$setValidity('imageUpload', true);
							} else {
								ngModelCtrl.$setValidity('imageUpload', false);
							}
							break;
						case 'templates/item/link.html':
						case 'templates/item/link-withimage.html':
						case 'templates/item/link-modal-thumb.html':
						case 'templates/item/link-descriptionfirst.html':
						case 'templates/item/link-embed.html':
							ngModelCtrl.$setValidity('imageUpload', true);
							break;
					}
				}

			}
	    };
	}


})();
