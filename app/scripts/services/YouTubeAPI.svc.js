/**
 * Created by githop on 12/1/15.
 */
(function(){
	"use strict";
	angular.module('com.inthetelling.story')
		.service('YoutubePlayerApi', YoutubePlayerApi);

	function YoutubePlayerApi($timeout, $q) {
		this.$q = $q;
		this.$timeout = $timeout;
		this.timesRan = 0;
	}

	YoutubePlayerApi.prototype.load = function() {
		this.dfd = this.$q.defer();
		//pass the promise where it can be resolved when onYoutubeIframeReady cb fires.
		//this.fails(1, this.dfd);
		this.onYouTubeIframeAPIReady(this.dfd);
		if (this.checkForScriptTag(this.dfd) === false) {
			var url = '//www.youtube.com/iframe_api';
			var tag = document.createElement('script');
			tag.src = url;
			tag.id  = 'yt-iframe-api';
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		}

		this.cancelIframe = this.$timeout(function(){
			//attempting to call reject after promise resolves results in a noop.
			this.dfd.reject('too long!');
		}.bind(this), 1500);

		return this.dfd.promise;
	};

	YoutubePlayerApi.prototype.onYouTubeIframeAPIReady = function(dfd) {
		window.onYouTubeIframeAPIReady = function() {
			dfd.resolve();
			this.$timeout.cancel(this.cancelIframe);
		}.bind(this);
	};

	YoutubePlayerApi.prototype.fails = function(times, dfd) {
		if (this.timesRan < times) {
			this.timesRan++;
			dfd.reject();
		}
	};

	YoutubePlayerApi.prototype.checkForScriptTag = function(dfd) {
		var scriptTags = document.getElementsByTagName('script');
		var firstIframe = document.getElementById('yt-iframe-api');
		var found = false;
		if(firstIframe) {
			return;
		}
		var i = 0, len = scriptTags.length;
		for (i; i < len; i++) {
			if (scriptTags[i].getAttribute('id') === 'www-widgetapi-script') {
				found = true;
				dfd.resolve();
				break;
			}
		}
		return found;
	};
})();
