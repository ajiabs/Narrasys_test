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
				params["partnerId"] = myArray[1];
				params["uiconfId"] = myArray[3];
				params["entryId"] = myArray[5];
				params["uniqueObjId"] = myArray[6];
			} else if (embedCode.substring(0, 4) === "<div") {
				myArray = /^.*?kWidget\..*?mbed\(.*?\n*.*?targetId.*?\:.*?\'(.*?)\'.*?\n*.*?wid.*?\:.*?\'_(.*?)\'.*?\n*.*?uiconf_id.*?\:.*?\'(.*?)\'.*?\n*.*?.*entry_id.*?\:.*?\'(.*?)\'.*?/g.exec(embedCode);
				params["uniqueObjId"] = myArray[1];
				params["partnerId"] = myArray[2];
				params["uiconfId"] = myArray[3];
				params["entryId"] = myArray[4];
			} else if (embedCode.substring(0, 7) === "<iframe") {
				myArray = /^.*?src\=.https?\:\/\/www\.kaltura\.com\/p\/(.*?)\/sp\/(.*?)00.*?\/embedIframeJs\/uiconf_id\/(.*?)\/partner_id\/(.*?)\?.*?&playerId\=(.*?)&entry_id\=(.*?)\".*/g.exec(embedCode);
				params["partnerId"] = myArray[1];
				params["uiconfId"] = myArray[3];
				params["uniqueObjId"] = myArray[5];
				params["entryId"] = myArray[6];
			} else if (embedCode.substring(0, 7) === "<object") {
				myArray = /^.*\n*?.*?id\=.(.*?)\"(.*?\n*)*?data\=.*?https?\:\/\/www\.kaltura\.com\/kwidget\/wid\/_(.*?)\/uiconf_id\/(.*?)\/entry_id\/(.*?)\".*/g.exec(embedCode);
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



		var damn = 'https://cdnapisec.kaltura.com/p/2166751/sp/216675100/embedIframeJs/uiconf_id/37947851/partner_id/2166751%3Fentry_id=0_aohl11vg%26playerId=kaltura_player_1484679533%26autoembed=true%26width=1024%26height=768%26'
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
	}
})();
