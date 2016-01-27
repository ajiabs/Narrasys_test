/**
 * Created by githop on 1/20/16.
 */

(function () {
	'use strict';
	angular.module('com.inthetelling.story')
		.service('playbackChannel', PlaybackChannel);
	/*
		the purpose of the playbackChannel is to act as a pub/sub event dispatch
		for communicating between players and the timeline service.
	 */

	function PlaybackChannel($rootScope) {
		this.$rootScope = $rootScope;
	}

	//called from inside a player
	PlaybackChannel.prototype.doSend = function(name, msg) {
		this.$rootScope.$broadcast(name, {
			msg: msg
		});
	};

	//must be called from a controller
	PlaybackChannel.prototype.onReceive = function(name, cb) {
		this.$rootScope.$on(name, function(evt, msg) {
			cb(evt, msg);
		});
	};

})();
