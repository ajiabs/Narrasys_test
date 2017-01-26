/**
 * Created by githop on 11/3/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('urlService', urlService);

	function urlService(youtubeUrlService, html5UrlService, kalturaUrlService) {

		var _urlSubServices = {
			youtube: youtubeUrlService,
			html5: html5UrlService,
			kaltura: kalturaUrlService
		};

		return {
			parseMediaSrcArr: parseMediaSrcArr,
			checkUrl: checkUrl,
			getOutgoingUrl: getOutgoingUrl,
			parseInput: parseInput,
			isVideoUrl: isVideoUrl
		};

		function parseInput(input) {
			var type = checkUrl(input).type;
			if (type.length > 0) {
				return _urlSubServices[type].parseInput(input);
			}
		}
		/**
		 *
		 * @param mediaSrcArr
		 * @return parsedMediaSrcArr Array<{type: string, mediaSrcArr: Array<String>}>
		 */
		function parseMediaSrcArr(mediaSrcArr) {
			return Object.keys(_urlSubServices).reduce(function(parsedMediaSrcArr, urlSrv) {
				var parsedMediaSrcObj = _urlSubServices[urlSrv].parseMediaSrc(mediaSrcArr);
				if (parsedMediaSrcObj.mediaSrcArr.length > 0) {
					parsedMediaSrcArr.push(parsedMediaSrcObj);
				}
				return parsedMediaSrcArr;
			}, []);
		}

		function isVideoUrl(url) {
			return checkUrl(url).type.length > 0;
		}

		function checkUrl(url) {
			return Object.keys(_urlSubServices).reduce(function(map, urlSrv) {
				if (_urlSubServices[urlSrv].canPlay(url)) {
					map.type = urlSrv;
				}
				return map;
			}, {type: ''});
		}

		function getOutgoingUrl(url, startAt) {
			var type = checkUrl(url).type;
			if (type.length > 0) {
				return _urlSubServices[type].getOutgoingUrl(url, startAt);
			}

		}
	}


})();
