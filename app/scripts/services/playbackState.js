/**
 * Created by githop on 10/26/16.
 */


(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('playbackState', playbackState);

	function playbackState() {
		var _time = 0;
		var _timelineState = '';
		var _duration = 0;
		var _hasBeenPlayed = false;
		var _timeMultiplier = 0;
		var _videoType = '';
		var _bufferedPercent = 0;

		return {
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
			setVideoType: setVideoType,
			getBufferedPercent: getBufferedPercent,
			setBufferedPercent: setBufferedPercent,
			reset: reset
		};

		function reset() {
			_time = 0;
			_timelineState = '';
			_duration = 0;
			_hasBeenPlayed = false;
			_timeMultiplier = 0;
			_videoType = '';
			_bufferedPercent = 0;
		}

		function setBufferedPercent(percent) {
			_bufferedPercent = percent;
		}

		function getBufferedPercent() {
			return _bufferedPercent;
		}

		function setVideoType(type) {
			_videoType = type;
		}

		function getVideoType() {
			return _videoType;
		}

		function setTimeMultiplier(x) {
			_timeMultiplier = x;
		}

		function getTimeMultiplier() {
			return _timeMultiplier
		}

		function getTime() {
			return _time;
		}

		function setTime(t) {
			_time = t;
		}

		function getTimelineState() {
			return _timelineState;
		}

		function setTimelineState(state) {
			_timelineState = state;
		}

		function getDuration() {
			return _duration;
		}

		function setDuration(d) {
			_duration = d;
		}

		function getHasBeenPlayed() {
			return _hasBeenPlayed
		}

		function setHasBeenPlayed(bool) {
			_hasBeenPlayed = bool;
		}

	}


})();
