/**
 * Created by githop on 11/3/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('urlService', urlService);

	function urlService(youtubeSvc, html5UrlService, kalturaUrlService) {

		var _urlSubServices = [youtubeSvc, html5UrlService, kalturaUrlService];

		return {
			parseMediaSrcArr: parseMediaSrcArr,
			checkUrl: checkUrl,
			getOutgoingUrl: getOutgoingUrl,
			parseMasterAssetInput: parseMasterAssetInput
		};


		function parseMasterAssetInput(input) {
			var parsedUrl;
			var urlType = checkUrl(input).type;
			if (urlType.length > 0) {
				switch (urlType) {
					case 'kaltura':
						var getKalturaObjectFromEmbedCode = kalturaUrlService.getKalturaObjectFromEmbedCode;
						var buildAutoEmbedURLFromKalturaObject = kalturaUrlService.buildAutoEmbedURLFromKalturaObject;
						// var getKtObjFromUrl = kalturaUrlService.getKalturaObjectFromAutoEmbedURL;
						parsedUrl = buildAutoEmbedURLFromKalturaObject(getKalturaObjectFromEmbedCode(input), 1024, 768);
						break;
					case 'youtube':
					case 'html5':
						parsedUrl = input;
						break;
				}

				return parsedUrl
			}
		}

		/**
		 *
		 * @param mediaSrcArr
		 * @return parsedMediaSrcArr Array<{type: string, mediaSrcArr: Array<String>}>
		 */
		function parseMediaSrcArr(mediaSrcArr) {
			return _urlSubServices.reduce(function(parsedMediaSrcArr, urlSrv) {
				var parsedMediaSrcObj = urlSrv.parseMediaSrc(mediaSrcArr);
				if (parsedMediaSrcObj.mediaSrcArr.length > 0) {
					parsedMediaSrcArr.push(parsedMediaSrcObj);
				}
				return parsedMediaSrcArr;
			}, []);
		}

		function checkUrl(url) {
			return _urlSubServices.reduce(function(map, urlSrv) {
				if (urlSrv.canPlay(url)) {
					map.type = urlSrv.type;
				}
				return map;
			}, {type: ''});
		}

		function getOutgoingUrl(url, startAt) {
			switch(checkUrl(url).type) {
				case 'youtube':
					url = youtubeSvc.embeddableYoutubeUrl(url, false);
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
