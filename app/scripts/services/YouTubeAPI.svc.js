/**
 * Created by githop on 12/1/15.
 */
(function(){
	"use strict";
	angular.module('com.inthetelling.story')
		.service('YoutubePlayerApi', YoutubePlayerApi);

	function YoutubePlayerApi($q, $window, $timeout) {
		this.dfd = $q.defer();
		var self = this;
		$window.onYouTubeIframeAPIReady = function() {
			self.dfd.resolve();
		};

		$timeout(function(){
			//attempting to call reject after promise resolves results in a noop.
			self.dfd.reject(new Error('Too Long!'));
		}, 1500);
	}

	YoutubePlayerApi.prototype.load = function() {
		if (this.checkForScriptTag() === false) {
			var url = '//www.youtube.com/iframe_api';
			var tag = document.createElement('script');
			tag.src = url;
			tag.id  = 'yt-iframe-api';
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		}
		return this.dfd.promise;
	};

	YoutubePlayerApi.prototype.checkForScriptTag = function() {
		var self = this;
		var scriptTags = document.getElementsByTagName('script');
		var found = false;

		var i = 0, len = scriptTags.length;
		for (i; i < len; i++) {
			if (scriptTags[i].getAttribute('id') === 'yt-iframe-api') {
				found = true;
				self.dfd.resolve();
				break;
			}
		}
		return found;
	};
})();
