'use strict';

// Expose the global window.config object as an injectable
angular.module('com.inthetelling.player')
	.factory('config', function () {
		var config = window.config;

		// If we're running on an inthetelling.com domain, need to change the API key to match the current subdomain.  This is for authentication, ask bill
		// This will match *all* of them, for example http://www.foo.bar.inthetelling.com would return "www.foo.bar" as the subdomain
		var currentSubdomain = window.location.href.match(/\/\/(.*)\.inthetelling.com/);
		if (currentSubdomain) { // If that didn't match anything we'll just leave the existing apiData url as is.
			// swap the user's subdomain into the apiDataBaseUrl's subdomain (which I'm trying hard not to hardcode here)
			config.apiDataBaseUrl = config.apiDataBaseUrl.replace(/\/\/.*\.inthetelling.com/,"//"+currentSubdomain[1]+".inthetelling.com");
		} 
		return config;
	});
