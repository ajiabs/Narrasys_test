'use strict';

angular.module('com.inthetelling.story')
	.factory('authSvc', function (config, $routeParams, $http, $q, $location, appState, errorSvc) {
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
			// Clear these even if the logout call fails (which it will if the token in localStorage has expired).
			// DO NOT clear the Authorization header yet (it's needed for the logout server call)
			localStorage.removeItem(config.localStorageKey);
			document.cookie = 'XSRF-TOKEN=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
			document.cookie = '_tellit-api_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
			appState.user = {};

			$http({
				method: 'GET',
				url: config.apiDataBaseUrl + "/logout"
			}).success(function () {
				delete $http.defaults.headers.common.Authorization; // now it's safe
				$location.path('/');
			}).error(function () {
				delete $http.defaults.headers.common.Authorization; // if it exists at all here, it's definitely invalid
				$location.path('/');
			});
		};

		svc.adminLogin = function (authKey, password) {
			var defer = $q.defer();
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

				$http.defaults.headers.common.Authorization = 'Token token="' + data.access_token + '"';
				data.roles = ["admin"];
				storeUserData(data);
				svc.getCurrentUser(); // get the user id and name async
				defer.resolve(data);
			}).error(function (data) {
				defer.reject(data);
			});
			return defer.promise;
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
				// already logged in
				if (appState.user === {}) {
					console.warn("Have auth header but no appState.user data. Not sure this should ever happen, TODO delete this from authSvc if it continues to not happen");
					appState.user = svc.getStoredUserData();
				}
				defer.resolve();
			} else {
				// check for token in localStorage, try it to see if it's still valid.
				var validStoredData = svc.getStoredUserData();
				if (validStoredData) {
					appState.user = validStoredData;
					// assume good until proven otherwise.
					$http.defaults.headers.common.Authorization = 'Token token="' + validStoredData.access_token + '"';
					svc.getCurrentUser().then(function () {
						console.log("Using token from localStorage");
						defer.resolve();
					}, function () {
						// token in localStorage must have expired. RESET ALL THE THINGS
						delete $http.defaults.headers.common.Authorization;
						localStorage.removeItem(config.localStorageKey);
						document.cookie = 'XSRF-TOKEN=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
						document.cookie = '_tellit-api_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
						appState.user = {};
						// and start again:
						console.log("Discarding expired localStorage, starting again");
						svc.getNonce().then(function (nonce) {
							svc.getAccessToken(nonce).then(function () {
								defer.resolve();
							});
						});
					});
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

		svc.getCurrentUser = function () {
			var defer = $q.defer();
			$http({
					method: 'GET',
					url: config.apiDataBaseUrl + '/show_user'
				})
				.success(function (respData) {
					appState.user._id = respData._id;
					appState.user.name = respData.name;
					storeUserData(appState.user);
					defer.resolve(respData);
				})
				.error(function () {
					defer.reject();
				});
			return defer.promise;
		};

		var storeUserData = function (data) {
			// strip out fields we don't want in localStorage
			var storeMe = {
				access_token: data.access_token,
				customer: config.apiDataBaseUrl.match(/\/\/([^\.]*)./)[1], // Access tokens are per-customer, which is based on subdomain.
				//                                                            Logging in with one customer invalidates the key for any others for the same user,
				//                                                            otherwise we'd just store separate ones per customer
				roles: data.roles
			};
			if (data._id) {
				storeMe._id = data._id;
			}
			if (data.name) {
				storeMe.name = data.name;
			}
			appState.user = storeMe;
			try {
				localStorage.setItem(config.localStorageKey, JSON.stringify(storeMe));
			} catch (e) {}

		};

		svc.getNonce = function () {
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
							defer.reject();
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
			var defer = $q.defer();
			$http.get(config.apiDataBaseUrl + "/v1/get_access_token/" + nonce)
				.success(function (data) {
					storeUserData(data);
					$http.defaults.headers.common.Authorization = 'Token token="' + data.access_token + '"';
					svc.getCurrentUser().then(function () {
						defer.resolve(data);
					});
				})
				.error(function () {
					// console.error("get_access_token failed:", data, status);
					defer.reject();
				});
			return defer.promise;
		};

		return svc;
	});
