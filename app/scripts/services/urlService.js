/**
 * Created by githop on 11/3/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('urlService', urlService);

	function urlService(youtubeSvc, html5UrlService) {

		var _urlSubServices = [youtubeSvc, html5UrlService];

		return {
			parseMediaSrcArr: parseMediaSrcArr
		};

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
	}


})();
