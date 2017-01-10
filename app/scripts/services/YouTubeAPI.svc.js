/**
 * Created by githop on 12/1/15.
 */
(function(){
	"use strict";
	angular.module('com.inthetelling.story')
		.factory('YoutubePlayerApi', YoutubePlayerApi);

	function YoutubePlayerApi($q) {
		return {
			load: load
		};

		function load() {
			return $q(function(resolve) {
				if (typeof(YT) == 'undefined' || typeof(YT.Player) == 'undefined') {
					var url = '//www.youtube.com/iframe_api';
					var tag = document.createElement('script');
					tag.src = url;
					tag.id  = 'yt-iframe-api';
					var firstScriptTag = document.getElementsByTagName('script')[0];
					firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
				} else {
					//we have already fired onYoutubeIframeAPIReady
					resolve();
				}

				window.onYouTubeIframeAPIReady = function() {
					//youtube.com/iframe_api script will invoke
					//this function after it downloads www-widgetapi script.
					resolve();
				}
			});
		}
	}
})();
