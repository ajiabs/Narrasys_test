/**
 * Created by githop on 10/26/16.
 */


(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('playbackState', playbackState);

	function playbackState(ittUtils) {
		var _timelineState = '';

		var _states = {};
		var _mainPlayerId;
		var _props =  {
			startAtTime: 0,
			time: 0,
			hasBeenPlayed: false,
			bufferedPercent: 0,
			timeMultiplier: 0
		};
		var _existy = ittUtils.existy;

		return {
			getStartAtTime: getStartAtTime,
			setStartAtTime: setStartAtTime,
			setState: setState,
			getTime: getTime,
			setTime: setTime,
			getTimelineState: getTimelineState,
			setTimelineState: setTimelineState,
			getDuration: getDuration,
			setDuration: setDuration,
			getHasBeenPlayed: getHasBeenPlayed,
			setHasBeenPlayed: setHasBeenPlayed,
			getTimeMultiplier: getTimeMultiplier,
			setTimeMultiplier: setTimeMultiplier,
			getVideoType: getVideoType,
			getBufferedPercent: getBufferedPercent,
			setBufferedPercent: setBufferedPercent,
			reset: reset
		};

		function getStartAtTime(pid) {
			var state = getState(pid);
			if (_existy(state)) {
				return state.startAtTime;
			}
		}

		function setStartAtTime(t, pid) {
			var state = getState(pid);
			if (_existy(state)) {
				state.startAtTime = t;
			}
		}

		function reset(pid) {
			_timelineState = '';
			_states[pid] = angular.extend({}, angular.copy(_props));
		}

		function setState(pid, mainPlayer, type) {
			if (mainPlayer) {
				_mainPlayerId = pid;
			}
			_states[pid] = angular.extend({},  angular.copy(_props), {videoType: type});
		}

		function _setPid(pid) {
			if (_existy(pid)) {
				return pid;
			}
			return _mainPlayerId;
		}

		function getState(pid) {
			return _states[_setPid(pid)];
		}

		function setBufferedPercent(percent, pid) {
			var state = getState(pid);
			if (_existy(state)) {
				state.bufferedPercent = percent;
			}
		}

		function getBufferedPercent(pid) {
			var state = getState(pid);
			if (_existy(state)) {
				return state.bufferedPercent;
			}
		}

		function getVideoType(pid) {
			var state = getState(pid);
			if (_existy(state)) {
				return state.videoType;
			}
		}

		function setTimeMultiplier(x, pid) {
			var state = getState(pid);
			if (_existy(state)) {
				state.timeMultiplier = x;
			}
		}

		function getTimeMultiplier(pid) {
			var state = getState(pid);
			if (_existy(state)) {
				return state.timeMultiplier;
			}
		}

		function getTime(pid) {
			var state = getState(pid);
			if (_existy(state)) {
				return state.time;
			}
		}

		function setTime(t, pid) {
			var state = getState(pid);
			if (_existy(state)) {
				state.time = t;
			}
		}

		function getTimelineState() {
			return _timelineState;
		}

		function setTimelineState(state) {
			_timelineState = state;
		}

		function getDuration(pid) {
			console.trace('get Duration start');
			var state = getState(pid);
			if (_existy(state)) {
				console.log('succs', state.duration);
				return state.duration;
			}
		}

		function setDuration(d, pid) {

			var state = getState(pid);
			console.trace('set duration!', state);
			if (_existy(state)) {
				state.duration = d;
			}
		}

		function getHasBeenPlayed(pid) {
			var state = getState(pid);
			if (_existy(state)) {
				return state.hasBeenPlayed;
			}
		}

		function setHasBeenPlayed(bool, pid) {
			var state = getState(pid);
			if (_existy(state)) {
				state.hasBeenPlayed = bool;
			}
		}

	}


})();
