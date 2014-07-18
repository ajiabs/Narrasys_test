'use strict';

angular.module('com.inthetelling.story')
	.factory('authSvc', function (config, $routeParams, $http, $q, $location, appState) {
		// console.log('authSvc factory');
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
				// explicit key in route:
				var nonce = $routeParams.key;
				$location.search('key', null); // hide the param from the url.  reloadOnSearch must be turned off in $routeProvider!
				svc.getAccessToken(nonce).then(function () {
					defer.resolve();
				});
			} else if ($http.defaults.headers.common.Authorization) {
				// already logged in!
				defer.resolve();
			} else {
				// check for token in localStorage, try it to see if it's still valid.
				var validStoredData;

				if (localStorage && localStorage.getItem(config.localStorageKey)) {
					var storedData = localStorage.getItem(config.localStorageKey);
					var currentCustomer = config.apiDataBaseUrl.match(/\/\/([^\.]*)./)[1];
					if (storedData.customer === currentCustomer) {
						validStoredData = storedData;
					} else {
						// this token must be invalid, so remove it
						console.log("deleting wrong-customer token");
						localStorage.removeItem(config.localStorageKey);
					}
				}

				if (validStoredData) {
					appState.user = validStoredData;
					$http.defaults.headers.common.Authorization = 'Token token="' + validStoredData.access_token + '"';
					defer.resolve();
				} else {
					// start from scratch
					svc.getNonce().then(function (nonce) {
						svc.getAccessToken(nonce).then(function () {
							defer.resolve();
						});
					});
				}
			}
			return defer.promise;
		};

		svc.getNonce = function () {
			var defer = $q.defer();
			$http.get(config.apiDataBaseUrl + "/v1/get_nonce")
				.success(function (data, status) {
					if (data.nonce) {
						defer.resolve(data.nonce);
					} else {
						// Guest access is not allowed
						if (data.login_url) {
							if (data.login_via_top_window_only) {
								window.top.location.href = data.login_url;
							} else {
								window.location.href = data.login_url;
							}
						} else {
							defer.reject();
						}
					}
				})
				.error(function (data, status) {
					defer.reject();
				});
			return defer.promise;
		};

		svc.getAccessToken = function (nonce) {
			// console.log("trying getAccessToken with nonce ", nonce);
			var defer = $q.defer();
			$http.get(config.apiDataBaseUrl + "/v1/get_access_token/" + nonce)
				.success(function (data, status) {
					// Access tokens are per-customer, which is based on subdomain. 
					// Logging in with one customer invalidates the key for any others for the same user, 
					// otherwise we'd just store separate ones per customer
					data.customer = config.apiDataBaseUrl.match(/\/\/([^\.]*)./)[1];
					console.log("localStorage about to store: ", data);
					// Got user data.  Cache it in localStorage and appState
					appState.user = data;
					try {
						localStorage.setItem(config.localStorageKey, JSON.stringify(data));
					} catch (e) {}

					svc.roles = data.roles; // TODO: do something useful with roles
					$http.defaults.headers.common.Authorization = 'Token token="' + data.access_token + '"';
					defer.resolve(data);
				})
				.error(function (data, status) {
					// console.error("get_access_token failed:", data, status);
					defer.reject();
				});
			return defer.promise;
		};

		return svc;
	});
