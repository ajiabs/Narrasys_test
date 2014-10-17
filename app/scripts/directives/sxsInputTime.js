'use strict';

/*For form fields: displays m:ss, sets model as number of seconds. accepts s or m:ss as input. */

angular.module('com.inthetelling.story')
	.directive('sxsInputTime', function (appState) {
		return {
			require: 'ngModel',
			link: function (scope, elem, attrs, ngModel) {
				ngModel.$parsers.push(function toModel(data) {
					// console.log("Converting ", data, " to model");
					var ret;
					if (data === undefined || data === '') {
						ret = appState.time;
					} else if (isNaN(data)) {
						var mss = data.split(':');
						if (mss.length === 2) {
							if (isNaN(mss[0])) {
								mss[0] = 0;
							}
							if (isNaN(mss[1])) {
								mss[1] = 0;
							}
							ret = (Number(mss[0]) * 60 + Number(mss[1]));
						} else {
							ret = appState.time;
						}
					} else {
						ret = data;
					}
					//  TODO I want this to trigger the formatter again, but there doesn't seem to be an easy way to do that: ngModel.$render() doesn't
					return ret;

				});

				ngModel.$formatters.push(function toView(data) {
					// convert model value to view value
					var ret = Math.floor(data / 60) + ":" + ("0" + Math.floor(data) % 60).slice(-2);
					var fraction = (data + "").slice(4, 7);
					if (fraction !== "") {
						ret = ret + "." + fraction;
					}
					return ret;

				});
			}
		};
	});
