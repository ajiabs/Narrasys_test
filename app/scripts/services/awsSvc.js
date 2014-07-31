'use strict';

angular.module('com.inthetelling.story')
    .factory('awsSvc', function (config, $routeParams, $http, $q, appState) {
	console.log('awsSvc, user: ', appState.user);
	var svc = {};
	var awsCache = {
            s3: {}
	};
	
	svc.getUploadSession = function () {
	    if (awsCache.hasOwnProperty('sessionDeferred')) {
		return awsCache.sessionDeferred.promise;
	    } else {
		awsCache.sessionDeferred = $q.defer();
	    }
	    $http.get(config.apiDataBaseUrl + "/v1/get_s3_upload_session")
		.success(function (data) {
		    if (data.access_key_id) {
			AWS.config.update({accessKeyId: data.access_key_id, secretAccessKey: data.secret_access_key, sessionToken: data.session_token, region: config.awsRegion});
			var params = {
			    params: {
				Bucket: data.bucket,
				Prefix: data.key_base
			    }
			};
                        awsCache.s3 = new AWS.S3(params);
			awsCache.sessionDeferred.resolve(data);
		    } else {
			awsCache.sessionDeferred.reject();
		    }
		})
		.error(function () {
		    awsCache.sessionDeferred.reject();
		});
	    return awsCache.sessionDeferred.promise;
	};

	svc.getBucketListing = function() {
	    var defer = $q.defer();
	    svc.getUploadSession().then(function listObjects() {
		awsCache.s3.listObjects(function(err, data) {
		    if (err) {
			console.log(err, err.stack); // an error occurred
			defer.reject();
		    } else {
			console.log('awsSvc, got bucket listing!', data);
			defer.resolve(data);           // successful response
		    }
		});
	    });
            
	    return defer.promise;
	    
        };
	
	svc.createMultipartUpload = function() {
	    var defer = $q.defer();
	    svc.getUploadSession().then(function createMultipartUpload() {
		awsCache.s3.listObjects(function(err, data) {
		    if (err) {
			console.log(err, err.stack); // an error occurred
			defer.reject();
		    } else {
			console.log('awsSvc, got bucket listing!', data);
			defer.resolve(data);           // successful response
		    }
		});
	    });
	    return defer.promise;
	};
	
	svc.awsCache = function() {
	    return awsCache;
	};
	
	return svc;
        
    });
