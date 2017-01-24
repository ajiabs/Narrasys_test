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
			parseInput: parseInput
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

		function checkUrl(url) {
			return Object.keys(_urlSubServices).reduce(function(map, urlSrv) {
				if (_urlSubServices[urlSrv].canPlay(url)) {
					map.type = urlSrv.type;
				}
				return map;
			}, {type: ''});
		}

		function getOutgoingUrl(url, startAt) {
			switch(checkUrl(url).type) {
				case 'youtube':
					url = youtubeUrlService.embeddableYoutubeUrl(url, false);
					if (startAt > 0) {
						url += '&start=' + startAt;
					}
					return url;
				case 'html5':
					if (startAt > 0) {
						url += '#t=' + startAt;
					}
					return url;
			}
		}
	}


})();
