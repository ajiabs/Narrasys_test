/**
 * Created by githop on 5/4/16.
 */

(function () {
	'use strict';

	angular.module('iTT.offline', ['ngMockE2E'])
		.run(function ($httpBackend, stubData, $location) {
			var _origin = '//' + $location.host();
			var assetsByIdRegex = /\/v1\/assets\/(\w+)/;
			var episodeByIdRegex = /\/v3\/episodes\/(\w+)$/;
			var eventsAllByEpisodeRegex = /\/v3\/episodes\/(\w+)\/events$/;
			var containerByIdRegex = /\/v3\/containers\/(\w+)/;
			var assetsByContainerIdRegex = /\/v1\/containers\/(\w+)\/assets/;
			var episodeUserMetricsRegex = /\/v2\/episodes\/(\w+)\/episode_user_metrics/;
			var episodeEventUserActionsRegex = /\/v2\/episodes\/(\w+)\/event_user_actions$/;

			if ($location.port() !== 443) {
				 _origin += ':' + $location.port();
			}

			$httpBackend.whenGET(_origin + '/show_user').respond(function() {
				return [200, stubData.showUser, {}];
			});

			$httpBackend.whenGET(_origin + '/v1/get_nonce').respond(function() {
				return [200, stubData.nonce, {}];
			});


			$httpBackend.whenGET(_origin + '/v1/get_access_token/' + stubData.nonce.nonce).respond(function() {
				return [200, stubData.accessToken, {}];
			});

			$httpBackend.whenGET(assetsByIdRegex).respond(function() {
				return [200, stubData.v1Assets, {}];
			});

			$httpBackend.whenGET(_origin + '/v1/styles').respond(function() {
				return [200, stubData.v1Styles, {}];
			});

			$httpBackend.whenGET(_origin + '/v1/layouts').respond(function() {
				return [200, stubData.v1Layouts, {}];
			});

			$httpBackend.whenGET(_origin + '/v1/templates').respond(function() {
				return [200, stubData.v1Templates, {}];
			});

			$httpBackend.whenGET(episodeByIdRegex).respond(function(method, url) {
				var matches = episodeByIdRegex.exec(url);
				var episodeid = matches[1];

				return [200, stubData[episodeid], {}];
			});

			$httpBackend.whenGET(eventsAllByEpisodeRegex).respond(function() {
				return [200, stubData.events, {}];
			});

			$httpBackend.whenPOST(_origin + '/v1/assets').respond(function() {
				return [200, stubData.postAsset, {}];
			});


			$httpBackend.whenGET(containerByIdRegex).respond(function() {
				return [200, stubData.container, {}];
			});

			$httpBackend.whenGET(assetsByContainerIdRegex).respond(function() {
				return [200, stubData.containerAssets, {}];
			});

			$httpBackend.whenPOST(episodeUserMetricsRegex).respond(function() {
				return [200, {}, {}];
			});

			$httpBackend.whenPOST(episodeEventUserActionsRegex).respond(function() {
				return [200, {}, {}];
			});
		});
})();
