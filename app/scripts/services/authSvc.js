'use strict';

angular.module('com.inthetelling.story')
	.factory('authSvc', function (config, $routeParams, $http, $q, $location, appState) {
		// console.log('authSvc factory');
		var svc = {};

		svc.userHasRole = function (role) {
			if (appState.user && appState.user.roles) {
				for (var i = 0; i < appState.user.roles.length; i++) {
					if (appState.user.roles[i] === role) {
						return true;
					}
				}
			}
			return false;
		};

		svc.logout = function () {
			$http({
				method: 'GET',
				url: config.apiDataBaseUrl + "/logout"
			}).success(function (data) {
				console.log("Logged out:", data);
				appState.user = {};
				delete $http.defaults.headers.common.Authorization;
				localStorage.removeItem(config.localStorageKey);
				// document.cookie = 'XSRF-TOKEN=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
				// document.cookie = '_tellit-api_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
			}).error(function (data) {
				console.log("Failed to log out:", data);
			});
		};

		svc.adminLogin = function (authKey, password) {
			var loginDefer = $q.defer();
			$http({
				method: 'POST',
				url: config.apiDataBaseUrl + "/auth/identity/callback",
				data: $.param({
					"auth_key": authKey,
					"password": password
				}),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}).success(function (data) {
				// TODO this overlaps with the oauth login path, and leaves some (unnecessary?) info out of localStorage which we usually get from get_nonce.
				// Should consolidate these, and only localStore data we really care about anyway
				var localStorageData = {
					"customer": config.apiDataBaseUrl.match(/\/\/([^\.]*)./)[1],
					"access_token": data.access_token,
					"roles": ["admin"]
				};
				appState.user = localStorageData;
				try {
					localStorage.setItem(config.localStorageKey, JSON.stringify(localStorageData));
				} catch (e) {}
				$http.defaults.headers.common.Authorization = 'Token token="' + data.access_token + '"';

				loginDefer.resolve(data);
			}).error(function (data) {
				console.log("fail", data);
				loginDefer.reject(data);
			});
			return loginDefer.promise;
		};

		var authenticateDefer = $q.defer();
		svc.authenticate = function () {
			console.log("authSvc.authenticate");
			if ($routeParams.key) {
				// explicit key in route:
				var nonce = $routeParams.key;
				$location.search('key', null); // hide the param from the url.  reloadOnSearch must be turned off in $routeProvider!
				svc.getAccessToken(nonce).then(function () {
					authenticateDefer.resolve();
				});
			} else if ($http.defaults.headers.common.Authorization) {
				// already logged in!
				console.log("already logged in, assigning localStorage to user data");
				// TODO need to check how this is affected by customer switching ()
				if (appState.user === {}) {
					appState.user = svc.getStoredUserData();
				}
				authenticateDefer.resolve();
			} else {
				// check for token in localStorage, try it to see if it's still valid.
				var validStoredData = svc.getStoredUserData();

				if (validStoredData) {
					appState.user = validStoredData;
					$http.defaults.headers.common.Authorization = 'Token token="' + validStoredData.access_token + '"';
					authenticateDefer.resolve();
				} else {
					// start from scratch
					console.log("Getting nonce");
					console.log("headers:", $http.defaults.headers.common.Authorization);
					console.log("localStorage:", localStorage.storyKey);
					svc.getNonce().then(function (nonce) {
						svc.getAccessToken(nonce).then(function () {
							authenticateDefer.resolve();
						});
					});
				}
			}
			return authenticateDefer.promise;
		};

		// messy duplication of concerns with svc.authenticate here...
		svc.isAuthenticated = function () {
			if ($http.defaults.headers.common.Authorization) {
				if (appState.user === {}) {
					appState.user = svc.getStoredUserData();
				}
				return true;
			}
			var validStoredData = svc.getStoredUserData();

			if (validStoredData) {
				appState.user = validStoredData;
				$http.defaults.headers.common.Authorization = 'Token token="' + validStoredData.access_token + '"';
				return true;
			}
			return false;
		};

		svc.getStoredUserData = function () {
			var validStoredData;
			if (localStorage && localStorage.getItem(config.localStorageKey)) {
				var storedData = angular.fromJson(localStorage.getItem(config.localStorageKey));
				var currentCustomer = config.apiDataBaseUrl.match(/\/\/([^\.]*)./)[1];
				if (storedData.customer === currentCustomer) {
					validStoredData = storedData;
					if (storedData.roles && storedData.roles.length === 1 && storedData.roles[0] === "guest") {
						validStoredData.isGuestUser = true;
					}
				} else {
					// this token must be invalid, so remove it
					console.log("deleting wrong-customer token: was ", storedData.customer, " should be ", currentCustomer);
					localStorage.removeItem(config.localStorageKey);
					validStoredData = false;
				}
			}
			return validStoredData;

		};

		svc.getNonce = function () {
			console.log("authSvc.getNonce");
			var defer = $q.defer();
			$http.get(config.apiDataBaseUrl + "/v1/get_nonce")
				.success(function (data) {
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
				.error(function () {
					defer.reject();
				});
			return defer.promise;
		};

		svc.getAccessToken = function (nonce) {
			// console.log("trying getAccessToken with nonce ", nonce);
			var defer = $q.defer();
			$http.get(config.apiDataBaseUrl + "/v1/get_access_token/" + nonce)
				.success(function (data) {
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
					$http.defaults.headers.common.Authorization = 'Token token="' + data.access_token + '"';
					defer.resolve(data);
				})
				.error(function () {
					// console.error("get_access_token failed:", data, status);
					defer.reject();
				});
			return defer.promise;
		};

		return svc;
	});
