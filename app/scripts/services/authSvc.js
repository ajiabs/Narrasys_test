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
				$location.path('/').search({
					logout: 1
				});
			}).error(function () {
				delete $http.defaults.headers.common.Authorization; // if it exists at all here, it's definitely invalid
				$location.path('/').search({
					logout: 1
				});
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
				$http.defaults.headers.common.Authorization = 'Token token="' + data.access_token + '"';
				storeUserData(data);
				svc.getCurrentUser().then(function () {
					defer.resolve(data);
				});

			}).error(function (data) {
				defer.reject(data);
			});
			return defer.promise;
		};

		/*

			authentication paths:
				header + user data: resolve immediately
				header + no user data: call show_user (this shouldn't be possible, but I coded it in at some point for some reason...)
				key in url param: call get_nonce
				token in localStorage: set header, call show_user
				nothing: get_nonce

		*/

		svc.authenticate = function () {
			var defer = $q.defer();
			if ($http.defaults.headers.common.Authorization) {
				if (appState.user) {
					// Have header and user; all done.
					defer.resolve();
				} else {
					// begin dubious code block
					console.warn("Have auth header but no appState.user data. Not sure this should ever happen, TODO delete this from authSvc if it continues to not happen");
					svc.getCurrentUser().then(function () {
						defer.resolve();
					}, function () {
						return svc.authenticateViaNonce();
					});
					// end of dubious code block
				}
			} else if ($routeParams.key) {
				// Have key in route
				var nonce = $routeParams.key;
				$location.search('key', null); // hide the param from the url.  reloadOnSearch must be turned off in $routeProvider!
				return svc.getAccessToken(nonce);
			} else {
				var token = svc.getStoredToken();
				if (token) {
					// have localStorage token; try it
					$http.defaults.headers.common.Authorization = 'Token token="' + token + '"';
					svc.getCurrentUser().then(function () {
						// token worked
						defer.resolve();
					}, function () {
						// token expired; clear everything and start over
						localStorage.removeItem(config.localStorageKey);
						document.cookie = 'XSRF-TOKEN=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
						document.cookie = '_tellit-api_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
						appState.user = {};
						return svc.authenticateViaNonce();
					});
				} else {
					// no login info at all, start from scratch
					return svc.authenticateViaNonce();
				}
			}
			return defer.promise;
		};

		svc.authenticateViaNonce = function () {
			var defer = $q.defer();
			svc.getNonce().then(function (nonce) {
				svc.getAccessToken(nonce).then(function () {
					defer.resolve();
				});
			});
			return defer.promise;
		};

		svc.getStoredToken = function () {
			var storedData = {};
			if (localStorage && localStorage.getItem(config.localStorageKey)) {

				// temporary: clear old key
				localStorage.removeItem('storyKey');

				storedData = angular.fromJson(localStorage.getItem(config.localStorageKey));
				var currentCustomer = config.apiDataBaseUrl.match(/\/\/([^\.]*)./)[1];
				if (storedData.customer !== currentCustomer) {
					console.log("deleting wrong-customer token: was ", storedData.customer, " should be ", currentCustomer);
					localStorage.removeItem(config.localStorageKey);
					storedData = {};
				}
			}
			return storedData.token || false;
		};

		svc.getCurrentUser = function () {
			var defer = $q.defer();
			$http({
					method: 'GET',
					url: config.apiDataBaseUrl + '/show_user'
				})
				.success(function (respData) {
					storeUserData(respData);
					defer.resolve(respData);
				})
				.error(function () {
					defer.reject();
				});
			return defer.promise;
		};

		var storeUserData = function (data) {
			// updates appState.user and localStorage
			var user = {
				access_token: data.access_token || data.authentication_token,
				customer: config.apiDataBaseUrl.match(/\/\/([^\.]*)./)[1], // Access tokens are per-customer, which is based on subdomain.
				//                                                            Logging in with one customer invalidates the key for any others for the same user,
				//                                                            otherwise we'd just store separate ones per customer
				roles: data.roles
			};
			angular.forEach(["_id", "name", "email", "track_event_actions", "track_episode_metrics"], function (key) {
				if (data[key]) {
					user[key] = data[key];
				}
			});

			// API BUG workaround
			if (data["track_episode_metrics:"]) {
				user.track_episode_metrics = true;
			}
			if (user.roles) {
				user.role_description = getRoleDescription(user.roles[0]);
			}
			appState.user = user;
			try {
				localStorage.setItem(config.localStorageKey, JSON.stringify({
					token: user.access_token,
					customer: user.customer
				}));
			} catch (e) {}
		};

		var getRoleDescription = function (roleKey) {
			if (roleKey === 'admin') {
				return "Administrator";
			}
			if (roleKey === undefined) {
				return "User";
			}
			if (roleKey === "guest") {
				return "Guest user";
			}
			if (roleKey.match(/student/i)) {
				return "Student";
			}
			if (roleKey.match(/instructor/i)) {
				return "Instructor";
			}
			return roleKey;
		};

		svc.getNonce = function () {
			var defer = $q.defer();
			$http.get(config.apiDataBaseUrl + "/v1/get_nonce")
				.success(function (data) {
					if (data.nonce) {
						defer.resolve(data.nonce);
					} else {
						// Guest access is not allowed
						if (data.login_url && data.login_url !== null) {
							if (data.login_via_top_window_only) {
								window.top.location.href = data.login_url;
							} else {
								window.location.href = data.login_url;
							}
							defer.reject();
						} else {
							console.warn("get_nonce returned a null login_url");
							if (window.location.hash !== '#/') {
								window.location.href = "/#/";
							}
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
