/**
 * Created by githop on 5/4/16.
 */

(function () {
	'use strict';

	angular.module('iTT.offline', ['ngMockE2E'])
		.run(function ($httpBackend, stubData, $location) {
			var _origin = '//' + $location.host();

			if ($location.port() !== 443) {
				 _origin += ':' + $location.port();
			}

			$httpBackend.whenGET(_origin + '/show_user').respond(function() {
				return [200, stubData.showUser, {}];
			});

			$httpBackend.whenGET(_origin + '/v1/get_nonce').respond(function() {
				console.log('get nonce');
				return [200, stubData.nonce, {}];
			});


			$httpBackend.whenGET(_origin + '/v1/get_access_token/' + stubData.nonce.nonce).respond(function() {
				console.log("we're golden");
				return [200, stubData.accessToken, {}];
			});


			var assetsByIdRegex = /\/v1\/assets\/(\w+)/;
			$httpBackend.whenGET(assetsByIdRegex).respond(function(method, url, data, headers, keys) {

				return [200, stubData.v1Assets, {}];
			});

			$httpBackend.whenGET(_origin + '/v1/styles').respond(function(method, url, data, headers, keys) {
				return [200, stubData.v1Styles, {}];
			});

			$httpBackend.whenGET(_origin + '/v1/layouts').respond(function(method, url, data, headers, keys) {
				return [200, stubData.v1Layouts, {}];
			});

			$httpBackend.whenGET(_origin + '/v1/templates').respond(function(method, url, data, headers, keys) {
				return [200, stubData.v1Templates, {}];
			});

			var episodeByIdRegex = /\/v3\/episodes\/(\w+)$/;
			$httpBackend.whenGET(episodeByIdRegex).respond(function(method, url, data, headers, keys) {
				var matches = episodeByIdRegex.exec(url);
				var episodeid = matches[1];

				return [200, stubData[episodeid], {}];
			});

			var eventsAllByEpisodeRegex = /\/v3\/episodes\/(\w+)\/events$/;
			$httpBackend.whenGET(eventsAllByEpisodeRegex).respond(function(method, url, data, headers, keys) {
				return [200, stubData.events, {}];
			});

			$httpBackend.whenPOST(_origin + '/v1/assets').respond(function(method, url, data, headers, keys) {
				return [200, stubData.postAsset, {}];
			});

			var containerByIdRegex = /\/v3\/containers\/(\w+)/;
			$httpBackend.whenGET(containerByIdRegex).respond(function(method, url, data, headers, keys) {
				return [200, stubData.container, {}];
			});

			var assetsByContainerIdRegex = /\/v1\/containers\/(\w+)\/assets/;
			$httpBackend.whenGET(assetsByContainerIdRegex).respond(function(method, url, data, headers, keys) {
				return [200, stubData.containerAssets, {}];
			});

			var episodeUserMetricsRegex = /\/v2\/episodes\/(\w+)\/episode_user_metrics/;
			$httpBackend.whenPOST(episodeUserMetricsRegex).respond(function(method, url, data, headers, keys) {
				return [200, {}, {}];
			});

			var episodeEventUserActionsRegex = /\/v2\/episodes\/(\w+)\/event_user_actions$/;
			$httpBackend.whenPOST(episodeEventUserActionsRegex).respond(function(method, url, data, headers, keys) {
				return [200, {}, {}];
			});
		});
})();
