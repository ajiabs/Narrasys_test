'use strict';

angular.module('com.inthetelling.story')
    .factory('awsSvc', function (config, $routeParams, $http, $q, appState) {
	console.log('awsSvc, user: ', appState.user);
	var MAX_CHUNKS = 1000;
	var MAX_SIMUL_PARTS_UPLOADING = 3;
	var PUBLIC_READ = "public-read";
	var PENDING = "pending";
	var UPLOADING = "uploading";
	var COMPLETE = "complete";
	var svc = {};
	var awsCache = {
            s3: {}
	};
	var fiveMB = 1024*1024*5;
	var chunkSize = 0;
	var chunkCount = 0;
	var chunksUploaded = 0;
	var chunks = [];
	var chunkSearchIndex = 0;
	var fileBeingUploaded;
	var bytesUploaded = 0;
	var multipartUpload;
	var deferredUpload;
	var uploadPaused = false;

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

	svc.pauseUpload = function() {
	    if(!uploadPaused) {
		uploadPaused = true;
		var chunkIndex = chunkSearchIndex;
		var foundAllUploadingChunks = false;
		var chunk;
		while(!foundAllUploadingChunks && chunkIndex < chunkCount) {
		    chunk = chunks[chunkIndex];
		    if(chunk.status === UPLOADING) {
			console.log('awsSvc, Cancelling upload of chunk: ', chunkIndex);
			chunk.cancel();
		    } else if(chunk.status === PENDING) {
			foundAllUploadingChunks = true;
		    }
		    chunkIndex++;
		}
		chunkIndex = 0;
		bytesUploaded = 0;
		while(chunkIndex < chunkCount) {
		    chunk = chunks[chunkIndex];
		    if(chunk.status === COMPLETE) {
			bytesUploaded += chunk.uploaded;
		    }
		    chunkIndex++;
		}
		deferredUpload.notify({bytesSent: bytesUploaded, bytesTotal: fileBeingUploaded.size});
	    }
	};

	svc.resumeUpload = function() {
	    if(uploadPaused) {
		uploadPaused = false;
		for(var i=0; i<MAX_SIMUL_PARTS_UPLOADING; i++) {
		    startNextUploadPart();
		}
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
		    Body: file,
		    ACL: PUBLIC_READ
		};

		var req = awsCache.s3.putObject(params, function(err, data) {
		    if (err) {
			console.log(err, err.stack); // an error occurred
			defer.reject();
		    } else {
			console.log('awsSvc, uploaded file!', data);
			defer.resolve(data);           // successful response
		    }
		});
		req.on('httpUploadProgress', function (progress) {
		    defer.notify({bytesSent: progress.loaded, bytesTotal: progress.total});
		});
	    });
            
	    return defer.promise;
	};

	var uploadBigFile = function(file) {
	    console.log('awsSvc uploading big file');
	    deferredUpload = $q.defer();
	    createMultipartUpload(file).then(prepareUploadParts).then(function startUpload() {
		for(var i=0; i<MAX_SIMUL_PARTS_UPLOADING; i++) {
		    startNextUploadPart();
		}
	    });
	    return deferredUpload.promise;
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
		chunk.uploaded = 0;
		if(chunk.end > fileBeingUploaded.size) {
		    chunk.end = fileBeingUploaded.size;
		}
		chunk.status = PENDING;
		
		chunks.push(chunk);
	    }
	    defer.resolve();
	    return defer.promise;
	};

	var startNextUploadPart = function() {
	    var defer = $q.defer();
	    var chunkIndex = chunkSearchIndex;
	    var foundNextChunk = false;
	    if(!uploadPaused) {
		while(!foundNextChunk && chunkIndex < chunkCount) {
		    var chunk = chunks[chunkIndex];
		    if(chunk.status === PENDING) {
			foundNextChunk = true;
			chunk.status = UPLOADING;
			var blob = fileBeingUploaded.slice(chunk.start, chunk.end);
			chunk.cancel = function() {
			    chunk.request.abort();
			    chunk.status = PENDING;
			    chunk.uploaded = 0;
			};
			// use $q.all to pass along the part number parameter
			$q.all({
			    partNumber: $q.when(chunkIndex+1),
			    eTag: uploadPart(chunkIndex+1, blob)
			}).then(completePart);
		    } else if(chunk.status === COMPLETE && chunkIndex === chunkSearchIndex) {
			chunkSearchIndex++;
		    }
		    chunkIndex++;
		}
		if(!foundNextChunk) {
		    defer.reject("All chunks uploaded");
		}
	    } else {
		defer.reject("Upload paused");
	    }

	    return defer.promise;
	};

	var uploadPart = function(partNumber, blob) {
	    console.log('awsSvc, Uploading part: ', partNumber);
	    var defer = $q.defer();
	    getUploadSession().then(function uploadPart() {
		var params = {
		    Bucket: multipartUpload.Bucket,
		    Key: multipartUpload.Key,
		    UploadId: multipartUpload.UploadId,
		    PartNumber: partNumber,
		    Body: blob
		};
		chunks[partNumber-1].request = awsCache.s3.uploadPart(params, function(err, data) {
		    if (err) {
			console.log(err, err.stack); // an error occurred
			defer.reject();
		    } else {
			console.log('awsSvc, uploadedPart! data.ETag:', data.ETag);
			defer.resolve(data.ETag);           // successful response
		    }
		});
		chunks[partNumber-1].request.on('httpUploadProgress', function (progress) {
		    bytesUploaded += progress.loaded - chunks[partNumber-1].uploaded;
		    chunks[partNumber-1].uploaded = progress.loaded;
		    deferredUpload.notify({bytesSent: bytesUploaded, bytesTotal: fileBeingUploaded.size});
		});
	    });
	    return defer.promise;
	};

	var completePart = function(data) {
	    var defer = $q.defer();
	    chunks[data.partNumber-1].status = COMPLETE;
	    chunks[data.partNumber-1].part = {
		ETag: data.eTag,
		PartNumber: data.partNumber
	    };
	    chunksUploaded++;
	    if (chunksUploaded === chunkCount) {
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
			params = {
			    Bucket: multipartUpload.Bucket,
			    Key: multipartUpload.Key,
			    ACL: PUBLIC_READ
			};
			awsCache.s3.putObjectAcl(params, function(err, data) {
			    if (err) {
				console.log(err, err.stack); // an error occurred
				defer.reject();
			    } else {
				console.log('awsSvc, set file permissions:', data);
			    }
			});
			defer.resolve(data);
		    }
		});
		
	    } else {
		startNextUploadPart();
	    }
	    
	    return defer.promise;
	};
	
	return svc;
        
    });
