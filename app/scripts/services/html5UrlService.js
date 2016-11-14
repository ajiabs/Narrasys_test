/**
 * Created by githop on 11/4/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('html5UrlService', html5UrlService);

	function html5UrlService() {
		return {
			parseMediaSrc: parseMediaSrc
		};
		/**
		 *
		 * @param mediaSrc
		 * @return mediaObj{type: String, mediaSrcArr: Array<String>}
		 */
		function parseMediaSrc(mediaSrc) {
			var extensionMatch = /(.mp4|.m3u8|.webm)/;
			return mediaSrc.reduce(function(parsedMediaObj, mediaSrc) {
				if (extensionMatch.test(mediaSrc)) {
					parsedMediaObj.mediaSrcArr.push(mediaSrc);
				}
				return parsedMediaObj;
			}, {type: 'html5', mediaSrcArr: []});

		}
	}

})();
