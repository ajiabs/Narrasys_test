/**
 * Created by githop on 1/13/17.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('kalturaUrlService', kalturaUrlService);

	function kalturaUrlService() {
		return {
			getKalturaObjectFromEmbedCode: getKalturaObjectFromEmbedCode,
			buildAutoEmbedURLFromKalturaObject: buildAutoEmbedURLFromKalturaObject,
			getKalturaObjectFromAutoEmbedURL: getKalturaObjectFromAutoEmbedURL
		};

		function getKalturaObjectFromEmbedCode(embedCode) {
			var params = {};
			var myArray;
			if (embedCode.substring(0, 7) === "<script" ) {
				myArray = /^.*?src\=.http\:\/\/cdnapi\.kaltura\.com\/p\/(.*?)\/sp\/(.*?)00.*?\/embedIframeJs\/uiconf_id\/(.*?)\/partner_id\/(.*?)\?entry_id\=(.*?)&playerId\=(.*?)&.*/g.exec(embedCode);
				params["partnerId"] = myArray[1];
				params["uiconfId"] = myArray[3];
				params["entryId"] = myArray[5];
				params["uniqueObjId"] = myArray[6];
			} else if (embedCode.substring(0, 4) === "<div" ) {
				myArray = /^.*?kWidget\..*?mbed\(.*?\n*.*?targetId.*?\:.*?\'(.*?)\'.*?\n*.*?wid.*?\:.*?\'_(.*?)\'.*?\n*.*?uiconf_id.*?\:.*?\'(.*?)\'.*?\n*.*?entry_id.*?\:.*?\'(.*?)\'.*?/g.exec(embedCode);
				params["uniqueObjId"] = myArray[1];
				params["partnerId"] = myArray[2];
				params["uiconfId"] = myArray[3];
				params["entryId"] = myArray[4];
			} else if (embedCode.substring(0, 7) === "<iframe" ) {
				myArray = /^.*?src\=.http\:\/\/www\.kaltura\.com\/p\/(.*?)\/sp\/(.*?)00.*?\/embedIframeJs\/uiconf_id\/(.*?)\/partner_id\/(.*?)\?.*?&playerId\=(.*?)&entry_id\=(.*?)\".*/g.exec(embedCode);
				params["partnerId"] = myArray[1];
				params["uiconfId"] = myArray[3];
				params["uniqueObjId"] = myArray[5];
				params["entryId"] = myArray[6];
			} else if (embedCode.substring(0, 7) === "<object" ) {
				myArray = /^.*\n*?.*?id\=.(.*?)\"(.*?\n*)*?data\=.*?http\:\/\/www\.kaltura\.com\/kwidget\/wid\/_(.*?)\/uiconf_id\/(.*?)\/entry_id\/(.*?)\".*/g.exec(embedCode);
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
			var myArray;
			myArray = /^https\:\/\/cdnapisec\.kaltura\.com\/p\/(.*?)\/sp\/(.*?)00.*?\/embedIframeJs\/uiconf_id\/(.*?)\/partner_id\/(.*?)\?entry_id\=(.*?)&playerId\=(.*?)&.*/g.exec(url);
			params["partnerId"] = myArray[1];
			params["uiconfId"] = myArray[3];
			params["entryId"] = myArray[5];
			params["uniqueObjId"] = myArray[6];
			return params;
		}
	}
})();
