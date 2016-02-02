/**
 * Created by githop on 12/1/15.
 */
(function(){
	"use strict";
	angular.module('com.inthetelling.story')
		.service('YoutubePlayerApi', YoutubePlayerApi);

	function YoutubePlayerApi($timeout) {
		this.$timeout = $timeout;
	}

	YoutubePlayerApi.prototype.load = function(dfd) {
		//pass the promise where it can be resolved when onYoutubeIframeReady cb fires.
		this.onYouTubeIframeAPIReady(dfd);

		if (this.checkForScriptTag(dfd) === false) {
			console.log('check for script tag');
			var url = '//www.youtube.com/iframe_api';
			var tag = document.createElement('script');
			tag.src = url;
			tag.id  = 'yt-iframe-api';
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		}

		this.$timeout(function(){
			//attempting to call reject after promise resolves results in a noop.
			dfd.reject('too long!');
		}, 1500);

		return dfd.promise;
	};

	YoutubePlayerApi.prototype.onYouTubeIframeAPIReady = function(dfd) {
		window.onYouTubeIframeAPIReady = function() {
			console.log('onYoutubeIframeAPIReady called');
			dfd.resolve();
		};
	};

	YoutubePlayerApi.prototype.checkForScriptTag = function(dfd) {
		var scriptTags = document.getElementsByTagName('script');
		var found = false;

		var i = 0, len = scriptTags.length;
		for (i; i < len; i++) {
			if (scriptTags[i].getAttribute('id') === 'yt-iframe-api') {
				found = true;
				dfd.resolve();
				break;
			}
		}
		return found;
	};
})();
