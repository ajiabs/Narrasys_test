/**
 * Created by githop on 10/25/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('playbackChannel', playbackChannel);

	function playbackChannel($rootScope) {

		return {
			send: doSend,
			receive: onReceive
		};

		function doSend(str, payload) {
			$rootScope.$emit(str, payload);
		}

		function onReceive(str, handler) {
			$rootScope.$on(str, handler);
		}
	}


})();
