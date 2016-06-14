/**
 * Created by githop on 4/22/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.service('ittUtils', IttUtils);

	function IttUtils() { }

	IttUtils.prototype = {
		getSubdomain: getSubdomain,
		existy: existy,
		truthy: truthy,
		generateUUID: generateUUID,
		isValidURL: isValidURL
	};

	function getSubdomain(host) {
		if (host.indexOf('.') < 0) {
			return null;
		} else {
			return host.split('.')[0];
		}
	}

	function existy(x) {
		return x != null; //jshint ignore:line
	}

	function truthy (x) {
		return (x !== false && existy(x));
	}

	function generateUUID() {
		//js hint does not like the bitwise operators in use below.
		/* jshint ignore:start */
		var d = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
		});
		return uuid;
		/* jshint ignore:end */
	}

	function isValidURL(url) {
		var URL_REGEXP = /^(((?:http)s?:\/\/)|(?:\/\/))(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?(?:\/?|[\/?]\S+)$/i;
		return URL_REGEXP.test(url);
	}



})();
