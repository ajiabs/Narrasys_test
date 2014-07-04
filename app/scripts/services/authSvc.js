'use strict';

angular.module('com.inthetelling.player')
	.factory('authSvc', function(config, $routeParams, $http, $q, $location, modelSvc) {
		console.log('authSvc factory');
		var svc = {};
		svc.roles = [];

		svc.userHasRole = function(role) {
			for (var i = 0; i < svc.roles.length; i++) {
				if (svc.roles[i] === role) {
					return true;
				}
			}
			return false;
		};

		svc.authenticate = function() {
			var defer = $q.defer();
			if ($routeParams.key) {
				// explicit key in route:
				var nonce = $routeParams.key;
				$location.search('key', null); // hide the param from the url.  reloadOnSearch must be turned off in $routeProvider!
				getAccessToken(nonce).then(function() {
					defer.resolve();
				});
			} else if ($http.defaults.headers.common.Authorization) {
				// already logged in!
				defer.resolve();
			} else {
				// check for token in localStorage, try it to see if it's still valid.
				if (localStorage && localStorage.storyAuth) {
					console.log("Getting access from stored token");
					var storedData = angular.fromJson(localStorage.storyAuth);
					modelSvc.appState.user = storedData;
					$http.defaults.headers.common.Authorization = 'Token token="' + storedData.access_token + '"';
					defer.resolve();
				} else {
					// start from scratch
					getNonce().then(function(nonce) {
						getAccessToken(nonce).then(function() {
							defer.resolve();
						});
					});
				}
			}
			return defer.promise;
		};

		var getNonce = function() {
			var defer = $q.defer();
			$http.get(config.apiDataBaseUrl + "/v1/get_nonce")
				.success(function(data, status) {
					if (data.nonce) {
						defer.resolve(data.nonce);
					} else {
						// Guest acess is not allowed
						if (data.login_url) {
							if (data.login_via_top_window_only) {
								window.top.location.href = data.login_url;
							} else {
								window.location.href = data.login_url;
							}
						}
					}
				})
				.error(function(data, status) {
					console.error("get_nonce failed:", data, status);
					//TODO throw a proper error message here
					//$rootScope.$emit("error", {
					//	"message": "Authentication failed (get_nonce: " + data || data.error + ")"
					//});
					defer.reject();
				});
			return defer.promise;
		};

		var getAccessToken = function(nonce) {
			console.log("trying getAccessToken with nonce ", nonce);
			var defer = $q.defer();
			$http.get(config.apiDataBaseUrl + "/v1/get_access_token/" + nonce)
				.success(function(data, status) {

					// Got user data.  Cache it in localStorage and appState
					modelSvc.appState.user = data;
					try {
						localStorage.setItem("storyAuth", JSON.stringify(data));
					} catch (e) {}

					svc.roles = data.roles; // TODO: do something useful with roles
					$http.defaults.headers.common.Authorization = 'Token token="' + data.access_token + '"';
					defer.resolve(data);
				})
				.error(function(data, status) {
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
