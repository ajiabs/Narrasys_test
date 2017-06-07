
awsSvc.$inject = ['$http', '$q', 'config'];

export default function awsSvc($http, $q, config) {
  // console.log('awsSvc, user: ', appState.user);
  var MAX_CHUNKS = 1000;
  var MAX_RETRIES = 4;
  var MAX_SIMUL_PARTS_UPLOADING = 3;
  var REQUEST_TIMEOUT = 30000; //30 seconds (default is 2 minutes)
  var PUBLIC_READ = "public-read";
  var PENDING = "pending";
  var UPLOADING = "uploading";
  var FAILED = "failed";
  var COMPLETE = "complete";
  var svc = {};
  var awsCache = {
    s3: {}
  };
  var fiveMB = 1024 * 1024 * 5;
  var chunkSize = 0;
  var chunkCount = 0;
  var chunksUploaded = 0;
  var chunks = [];
  var chunkSearchIndex = 0;
  var files = [];
  var fileIndex = 0;
  var fileBeingUploaded;
  var bytesUploaded = 0;
  var multipartUpload;
  var deferredUploads = [];
  var deferredUpload;
  var currentRequest;
  var uploadPaused = false;

  svc.awsCache = function () {
    return awsCache;
  };

  svc.getBucketListing = function () {
    var defer = $q.defer();
    getUploadSession().then(function listObjects() {
      awsCache.s3.listObjects(function (err, data) {
        if (err) {
          console.error(err, err.stack); // an error occurred
          defer.reject();
        } else {
          // console.log('awsSvc, got bucket listing!', data);
          defer.resolve(data); // successful response
        }
      });
    });

    return defer.promise;
  };

  /*
   CRUFT asset creation endpoint is passed down through uploadFiles, startNextUpload, and createAsset.
   TODO Refactor to create asset record outside of awsSvc, after returned promise from uploadFiles (meaning we could go back to a single svc.uploadFiles fn),
   or at the very least to handle it within these next two functions instead of passing it all the way down the chain
   */

  svc.uploadContainerFiles = function (containerId, fileList) {
    console.log('aws - upload container files', containerId, fileList);
    return uploadFiles("/v1/containers/" + containerId + "/assets", fileList);
  };
  svc.uploadUserFiles = function (userId, fileList) {
    return uploadFiles("/v1/users/" + userId + "/assets", fileList);
  };

  //Pass in a FileList object and the container in which the files are to be placed
  var uploadFiles = function (assetEndpoint, fileList) {
    var deferredUploadsPromises = [];
    // console.log('files: ', files);
    for (var i = 0; i < fileList.length; i++) {
      //can access this with regular array index
      //https://developer.mozilla.org/en-US/docs/Web/API/FileList#Example
      files.push(fileList[i]);
      var deferred = $q.defer();
      deferredUploads.push(deferred);
      deferredUploadsPromises.push(deferred.promise);
    }
    startNextUpload(assetEndpoint);
    // console.log('DEFERRED UPLOADS: ', deferredUploads);
    return deferredUploadsPromises;
  };

  svc.pauseUpload = function () {
    if (fileBeingUploaded && !uploadPaused) {
      uploadPaused = true;
      cancelCurrentUploadRequests();
      if (isSmallUpload()) {
        bytesUploaded = 0;
      } else {
        var chunkIndex = 0;
        bytesUploaded = 0;
        while (chunkIndex < chunkCount) {
          var chunk = chunks[chunkIndex];
          if (chunk.status === COMPLETE) {
            bytesUploaded += chunk.uploaded;
          }
          chunkIndex++;
        }
      }
      deferredUpload.notify({
        bytesSent: bytesUploaded,
        bytesTotal: fileBeingUploaded.size
      });
    }
  };

  svc.resumeUpload = function () {
    if (fileBeingUploaded && uploadPaused) {
      uploadPaused = false;
      if (isSmallUpload()) {
        putObject();
      } else {
        for (var i = 0; i < MAX_SIMUL_PARTS_UPLOADING; i++) {
          startNextUploadPart();
        }
      }
    }
  };

  svc.cancelUpload = function () {
    if (fileBeingUploaded) {
      uploadPaused = false;
      bytesUploaded = 0;
      cancelCurrentUploadRequests();
      if (!isSmallUpload()) {
        svc.cancelMultipartUpload(multipartUpload);
        multipartUpload = null;
      }
      fileBeingUploaded = null;
      // deferredUpload.notify({
      // 	bytesSent: 0,
      // 	bytesTotal: 0
      // });
      deferredUploads[fileIndex].reject("Canceled by user");
    }
    // cancel pending uploads as well
    for (var i = fileIndex + 1; i < files.length; i++) {
      deferredUploads[i].reject("Canceled by user");
    }
    fileIndex = files.length;

  };

  svc.networkError = function () {
    if (fileBeingUploaded) {
      cancelCurrentUploadRequests();
    }
  };

  svc.deleteObject = function (bucketObject) {
    var defer = $q.defer();
    getUploadSession().then(function deleteObject() {
      var params = {
        Bucket: bucketObject.bucket,
        Key: bucketObject.Key
      };
      awsCache.s3.deleteObject(params, function (err, data) {
        if (err) {
          console.error(err, err.stack); // an error occurred
          defer.reject();
        } else {
          // console.log('awsSvc, deleted object!', data);
          defer.resolve(data); // successful response
        }
      });
    });

    return defer.promise;
  };

  svc.getMultipartUploads = function () {
    var defer = $q.defer();
    getUploadSession().then(function listMultipartUploads() {
      awsCache.s3.listMultipartUploads(function (err, data) {
        if (err) {
          console.error(err, err.stack); // an error occurred
          defer.reject();
        } else {
          // console.log('awsSvc, got mulipart upload listing!', data);
          defer.resolve(data); // successful response
        }
      });
    });

    return defer.promise;

  };

  svc.getMultipartUploadParts = function (index, multipartUpload) {
    var defer = $q.defer();
    getUploadSession().then(function listParts() {
      var params = {
        Bucket: multipartUpload.bucket,
        Key: multipartUpload.Key,
        UploadId: multipartUpload.UploadId
      };
      awsCache.s3.listParts(params, function (err, data) {
        if (err) {
          console.error(err, err.stack); // an error occurred
          defer.reject();
        } else {
          // console.log('awsSvc, got mulipart upload listing!', data);
          defer.resolve({
            i: index,
            parts: data
          }); // successful response
        }
      });
    });

    return defer.promise;

  };

  svc.cancelMultipartUpload = function (multipartUpload) {
    var defer = $q.defer();
    getUploadSession().then(function abortMultipartUpload() {
      var params = {
        Bucket: multipartUpload.bucket,
        Key: multipartUpload.Key,
        UploadId: multipartUpload.UploadId
      };
      awsCache.s3.abortMultipartUpload(params, function (err, data) {
        if (err) {
          console.error(err, err.stack); // an error occurred
          defer.reject();
        } else {
          // console.log('awsSvc, deleted mulipart upload!', data);
          defer.resolve(data); // successful response
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
    $http.get(config.apiDataBaseUrl + "/v1/aws/s3/upload_session")
      .success(function (data) {
        if (data.access_key_id) {
          AWS.config.update({
            accessKeyId: data.access_key_id,
            secretAccessKey: data.secret_access_key,
            sessionToken: data.session_token,
            region: config.awsRegion
          });
          var params = {
            maxRetries: 0,
            httpOptions: {timeout: REQUEST_TIMEOUT},
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

  var startNextUpload = function (assetEndpoint) {
    // console.log('START NEXT UPLOAD: ', files.length, ', ', fileIndex, ', ', fileBeingUploaded);
    if (files.length > fileIndex && !fileBeingUploaded) {
      fileBeingUploaded = files[fileIndex];
      if (fileBeingUploaded.type === "") {
        // console.log('ABORTING UPLOAD, COULD NOT DETERMINE FILE TYPE FOR FILE:', fileBeingUploaded);
        deferredUploads[fileIndex].reject('Could not determine file type for file \'' + fileBeingUploaded.name + '\'');
        fileBeingUploaded = null;
        fileIndex++;
        startNextUpload(assetEndpoint);
        return;
      }
      // console.log('files: ', files);
      // console.log('awsSvc uploading file', fileBeingUploaded);
      ensureUniqueFilename().then(function () {
        var fileUploadPromise;
        if (isSmallUpload()) {
          fileUploadPromise = uploadSmallFile();
        } else {
          fileUploadPromise = uploadBigFile();
        }
        fileUploadPromise.then(function () {
            createAsset(assetEndpoint);
          },
          function (reason) {
            deferredUploads[fileIndex].reject(reason);
          },
          function (update) {
            deferredUploads[fileIndex].notify(update);
          });
      });
    }
  };

  var ensureUniqueFilename = function (deferred) {
    deferred = deferred || $q.defer();
    fileBeingUploaded.uniqueName = generateUUID();
    getUploadSession().then(function () {
      // console.log('awsSvc, ensureUniqueFilename: ', fileBeingUploaded.uniqueName);
      //First check for an object with the same name
      var params = {
        Key: awsCache.s3.config.params.Prefix + fileBeingUploaded.uniqueName
      };
      awsCache.s3.headObject(params, function (err) {
        if (err) {
          if (err.statusCode !== 404) {
            console.error(err, err.stack); // an error occurred
            deferred.reject(err);
          } else {
            // Then, if this is going to be a multipart upload, make sure there isn't already a multipart upload with the same name
            if (isSmallUpload()) {
              deferred.resolve();
            } else {
              svc.getMultipartUploads().then(function (data) {

                var findUnique = function (name) {
                  // console.log("Looking for a unique name", name);
                  for (var i = 0; i < data.Uploads.length; i++) {
                    // console.log("trying ", data.Uploads[i].Key);
                    if (data.Uploads[i].Key === awsCache.s3.config.params.Prefix + name) {
                      // console.log("Not unique; try again");
                      return findUnique(generateUUID());
                    }
                  }
                  return name;
                };

                fileBeingUploaded.uniqueName = findUnique(fileBeingUploaded.uniqueName);
                deferred.resolve();
              });
            }
          }
        } else {
          //Had a filename collision, try again
          fileBeingUploaded.uniqueName = generateUUID();
          ensureUniqueFilename(deferred);
        }
      });
    });

    return deferred.promise;
  };

  var generateUUID = function () {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
  };

  //var generateUniqueFilename = function(filename) {
  //    var parts = filename.split('.');
  //    var fileExt = "";
  //    if(parts.length > 1) {
  //	fileExt = "."+parts.pop();
  //    }
  //    var basename = parts.join('.');
  //    var date = new Date();
  //    return basename+"_"+date.getTime()+fileExt;
  //};

  var isSmallUpload = function () {
    if (fileBeingUploaded.size <= fiveMB) {
      return true;
    } else {
      return false;
    }
  };

  var uploadSmallFile = function () {
    // console.log('awsSvc uploading small file');
    deferredUpload = $q.defer();
    putObject().then(function (data) {
      console.log('UPLOAD SMALL FILE COMPLETE', data);
    }, function (reason) {
      console.error('UPLOAD SMALL FILE FAILED: ', reason);
    }, function (update) {
      console.log('UPLOAD SMALL FILE UPDATE: ', update);
    });
    return deferredUpload.promise;
  };

  var putObject = function () {
    var defer = $q.defer();
    getUploadSession().then(function putObject() {
      // console.log('awsSvc, putting object with key: ', awsCache.s3.config.params.Prefix + fileBeingUploaded.uniqueName);
      getMD5ForFileOrBlob(fileBeingUploaded, 'base64').then(function (md5) {
        var params = {
          Key: awsCache.s3.config.params.Prefix + fileBeingUploaded.uniqueName,
          ContentType: fileBeingUploaded.type,
          Body: fileBeingUploaded,
          ContentMD5: md5,
          ACL: PUBLIC_READ
        };

        currentRequest = awsCache.s3.putObject(params, function (err, data) {
          if (err) {
            console.error(err, err.stack); // an error occurred
            deferredUpload.reject();
          } else {
            // console.log('awsSvc, uploaded file!', data);
            deferredUpload.resolve(data); // successful response
          }
        });
        currentRequest.on('httpUploadProgress', function (progress) {
          deferredUpload.notify({
            bytesSent: progress.loaded,
            bytesTotal: progress.total
          });
        }).on('error', function (err, response) {
          console.error('error: ', err, response);
          deferredUpload.reject("An error occured while uploading the file, please try again.");
        });
      });
    }, function (reason) {
      console.error('PUT OBJECT FAILED: ', reason);
    }, function (update) {
      console.log('PUT OBJECT UPDATE: ', update);
    });
    return defer.promise;
  };

  var uploadBigFile = function () {
    // console.log('awsSvc uploading big file');
    deferredUpload = $q.defer();
    createMultipartUpload().then(prepareUploadParts).then(function startUpload() {
      for (var i = 0; i < MAX_SIMUL_PARTS_UPLOADING; i++) {
        startNextUploadPart();
      }
    });
    return deferredUpload.promise;
  };

  var createMultipartUpload = function () {
    var defer = $q.defer();
    getUploadSession().then(function createMultipartUpload() {
      var params = {
        Key: awsCache.s3.config.params.Prefix + fileBeingUploaded.uniqueName
      };
      awsCache.s3.createMultipartUpload(params, function (err, data) {
        if (err) {
          console.error(err, err.stack); // an error occurred
          defer.reject();
        } else {
          // console.log('awsSvc, created multipart upload!', data);
          defer.resolve(data); // successful response
        }
      });
    });
    return defer.promise;
  };

  var prepareUploadParts = function (awsMultipartUpload) {
    var defer = $q.defer();
    multipartUpload = awsMultipartUpload;
    chunks = [];
    chunkCount = 0;
    chunksUploaded = 0;
    chunkSearchIndex = 0;
    chunkSize = fiveMB;
    bytesUploaded = 0;
    if (fileBeingUploaded.size > chunkSize * MAX_CHUNKS) {
      chunkSize = Math.ceil(fileBeingUploaded.size / MAX_CHUNKS);
    }
    chunkCount = Math.ceil(fileBeingUploaded.size / chunkSize);
    for (var i = 0; i < chunkCount; i++) {
      var chunk = {};
      chunk.start = i * chunkSize;
      chunk.end = chunk.start + chunkSize;
      chunk.uploaded = 0;
      if (chunk.end > fileBeingUploaded.size) {
        chunk.end = fileBeingUploaded.size;
      }
      chunk.status = PENDING;
      chunk.retries = 0;

      chunks.push(chunk);
    }
    defer.resolve();
    return defer.promise;
  };

  var startNextUploadPart = function () {
    var defer = $q.defer();
    var chunkIndex = chunkSearchIndex;
    var foundNextChunk = false;
    if (!uploadPaused) {
      while (!foundNextChunk && chunkIndex < chunkCount) {
        var chunk = chunks[chunkIndex];
        if (chunk.status === PENDING) {
          foundNextChunk = true;
          chunk.status = UPLOADING;
          var blob = fileBeingUploaded.slice(chunk.start, chunk.end);
          chunk.cancel = function () {
            chunk.request.abort();
            chunk.status = PENDING;
            chunk.uploaded = 0;
          };
          // use $q.all to pass along the part number parameter
          $q.all({
            partNumber: $q.when(chunkIndex + 1),
            eTag: uploadPart(chunkIndex + 1, blob)
          }).then(completePart, handleFailedPart).then(function (data) {
            defer.resolve(data);
          }, function (reason) {
            console.error("UPLOAD PART FAILED: ", reason);
            defer.reject(reason);
          }, function (update) {
            defer.update(update);
          });
        } else if (chunk.status === COMPLETE && chunkIndex === chunkSearchIndex) {
          chunkSearchIndex++;
        }
        chunkIndex++;
      }
      if (!foundNextChunk) {
        defer.reject("All chunks uploaded");
      }
    } else {
      defer.reject("Upload paused");
    }

    return defer.promise;
  };

  var getMD5ForFileOrBlob = function (fileOrBlob, hashType) {
    var defer = $q.defer();
    var reader = new FileReader();
    reader.onload = function () {
      var data = reader.result;
      defer.resolve(AWS.util.crypto.md5(new Uint8Array(data), hashType));
    };
    reader.readAsArrayBuffer(fileOrBlob);
    return defer.promise;
  };

  var uploadPart = function (partNumber, blob, defer) {
    // console.log('awsSvc, Uploading part: ', partNumber);
    if (!defer) {
      defer = $q.defer();
    }
    getUploadSession().then(function () {
      getMD5ForFileOrBlob(blob, 'base64').then(function (md5) {
        //console.log("MD5 for part '", partNumber, "' of size '", blob.size,"' is ", md5);
        var params = {
          Bucket: multipartUpload.Bucket,
          Key: multipartUpload.Key,
          UploadId: multipartUpload.UploadId,
          PartNumber: partNumber,
          ContentMD5: md5,
          Body: blob
        };
        chunks[partNumber - 1].request = awsCache.s3.uploadPart(params, function (err, data) {
          if (err) {
            if (chunks[partNumber - 1].retries < MAX_RETRIES) {
              console.error("RETRYING PART UPLOAD FOR CHUNK ", partNumber);
              chunks[partNumber - 1].request.abort();
              chunks[partNumber - 1].retries++;
              uploadPart(partNumber, blob, defer);
            } else {
              console.error("PART UPLOAD FAILED FOR CHUNK ", partNumber, err, err.stack); // an error occurred
              chunks[partNumber - 1].status = FAILED;
              defer.reject(err);
            }
          } else {
            //console.log('awsSvc, uploadedPart! data.ETag:', data.ETag);
            defer.resolve(data.ETag); // successful response
          }
        });
        chunks[partNumber - 1].request.on('httpUploadProgress', function (progress) {
          bytesUploaded += progress.loaded - chunks[partNumber - 1].uploaded;
          chunks[partNumber - 1].uploaded = progress.loaded;
          deferredUpload.notify({
            bytesSent: bytesUploaded,
            bytesTotal: fileBeingUploaded.size
          });
        }).on('error', function (err, response) {
          console.log('PART UPLOAD FAILED ON UPDATE: ', err, response);
          //defer.reject(err);
          //}).on('httpError', function (err, response) {
          //	console.log('HTTP ERROR: ', err, response);
          //}).on('httpDone', function (response) {
          //	console.log('HTTP DONE: ', response);
        });
      });
    });
    return defer.promise;
  };

  var completePart = function (data) {
    var defer = $q.defer();
    chunks[data.partNumber - 1].status = COMPLETE;
    chunks[data.partNumber - 1].part = {
      ETag: data.eTag,
      PartNumber: data.partNumber
    };
    chunksUploaded++;
    if (chunksUploaded === chunkCount) {
      var parts = [];
      for (var i = 0; i < chunkCount; i++) {
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
      awsCache.s3.completeMultipartUpload(params, function (err, data) {
        if (err) {
          console.error(err, err.stack); // an error occurred
          deferredUpload.reject(err);
          defer.reject(err);
        } else {
          // console.log('awsSvc, uploadedComplete! data:', data);
          params = {
            Bucket: multipartUpload.Bucket,
            Key: multipartUpload.Key,
            ACL: PUBLIC_READ
          };
          awsCache.s3.putObjectAcl(params, function (err, data) {
            if (err) {
              deferredUpload.reject(err);
              console.error(err, err.stack); // an error occurred
              defer.reject(err);
            } else {
              console.log('awsSvc, set file permissions:', data);
            }
          });
          deferredUpload.resolve(data);
          defer.resolve(data);
        }
      });

    } else {
      startNextUploadPart();
    }

    return defer.promise;
  };

  var handleFailedPart = function (err) {
    console.error("PART OF MULTIPART UPLOAD FAILED, CANCELLING UPLOAD", err);
    svc.cancelMultipartUpload(multipartUpload);
    deferredUpload.reject(err);
  };

  var cancelCurrentUploadRequests = function () {
    if (isSmallUpload()) {
      currentRequest.abort();
    } else {
      var chunkIndex = chunkSearchIndex;
      var foundAllUploadingChunks = false;
      while (!foundAllUploadingChunks && chunkIndex < chunkCount) {
        var chunk = chunks[chunkIndex];
        if (chunk.status === UPLOADING) {
          // console.log('awsSvc, Cancelling upload of chunk: ', chunkIndex);
          chunk.cancel();
        } else if (chunk.status === PENDING) {
          foundAllUploadingChunks = true;
        }
        chunkIndex++;
      }
    }
  };

  var createAsset = function (assetEndpoint) {
    var deferred = $q.defer();
    var assetData = {
      'url': 'https://s3.amazonaws.com/' + awsCache.s3.config.params.Bucket + '/' + awsCache.s3.config.params.Prefix + fileBeingUploaded.uniqueName,
      'type': fileBeingUploaded.type,
      'size': fileBeingUploaded.size,
      'original_filename': fileBeingUploaded.name
    };

    if (fileBeingUploaded.tags && fileBeingUploaded.tags.length) {
      Object.assign(assetData, {tags: fileBeingUploaded.tags});
    }

    $http.post(config.apiDataBaseUrl + assetEndpoint, assetData)
      .success(function (data) {
        deferredUploads[fileIndex].resolve(data);
        fileBeingUploaded = null;
        fileIndex++;
        startNextUpload(assetEndpoint);
      })
      .error(function () {
        deferredUploads[fileIndex].reject();
        fileBeingUploaded = null;
        fileIndex++;
        startNextUpload(assetEndpoint);
      });
    return deferred.promise;
  };

  return svc;

}
