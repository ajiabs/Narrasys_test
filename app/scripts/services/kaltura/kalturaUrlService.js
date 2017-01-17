/**
 * Created by githop on 1/13/17.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('kalturaUrlService', kalturaUrlService);

	function kalturaUrlService() {
		var _type = 'kaltura';
		return {
			type: _type,
			canPlay: isKalturaUrl,
			parseMediaSrc: parseMediaSrc,
			getKalturaObjectFromEmbedCode: getKalturaObjectFromEmbedCode,
			buildAutoEmbedURLFromKalturaObject: buildAutoEmbedURLFromKalturaObject,
			getKalturaObjectFromAutoEmbedURL: getKalturaObjectFromAutoEmbedURL
		};

		function parseMediaSrc(mediaSrc) {
			return mediaSrc.reduce(function(parsedMediaObj, mediaSrc) {
				if (isKalturaUrl(mediaSrc)) {
					parsedMediaObj.mediaSrcArr.push(mediaSrc);
				}
				return parsedMediaObj;
			}, {type: _type, mediaSrcArr: []})
		}

		function isKalturaUrl(url) {
			return /cdnapisec.kaltura.com/.test(url);
		}

		function getKalturaObjectFromEmbedCode(embedCode) {
			var params = {};
			var myArray = [];
			if (embedCode.substring(0, 7) === "<script") {
				myArray = /^.*?src\=.https?\:\/\/cdnapi(?:sec)\.kaltura\.com\/p\/(.*?)\/sp\/(.*?)00.*?\/embedIframeJs\/uiconf_id\/(.*?)\/partner_id\/(.*?)\?.*entry_id\=(.*?)&playerId\=(.*?)&.*/g.exec(embedCode);
				if(myArray != null) {
					params["partnerId"] = myArray[1];
					params["uiconfId"] = myArray[3];
					params["entryId"] = myArray[5];
					params["uniqueObjId"] = myArray[6];
				} else {
					params = getKalturaObjectFromDynamicEmbedCode(embedCode);
				}
			} else if (embedCode.substring(0, 4) === "<div") {
				params = getKalturaObjectFromDynamicEmbedCode(embedCode);
			} else if (embedCode.substring(0, 7) === "<iframe") {
				myArray = /^.*?src\=.https?\:\/\/(?:www|cdnapi|cdnapisec)\.kaltura\.com\/p\/(.*?)\/sp\/(.*?)00.*?\/embedIframeJs\/uiconf_id\/(.*?)\/partner_id\/(.*?)\?.*?&playerId\=(.*?)&entry_id\=(.*?)\".*/g.exec(embedCode);
				params["partnerId"] = myArray[1];
				params["uiconfId"] = myArray[3];
				params["uniqueObjId"] = myArray[5];
				params["entryId"] = myArray[6];
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

		function getKalturaObjectFromAutoEmbedURL(url) {
			var params = {};
			var myArray = /^https\:\/\/cdnapisec\.kaltura\.com\/p\/(.*?)\/sp\/(.*?)00.*?\/embedIframeJs\/uiconf_id\/(.*?)\/partner_id\/(.*?)\?entry_id\=(.*?)&playerId\=(.*?)&.*/g;
			myArray = myArray.exec(decodeURIComponent(url));
			params["partnerId"] = myArray[1];
			params["uiconfId"] = myArray[3];
			params["entryId"] = myArray[5];
			params["uniqueObjId"] = myArray[6];
			return params;
		}

		function getKalturaObjectFromDynamicEmbedCode(embedCode) {
			var params = {};
			var kWidgetParams = JSON.parse(/^(?:.|\n|\r)*?kWidget\..*?mbed\(({(?:.|\n|\r)*})\).*?/g.exec(embedCode)[1]);
			params["uniqueObjId"] = kWidgetParams.targetId;
			params["partnerId"] = kWidgetParams.wid.substring(1);
			params["uiconfId"] = kWidgetParams.uiconf_id;
			params["entryId"] = kWidgetParams.entry_id;
			return params;
		}
	}
})();
