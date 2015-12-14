'use strict';

/*For form fields: displays m:ss, sets model as number of seconds. accepts s or m:ss as input. */

export default function sxsInputTime(appState, $rootScope, $timeout, modelSvc, timelineSvc) {
	'ngInject';
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
				$rootScope.$emit('searchReindexNeeded'); // HACK
				return ret;
			};

			scope.format = function (data) {
				// convert model value to view value
				// in a way which is not completely borken, for a change
				// srsly how was that even working before
				var mins = Math.floor(data / 60);
				var secs = Math.round((data % 60) * 100) / 100;
				if (secs < 10) {
					secs = "0" + secs;
				}
				return mins + ":" + secs;
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
			scope.realValue = angular.copy(scope.item[attrs.inputField]); // internal representation of the selected time.  Don't parse or format this, it causes rounding errors
			scope.model = scope.format(scope.realValue); // user input
			scope.appState = appState;
			// console.log("initing inputTime: ", scope.realValue, scope.model);

			scope.scene = (scope.item.type === 'Scene') ? scope.item : modelSvc.events[scope.item.scene_id];
			if (scope.item._type === 'Scene') {
				scope.scene = function () {
					return scope.item;
				};
			} else {
				scope.scene = function () {
					return modelSvc.sceneAtEpisodeTime(scope.item.cur_episode_id, appState.time);
				};
			}

			// TODO this will break in multi-episode timelines
			var episodeDuration = modelSvc.episodes[scope.item.cur_episode_id].masterAsset.duration;

			// Watch for user input, send it to item if different
			scope.$watch(function () {
				return scope.parse(scope.model);
			}, function (t) {
				scope.setTime(t);

				// Stop questions should always have the same start + end
				if (attrs.inputField === 'start_time' && scope.item.stop) {
					scope.item.end_time = t;
				}

			});

			scope.nudge = function (amt) {
				// keep the tooltip panel open:
				$timeout.cancel(tooltipHider);
				elem.find('.inputfield').focus();

				// This ends up triggering setTime twice (it changes scope.model, which triggers the $watch)  Oh Well
				var diff = amt / 30; // pretend 1 frame is always 1/30s for now
				scope.setTime(scope.item[attrs.inputField] + diff);
				if (attrs.inputField === 'start_time') {
					timelineSvc.seek(scope.item[attrs.inputField] + diff);
				}
			};

			scope.setTime = function (t) { // pass in parsed values only!
				// Validation:
				if (t < 0) {
					t = 0;
				}
				if (t > episodeDuration) {
					t = episodeDuration;
				}
				if (scope.item.stop) {
					scope.item.end_time = t;
				}
				scope.realValue = t;
				scope.item[attrs.inputField] = scope.realValue;
				scope.model = scope.format(t);

				scope.item.invalid_end_time = (scope.item.start_time > scope.item.end_time);

			};

			var tooltipHider;
			scope.showTools = function (x) {
				if (x) {
					scope.tooltip = true;
				} else {
					// allow time for clicks before we unload the thing being clicked on:
					tooltipHider = $timeout(function () {
						scope.tooltip = false;
					}, 300);
				}
			};

			scope.isTranscript = function () {
				// TODO
				return false;
			};

		}
	};
}
