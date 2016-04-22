/**
 *
 * Created by githop on 4/21/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittValidateUrl', ittValidateUrl);

	function ittValidateUrl(youtubeSvc, ittUtils) {
	    return {
			require: '?ngModel',
			link: function link(scope, elm, attrs, ngModel) {
				console.log("ngModel!", ngModel);
				function allowSchemelessUrls() {

					ngModel.$validators.url = function(value) {
						if (!youtubeSvc.isYoutubeUrl(value)) {
							return ngModel.$isEmpty(value) || ittUtils.isValidURL(value);
						} else {
							return value;
						}
					};
				}

				if (ngModel && attrs.type === 'url') {
					allowSchemelessUrls();
				}
			}
		};
	}


})();
