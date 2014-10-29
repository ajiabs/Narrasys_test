'use strict';

// for quick debugging of templates in dev.  master should just contain an empty stub here

angular.module('com.inthetelling.story')
	.factory('mockSvc', function () {
		var svc = {};

		svc.mockEpisode = function () {
			return;
		};

		return svc;
	});
