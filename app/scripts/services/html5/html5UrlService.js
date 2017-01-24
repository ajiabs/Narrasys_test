/**
 * Created by githop on 11/4/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('html5UrlService', html5UrlService);

	function html5UrlService() {
		var _type = 'html5';
		return {
			type: _type,
			parseMediaSrc: parseMediaSrc,
			canPlay: isHTML5VideoUrl,
			parseInput: parseInput
		};
		/**
		 *
		 * @param mediaSrc
		 * @return mediaObj{type: String, mediaSrcArr: Array<String>}
		 */
		function parseMediaSrc(mediaSrc) {
			return mediaSrc.reduce(function(parsedMediaObj, mediaSrc) {
				if (isHTML5VideoUrl(mediaSrc)) {
					parsedMediaObj.mediaSrcArr.push(mediaSrc);
				}
				return parsedMediaObj;
			}, {type: _type, mediaSrcArr: []});
		}

		function isHTML5VideoUrl(url) {
			return /(.mp4|.m3u8|.webm)/.test(url);
		}

		function parseInput(url) {
			if (isHTML5VideoUrl(url)) {
				return url;
			}
		}

	}

})();
