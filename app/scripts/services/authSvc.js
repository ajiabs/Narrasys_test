'use strict';

angular.module('com.inthetelling.story')
	.factory('authSvc', function (config, $routeParams, $http, $q, $location, appState, modelSvc, errorSvc) {
		// console.log('authSvc factory');
		var svc = {};

		svc.userHasRole = function (role) {

			if (appState.user && appState.user.roles) {
				for (var i = 0; i < appState.user.roles.length; i++) {
					if (appState.user.roles[i].role === role) {
						return true;
					}
				}
			}
			return false;
		};
		var Roles = {
			ADMINISTRATOR: "admin",
			INSTRUCTOR: "instructor",
			STUDENT: "student",
			GUEST: "guest",
		};

		svc.getRoleForNarrative = function (narrativeId, roles) {
			roles = typeof roles !== 'undefined' ? roles : appState.user.roles;
			var role = "";
			var exitLoop = false;
			if (roles) {
				for (var i = 0; i < roles.length; i++) {
					switch (roles[i].role) {
					case Roles.ADMINISTRATOR:
						if (roles[i].resource_id && roles[i].resource_id !== narrativeId) {
							continue; // they are an admin, but not in this narrative, so let's keep going
						} else {
							role = "admin";
							exitLoop = true; //if they are an admin, then we can just get out as it trumps
						}
						break;
					case Roles.INSTRUCTOR:
						if (roles[i].resource_id && roles[i].resource_id !== narrativeId) {
							continue;
						} else {
							role = roles[i].role;
						}
						break;
					case Roles.STUDENT:
						if (roles[i].resource_id && roles[i].resource_id !== narrativeId) {
							continue;
						} else {
							role = role === "instructor" ? role : roles[i].role;
						}
						break;
					case Roles.GUEST:
						if (roles[i].resource_id && roles[i].resource_id !== narrativeId) {
							continue;
						} else {
							role = role === "instructor" || role === "student" ? role : roles[i].role;
						}
						break;
					}
					if (exitLoop) {
						break;
					}
				}
			}
			return role;
		};

		svc.getDefaultProductForRole = function (role) {
			/* 
			This was making it impossible for users with admin role to see editor or player interface.
			For now, producer should be used only at the /#/episode urls, editor at the narrative urls
			(producer only works with individual episodes atm anyway)
			TODO later on we'll make this user-selectable within the product UI (and probably 
			eliminate appState.productLoadedAs and the /#/episode, /#/editor, etc routes)
			*/
			var product = "player";
			if (appState.productLoadedAs === 'narrative') {
				if (role === Roles.ADMINISTRATOR || role === Roles.INSTRUCTOR) {
					product = "sxs";
				}
			} else {
				errorSvc.error({
					data: "authSvc.getDefaultProductForRole should only be used within narratives for now"
				});
			}
			return product;
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
				})
				.success(function () {
					delete $http.defaults.headers.common.Authorization; // now it's safe
					$location.path('/')
						.search({
							logout: 1
						});
				})
				.error(function () {
					delete $http.defaults.headers.common.Authorization; // if it exists at all here, it's definitely invalid
					$location.path('/')
						.search({
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
				})
				.success(function (data) {
					$http.defaults.headers.common.Authorization = 'Token token="' + data.access_token + '"';
					resolveUserData(data);
					svc.getCurrentUser()
						.then(function () {
							defer.resolve(data);
						});

				})
				.error(function (data) {
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

		var authenticateDefer = $q.defer();
		svc.authenticate = function (nonceParam) {
			if ($http.defaults.headers.common.Authorization) {
				if (appState.user) {
					// Have header and user; all done.
					authenticateDefer.resolve();
				} else {
					// begin dubious code block
					console.warn("Have auth header but no appState.user data. Not sure this should ever happen, TODO delete this from authSvc if it continues to not happen");
					svc.getCurrentUser()
						.then(function () {
							authenticateDefer.resolve();
						}, function () {
							return svc.authenticateViaNonce(nonceParam);
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
					svc.getCurrentUser()
						.then(function () {
							// token worked
							authenticateDefer.resolve();
						}, function () {
							// token expired; clear everything and start over
							localStorage.removeItem(config.localStorageKey);
							document.cookie = 'XSRF-TOKEN=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
							document.cookie = '_tellit-api_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
							appState.user = {};
							return svc.authenticateViaNonce(nonceParam);
						});
				} else {
					// no login info at all, start from scratch
					return svc.authenticateViaNonce(nonceParam);
				}
			}
			return authenticateDefer.promise;
		};

		svc.authenticateViaNonce = function (nonceParam) {
			var defer = $q.defer();
			svc.getNonce(nonceParam)
				.then(function (nonce) {
					svc.getAccessToken(nonce)
						.then(function () {
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
					resolveUserData(respData);
					defer.resolve();
				})
				.error(function () {
					defer.reject();
				});
			return defer.promise;
		};

		svc.updateUser = function (user) {
			var defer = $q.defer();
			$http({
					method: 'PUT',
					url: config.apiDataBaseUrl + '/users/' + user._id,
					data: user
				})
				.success(function (respData) {
					resolveUserData(respData);
					defer.resolve();
				})
				.error(function () {
					defer.reject();
				});
			return defer.promise;
		};

		var resolveUserData = function (data) {
			// Modify the structure of the roles data if necessary.  This is a temporary fix and can be removed after the new roles system is in place.
			if (data.roles !== null && data.roles !== undefined && data.roles.length > 0 && data.roles[0].constructor === String) {
				var roles = [];
				for (var i = 0; i < data.roles.length; i++) {
					var role = {
						role: data.roles[i]
					};
					roles.push(role);
				}
				data.roles = roles;
			}

			// updates appState.user and localStorage
			var user = {
				access_token: data.access_token || data.authentication_token,
				customer: config.apiDataBaseUrl.match(/\/\/([^\.]*)./)[1], // Access tokens are per-customer, which is based on subdomain.
				//                                                            Logging in with one customer invalidates the key for any others for the same user,
				//                                                            otherwise we'd just store separate ones per customer
				roles: data.roles
			};
			angular.forEach(["_id", "name", "email", "track_event_actions", "track_episode_metrics", "avatar_id"], function (key) {
				if (data[key]) {
					user[key] = data[key];
				}
			});

			if (user.avatar_id) {
				// Load and cache avatar asset for current user
				$http.get(config.apiDataBaseUrl + "/v1/assets/" + user.avatar_id).then(function (response) {
					console.log("GOT AVATAR", response);
					modelSvc.cache("asset", response.data);
					appState.user.avatar = response.data.url; // convenience for now, may be better to use modelSvc here
				});
			}

			// API BUG workaround
			if (data["track_episode_metrics:"]) {
				user.track_episode_metrics = true;
			}
			if (user.roles) {
				user.role_description = getRoleDescription(user.roles[0]);
			}
			if (data.emails) {
				user.email = data.emails[0];
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
			if (roleKey === undefined) {
				return "User";
			}
			if (roleKey.role === 'admin') {
				return "Administrator";
			}
			if (roleKey.role === undefined) {
				return "User";
			}
			if (roleKey.role === "guest") {
				return "Guest user";
			}
			if (roleKey.role.match(/student/i)) {
				return "Student";
			}
			if (roleKey.role.match(/instructor/i)) {
				return "Instructor";
			}
			return roleKey;
		};

		svc.getNonce = function (nonceParam) {
			var defer = $q.defer();
			var url = config.apiDataBaseUrl + "/v1/get_nonce";
			if (nonceParam) {
				url = url + "?" + nonceParam;
			}
			$http.get(url)
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
					resolveUserData(data);
					$http.defaults.headers.common.Authorization = 'Token token="' + data.access_token + '"';
					svc.getCurrentUser()
						.then(function () {
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
