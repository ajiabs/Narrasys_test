'use strict';

/*For form fields: displays m:ss, sets model as number of seconds. accepts s or m:ss as input. */

angular.module('com.inthetelling.story')
	.directive('sxsInputTime', function (appState) {
		return {
			require: 'ngModel',
			link: function (scope, element, attrs, ngModelController) {
				ngModelController.$parsers.push(function (data) {
					//convert data from view format to model format
					if (isNaN(data)) {
						var mss = data.split(':');
						if (mss.length === 2) {
							return (Number(mss[0]) * 60 + Number(mss[1]));
						} else {
							return appState.time;
						}
					} else {
						return data;
					}

				});

				ngModelController.$formatters.push(function (data) {
					//convert data from model format to view format
					// TODO allow fractions of seconds here
					return Math.floor(data / 60) + ":" + ("0" + Math.floor(data) % 60).slice(-2);

				});
			}
		};
	});
