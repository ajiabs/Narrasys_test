/**
 * Created by githop on 11/4/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('html5UrlService', html5UrlService);

	function html5UrlService() {
		return {
			parseMediaSrc: parseMediaSrc,
		};

		function parseMediaSrc(mediaSrc) {
			var extensionMatch = /(.mp4|.m3u8|.webm)/;
			return mediaSrc.reduce(function(mediaObj, mediaSrc) {
				if (extensionMatch.test(mediaSrc)) {
					mediaObj.mediaSrcArr.push(mediaSrc);
				}
				return mediaObj;
			}, {type: 'html5', mediaSrcArr: []});

		}
	}


})();
