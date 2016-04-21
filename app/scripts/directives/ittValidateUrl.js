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
				console.log('directive loaded!!', ngModel);
				function allowSchemelessUrls() {
					// Match Django's URL validator, which allows schemeless urls.
					var URL_REGEXP = /^((?:http|ftp)s?:\/\/)(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?(?:\/?|[\/?]\S+)$/i;

					// Silently prefixes schemeless URLs with 'http://' when
					// converting a view value to model value.
					ngModel.$parsers.unshift(function(value) {
						if (!URL_REGEXP.test(value) && URL_REGEXP.test('http://' + value)) {
							return 'http://' + value;
						} else {
							return value;
						}
					});

					ngModel.$validators.url = function(value) {
						return ngModel.$isEmpty(value) || URL_REGEXP.test(value);
					};
				}

				if (ngModel && attrs.type === 'url') {
					console.log("all wired up!!");
					allowSchemelessUrls();
				}
			}
		};
	}


})();
