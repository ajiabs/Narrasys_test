/**
 * Created by githop on 12/1/15.
 */
(function(){
	"use strict";
	angular.module('com.inthetelling.story')
		.service('YoutubePlayerApi', YoutubePlayerApi);

	function YoutubePlayerApi($q, $window) {
		this.dfd = $q.defer();
		var self = this;
		$window.onYouTubeIframeAPIReady = function() {
			self.dfd.resolve();
		};
	}


	YoutubePlayerApi.prototype.load = function() {
		var url = '//www.youtube.com/iframe_api';

		var tag = document.createElement('script');
		tag.src = url;
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		return this.dfd.promise;
	};
})();
