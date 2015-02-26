'use strict';

/*For form fields: displays m:ss, sets model as number of seconds. accepts s or m:ss as input. */

angular.module('com.inthetelling.story')
	.directive('sxsInputTime', function (appState, $timeout, modelSvc) {
		return {
			// require: 'ngModel',
			scope: {
				item: '=sxsInputTime',
			},
			templateUrl: 'templates/producer/inputtime.html',
			link: function (scope, elem, attrs) {

				scope.parse = function (data) {
					// console.log("Converting view ", data, " to model");
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
					// HACK First scene is bumped a bit after the landing screen...
					if (ret < 0.01) {
						ret = 0.01;
					}
					return ret;
				};

				scope.format = function (data) {
					// convert model value to view value
					var ret = Math.floor(data / 60) + ":" + ("0" + Math.floor(data) % 60).slice(-2);
					var fraction = (data + "").slice(4, 6);
					if (fraction !== "") {
						ret = ret + "." + fraction;
					}
					return ret;
				};
				/* These are from back when I was cargo-culting using ngModel directly:
				ngModel.$parsers.push(function toModel(data) {
					return scope.parse(data);
				});

				ngModel.$formatters.push(function toView(data) {
					return scope.format(data);
				});
				*/

				scope.fieldname = angular.copy(attrs.inputField); // start_time or end_time
				scope.model = scope.format(angular.copy(scope.item[attrs.inputField])); // our internal version of the user input
				scope.appState = appState;

				// TODO scope.scene needs to update during editing if the event being edited is moved from one scene to another!
				scope.scene = (scope.item.type === 'Scene') ? scope.item : modelSvc.events[scope.item.scene_id];

				// Watch for user input, send it to item if different
				scope.$watch(function () {
					return scope.parse(scope.model);
				}, function (t) {
					// console.log(m, scope.parse(m), scope.format(m));
					scope.setTime(t);
				});

				scope.setTime = function (t) {
					scope.item[attrs.inputField] = scope.parse(t);
					scope.model = scope.format(t);
				};

				scope.showTools = function (x) {
					if (x) {
						scope.tooltip = true;
					} else {
						// allow time for clicks before we unload the thing being clicked on:
						$timeout(function () {
							scope.tooltip = false;
						}, 300);
					}
				};

				scope.isTranscript = function () {
					// TODO
					return true;
				};

			}
		};
	});
