'use strict';

angular.module('com.inthetelling.player')
	.factory('authSvc', function (config, $routeParams, $http, $q, $location) {
		console.log('authSvc factory');
		var svc = {};

		svc.roles = [];

		svc.userHasRole = function (role) {
			for (var i = 0; i < svc.roles.length; i++) {
				if (svc.roles[i] === role) {
					return true;
				}
			}
			return false;
		};

		svc.authenticate = function () {
			var defer = $q.defer();
			if ($routeParams.key) {
				var nonce = $routeParams.key;
				$location.search('key', null); // hide the param from the url.  reloadOnSearch must be turned off in $routeProvider!
				getAccessToken(nonce).then(function () {
					defer.resolve();
				});
			} else {
				getNonce().then(function (nonce) {
					getAccessToken(nonce).then(function () {
						defer.resolve();
					});
				});
			}
			return defer.promise;
		};

		var getNonce = function () {
			var defer = $q.defer();
			$http.get(config.apiDataBaseUrl + "/v1/get_nonce")
				.success(function (data, status) {
					console.log("get_nonce succeeded: ", data.nonce, status);
					defer.resolve(data.nonce);
				})
				.error(function (data, status) {
					console.error("get_nonce failed:", data, status);
					//TODO throw a proper error message here
					//$rootScope.$emit("error", {
					//	"message": "Authentication failed (get_nonce: " + data || data.error + ")"
					//});
					defer.reject();
				});
			return defer.promise;
		};

		var getAccessToken = function (nonce) {
			console.log("trying getAccessToken with nonce ", nonce);
			var defer = $q.defer();
			$http.get(config.apiDataBaseUrl + "/v1/get_access_token/" + nonce)
				.success(function (data, status) {
					var authToken = data.acess_token;
					svc.roles = data.roles; // TODO: do something useful with roles
					console.log("Roles received:", svc.roles);
					// Set auth header.  TODO: same for put? delete?
					$http.defaults.headers.get = {
						'Authorization': 'Token token="' + authToken + '"'
					};
					defer.resolve(data);
				})
				.error(function (data, status) {
					console.error("get_access_token failed:", data, status);
					// TODO throw a proper error message here
					//$rootScope.$emit("error", {
					//	"message": "Authentication failed (get_access_token: " + data || data.error + ")"
					//});
					defer.reject();
				});
			return defer.promise;
		};

		return svc;
	});
