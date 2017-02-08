/**
 * Created by githop on 1/13/17.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('kalturaUrlService', kalturaUrlService);

	function kalturaUrlService() {
		var _type = 'kaltura';
		var _mimeType = 'video/x-' + _type;
		return {
			type: _type,
			getMimeType: getMimeType,
			canPlay: isKalturaUrl,
			parseMediaSrc: parseMediaSrc,
			getKalturaObjectFromEmbedCode: getKalturaObjectFromEmbedCode,
			buildAutoEmbedURLFromKalturaObject: buildAutoEmbedURLFromKalturaObject,
			getKalturaObjectFromAutoEmbedURL: getKalturaObjectFromAutoEmbedURL,
			parseInput: parseInput,
			getOutgoingUrl: angular.noop
		};

		function getMimeType() {
			return _mimeType;
		}

		function _isAutoEmbedUrl(str) {
		  return /^(?![<script])(?=.*cdnapi(sec)?.kaltura.com)(?=.*autoembed=true).*/.test(str);
    }

		function parseInput(input) {

      if (_isAutoEmbedUrl(input)) {
        var url = buildAutoEmbedURLFromKalturaObject(getKalturaObjectFromAutoEmbedURL(input), 1024, 768);
        console.log('url', url);
        return url;
        // return buildAutoEmbedURLFromKalturaObject(getKalturaObjectFromAutoEmbedURL(input), 1024, 768);
      }

			return buildAutoEmbedURLFromKalturaObject(getKalturaObjectFromEmbedCode(input), 1024, 768)
		}

		function parseMediaSrc(mediaSrc) {
			return mediaSrc.reduce(function(parsedMediaObj, mediaSrc) {
				if (isKalturaUrl(mediaSrc)) {
					parsedMediaObj.mediaSrcArr.push(mediaSrc);
				}
				return parsedMediaObj;
			}, {type: _type, mediaSrcArr: []});
		}

		function isKalturaUrl(url) {
			return /cdnapi(sec)?.kaltura.com/.test(url);
		}

		function getKalturaObjectFromEmbedCode(embedCode) {
			var params = {};
			var myArray = [];
			var urlParams;
			if (embedCode.substring(0, 7) === "<script") {
				myArray = /^.*?src\=.https?\:\/\/cdnapi(?:sec)\.kaltura\.com\/p\/(.*?)\/sp\/(.*?)00.*?\/embedIframeJs\/uiconf_id\/(.*?)\/partner_id\/(.*?)\?(.*?)\".*/g.exec(embedCode);
				if(myArray != null) {
					params["partnerId"] = myArray[1];
					params["uiconfId"] = myArray[3];
					urlParams = parseUrlParams(myArray[5]);
					params["entryId"] = urlParams.entry_id;
					params["uniqueObjId"] = urlParams.playerId;
				} else {
					params = getKalturaObjectFromDynamicEmbedCode(embedCode);
				}
			} else if (embedCode.substring(0, 4) === "<div") {
				params = getKalturaObjectFromDynamicEmbedCode(embedCode);
			} else if (embedCode.substring(0, 7) === "<iframe") {
				myArray = /^.*?src\=.https?\:\/\/(?:www|cdnapi|cdnapisec)\.kaltura\.com\/p\/(.*?)\/sp\/(.*?)00.*?\/embedIframeJs\/uiconf_id\/(.*?)\/partner_id\/(.*?)\?(.*?)\".*/g.exec(embedCode);
				params["partnerId"] = myArray[1];
				params["uiconfId"] = myArray[3];
				urlParams = parseUrlParams(myArray[5]);
				params["uniqueObjId"] = urlParams.playerId;
				params["entryId"] = urlParams.entry_id;
			} else if (embedCode.substring(0, 7) === "<object") {
				myArray = /^.*\n*?.*?id\=.(.*?)\"(.*?\n*)*?data\=.*?https?\:\/\/(?:www|cdnapi|cdnapisec)\.kaltura\.com\/kwidget\/wid\/_(.*?)\/uiconf_id\/(.*?)\/entry_id\/(.*?)\".*/g.exec(embedCode);
				params["uniqueObjId"] = myArray[1];
				params["partnerId"] = myArray[3];
				params["uiconfId"] = myArray[4];
				params["entryId"] = myArray[5];
			} else {
				console.log("Detected an invalid embed code");
			}
			return params;
		}

		function buildAutoEmbedURLFromKalturaObject(kalturaObject, width, height) {
			return "https://cdnapisec.kaltura.com/p/" +kalturaObject["partnerId"]+ "/sp/" +kalturaObject["partnerId"]+ "00/embedIframeJs/uiconf_id/" +kalturaObject["uiconfId"]+ "/partner_id/" +kalturaObject["partnerId"]+ "?entry_id=" +kalturaObject["entryId"]+ "&playerId=" +kalturaObject["uniqueObjId"]+ "&autoembed=true&width=" +width+ "&height=" +height+ "&"
		}

		function parseUrlParams(urlParamsString) {
			return JSON.parse('{"' + urlParamsString.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
		}

		function getKalturaObjectFromDynamicEmbedCode(embedCode) {
			var params = {};
			var kWidgetParams = JSON.parse(/^(?:.|\n|\r)*?kWidget\..*?mbed\(({(?:.|\n|\r)*})\).*?/g.exec(embedCode)[1]);
			params["uniqueObjId"] = kWidgetParams.targetId;
			params["partnerId"] = kWidgetParams.wid.substring(1);
			params["uiconfId"] = kWidgetParams.uiconf_id;
			params["entryId"] = kWidgetParams.entry_id;
			console.log("PARSED PARAMS", params);
			return params;
		}

		function getKalturaObjectFromAutoEmbedURL(url) {
			var params = {};
			var myArray;
			myArray = /^https\:\/\/cdnapisec\.kaltura\.com\/p\/(.*?)\/sp\/(.*?)00.*?\/embedIframeJs\/uiconf_id\/(.*?)\/partner_id\/(.*?)\?entry_id\=(.*?)&playerId\=(.*?)&.*/g.exec(decodeURIComponent(url));
			params["partnerId"] = myArray[1];
			params["uiconfId"] = myArray[3];
			params["entryId"] = myArray[5];
			params["uniqueObjId"] = myArray[6];
			return params;
		}
	}
})();
