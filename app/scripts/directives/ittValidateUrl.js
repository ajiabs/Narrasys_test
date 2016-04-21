/**
 *
 * Created by githop on 4/21/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittValidateUrl', ittValidateUrl);

	function ittValidateUrl() {
	    return {
			require: '?ngModel',
			link: function link(scope, elm, attrs, ngModel) {
				function allowSchemelessUrls() {
					var URL_REGEXP = /^((?:http|ftp)s?:\/\/)(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?(?:\/?|[\/?]\S+)$/i;

					ngModel.$validators.url = function(value) {
						return ngModel.$isEmpty(value) || URL_REGEXP.test(value);
					};
				}

				if (ngModel && attrs.type === 'url') {
					allowSchemelessUrls();
				}
			}
		};
	}


})();
