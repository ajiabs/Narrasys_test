'use strict';

angular.module('com.inthetelling.story')
	.factory('awsSvc', function (config, $routeParams, $http, $q, appState) {
		console.log('awsSvc factory, user is guest: '+appState.user.guest);
		var svc = {};
		var awsCache = {
			uploadSession: {}
		};

		svc.getUploadSession = function () {
			var defer = $q.defer();
			$http.get(config.apiDataBaseUrl + "/v1/get_s3_upload_session")
				.success(function (data) {
					if (data.access_key_id) {
					        awsCache.uploadSession = data;
						defer.resolve(data);
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

	        
	});
