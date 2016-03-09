/**
 * Created by githop on 12/1/15.
 */

class YoutubePlayerApi {
	constructor($timeout, $q) {
		this.$q = $q;
		this.$timeout = $timeout;
		//this.timesRan = 0;
	}

	load() {
		this.dfd = this.$q.defer();
		//pass the promise where it can be resolved when onYoutubeIframeReady cb fires.
		this.onYouTubeIframeAPIReady(this.dfd);
		if (this.checkForScriptTag(this.dfd) === false) {
			var url = '//www.youtube.com/iframe_api';
			var tag = document.createElement('script');
			tag.src = url;
			tag.id = 'yt-iframe-api';
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		}

		this.cancelIframe = this.$timeout(function () {
			//attempting to call reject after promise resolves results in a noop.
			this.dfd.reject('too long!');
		}.bind(this), 2000);

		return this.dfd.promise;
	};

	onYouTubeIframeAPIReady(dfd) {
		window.onYouTubeIframeAPIReady = function () {
			dfd.resolve();
			this.$timeout.cancel(this.cancelIframe);
		}.bind(this);
	};

	//for testing purposes
	//YoutubePlayerApi.prototype.fails = function(times, dfd) {
	//	if (this.timesRan < times) {
	//		this.timesRan++;
	//		dfd.reject();
	//	}
	//};

	checkForScriptTag(dfd) {
		var scriptTags = document.getElementsByTagName('script');
		var firstIframe = document.getElementById('yt-iframe-api');
		var found = false;
		var i = 0, len = scriptTags.length;
		for (i; i < len; i++) {
			if (scriptTags[i].getAttribute('id') === 'www-widgetapi-script') {
				found = true;
				dfd.resolve();
				break;
			}
		}

		if (firstIframe) {
			return;
		}

		return found;
	}
}

export default YoutubePlayerApi;
