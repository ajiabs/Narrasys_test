'use strict';

angular.module('com.inthetelling.story')
    .factory('awsSvc', function (config, $routeParams, $http, $q, appState) {
	console.log('awsSvc, user: ', appState.user);
	var MAX_CHUNKS = 1000;
	var svc = {};
	var awsCache = {
            s3: {}
	};
	var fiveMB = 1024*1024*5;
	var chunkSize = 0;
	var chunkCount = 0;
	var chunksUploaded = 0;
	var chunks = [];
	var fileBeingUploaded;
	var multipartUpload;

	svc.awsCache = function() {
	    return awsCache;
	};

	svc.getBucketListing = function() {
	    var defer = $q.defer();
	    getUploadSession().then(function listObjects() {
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

	svc.uploadFile = function(file) {
	    console.log('awsSvc uploading file', file);
	    fileBeingUploaded = file;
	    if(file.size < fiveMB) {
		return uploadSmallFile(file);
	    } else {
		return uploadBigFile(file);
	    }
        };

	svc.deleteObject = function(bucketObject) {
	    var defer = $q.defer();
	    getUploadSession().then(function deleteObject() {
		var params = {
		    Bucket: bucketObject.bucket,
		    Key: bucketObject.Key
		};
		awsCache.s3.deleteObject(params, function(err, data) {
		    if (err) {
			console.log(err, err.stack); // an error occurred
			defer.reject();
		    } else {
			console.log('awsSvc, deleted object!', data);
			defer.resolve(data);           // successful response
		    }
		});
	    });
            
	    return defer.promise;
	};

	svc.getMultipartUploads  = function() {
	    var defer = $q.defer();
	    getUploadSession().then(function listMultipartUploads() {
		awsCache.s3.listMultipartUploads(function(err, data) {
		    if (err) {
			console.log(err, err.stack); // an error occurred
			defer.reject();
		    } else {
			console.log('awsSvc, got mulipart upload listing!', data);
			defer.resolve(data);           // successful response
		    }
		});
	    });
            
	    return defer.promise;
	    
        };

	svc.getMultipartUploadParts  = function(index, multipartUpload) {
	    var defer = $q.defer();
	    getUploadSession().then(function listParts() {
		var params = {
		    Bucket: multipartUpload.bucket,
		    Key: multipartUpload.Key,
		    UploadId: multipartUpload.UploadId
		};
		awsCache.s3.listParts(params, function(err, data) {
		    if (err) {
			console.log(err, err.stack); // an error occurred
			defer.reject();
		    } else {
			console.log('awsSvc, got mulipart upload listing!', data);
			defer.resolve({i: index, parts: data});           // successful response
		    }
		});
	    });
            
	    return defer.promise;
	    
        };

	svc.cancelMultipartUpload = function(multipartUpload) {
	    var defer = $q.defer();
	    getUploadSession().then(function abortMultipartUpload() {
		var params = {
		    Bucket: multipartUpload.bucket,
		    Key: multipartUpload.Key,
		    UploadId: multipartUpload.UploadId
		};
		awsCache.s3.abortMultipartUpload(params, function(err, data) {
		    if (err) {
			console.log(err, err.stack); // an error occurred
			defer.reject();
		    } else {
			console.log('awsSvc, deleted mulipart upload!', data);
			defer.resolve(data);           // successful response
		    }
		});
	    });
            
	    return defer.promise;
	};

	//Internal functions

	var getUploadSession = function () {
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
			console.log('S3: ',awsCache.s3);
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

	var uploadSmallFile = function(file) {
	    console.log('awsSvc uploading small file');
	    var defer = $q.defer();
	    getUploadSession().then(function putObject() {
		var params = {
		    Key: awsCache.s3.config.params.Prefix+file.name,
		    ContentType: file.type,
		    Body: file
		};
		awsCache.s3.putObject(params, function(err, data) {
		    if (err) {
			console.log(err, err.stack); // an error occurred
			defer.reject();
		    } else {
			console.log('awsSvc, uploaded file!', data);
			defer.resolve(data);           // successful response
		    }
		});
	    });
            
	    return defer.promise;
	};

	var uploadBigFile = function(file) {
	    console.log('awsSvc uploading big file');
	    var defer = $q.defer();
	    createMultipartUpload(file).then( prepareUploadParts );
	    return defer.promise;
	};

	var createMultipartUpload = function(file) {
	    var defer = $q.defer();
	    getUploadSession().then(function createMultipartUpload() {
		var params = {
		    Key: awsCache.s3.config.params.Prefix+file.name
		};
		awsCache.s3.createMultipartUpload(params, function(err, data) {
		    if (err) {
			console.log(err, err.stack); // an error occurred
			defer.reject();
		    } else {
			console.log('awsSvc, created multipart upload!', data);
			defer.resolve(data);           // successful response
		    }
		});
	    });
	    return defer.promise;
	};

	var prepareUploadParts = function(awsMultipartUpload) {
	    var defer = $q.defer();
	    multipartUpload = awsMultipartUpload;
	    chunkSize = fiveMB;
	    if(fileBeingUploaded.size > chunkSize*MAX_CHUNKS) {
		chunkSize = Math.ceil(fileBeingUploaded.size/MAX_CHUNKS);
	    }
	    chunkCount = Math.ceil(fileBeingUploaded.size/chunkSize);
	    for(var i = 0; i < chunkCount; i++) {
		var chunk = {};
		chunk.start = i*chunkSize;
		chunk.end = chunk.start+chunkSize;
		if(chunk.end > fileBeingUploaded.size) {
		    chunk.end = fileBeingUploaded.size;
		}
		var blob = fileBeingUploaded.slice(chunk.start, chunk.end);
		$q.all({
		    partNumber: $q.when(i+1),
		    eTag: uploadPart(awsMultipartUpload, i+1, blob)
		}).then(completePart);
		//uploadPart(awsMultipartUpload, i+1, blob).then(function updatePart(data) {
		//    console.log('UPLOADED PART DATA(',i,'): ', data);
		//    chunk.etag = data.ETag;
		//}).then( checkIfUploadComplete );
		chunks.push(chunk);
	    }
	    return defer.promise;
	};

	var uploadPart = function(awsMultipartUpload, partNumber, blob) {
	    var defer = $q.defer();
	    getUploadSession().then(function uploadPart() {
		var params = {
		    Bucket: awsMultipartUpload.Bucket,
		    Key: awsMultipartUpload.Key,
		    UploadId: awsMultipartUpload.UploadId,
		    PartNumber: partNumber,
		    Body: blob
		};
		awsCache.s3.uploadPart(params, function(err, data) {
		    if (err) {
			console.log(err, err.stack); // an error occurred
			defer.reject();
		    } else {
			console.log('awsSvc, uploadedPart! data.ETag:', data.ETag);
			chunksUploaded++;
			defer.resolve(data.ETag);           // successful response
		    }
		});
	    });
	    return defer.promise;
	};

	var completePart = function(data) {
	    var defer = $q.defer();
	    chunks[data.partNumber-1].part = {
		ETag: data.eTag,
		PartNumber: data.partNumber
	    };
	    if (chunksUploaded === chunkCount) {
		console.log('UPLOAD: ', multipartUpload);
		console.log('ALL CHUNKS: ', chunks);
		var parts = [];
		for(var i = 0; i < chunkCount; i++) {
		    parts.push(chunks[i].part);
		}
		var params = {
		    Bucket: multipartUpload.Bucket,
		    Key: multipartUpload.Key,
		    UploadId: multipartUpload.UploadId,
		    MultipartUpload: {
			Parts: parts
		    }
		};
		awsCache.s3.completeMultipartUpload(params, function(err, data) {
		    if (err) {
			console.log(err, err.stack); // an error occurred
			defer.reject();
		    } else {
			console.log('awsSvc, uploadedComplete! data:', data);
		    }
		});
	    }
	    return defer.promise;
	};
	
	return svc;
        
    });
