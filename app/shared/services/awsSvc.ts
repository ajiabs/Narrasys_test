// @npUpgrade-shared-false
//
// ** Updated by Curve10 (JAB/EDD)
//    Feb 2018
//
import { config } from '../../config';

export interface awsServices {
  awsCache();
  getBucketListing();
  uploadContainerFiles(containerId, fileList, tag?);
  uploadUserFiles(userId, fileList);
  uploadFiles(assetEndpoint, fileList, tag?);
  pauseUpload();
  resumeUpload();
  cancelUpload();
  networkError();
  deleteObject(bucketObject);
  getMultipartUploads();
  getMultipartUploadParts(index, multipartUpload);
  cancelMultipartUpload(multipartUpload);
  getUploadSession();
  startNextUpload(assetEndpoint);
  ensureUniqueFilename(deferred);
  generateUUID();
  isSmallUpload();
  uploadSmallFile();
  putObject();
  uploadBigFile();
  createMultipartUpload();
  prepareUploadParts(awsMultipartUpload);
  startNextUploadPart();
  getMD5ForFileOrBlob(fileOrBlob, hashType);
  uploadPart(partNumber, blob, defer);
  completePart(data);
  handleFailedPart(err);
  cancelCurrentUploadRequests();
  createAsset(assetEndpoint);
}


export class awsSvc implements awsServices {
  static Name = 'awsSvc'; // tslint:disable-line
  static $inject = ['$http', '$q'];

  constructor (
    private $http:string,
    private $q:ng.IQService,
    private AWS:ng.IQService) {
  }

  // console.log('awsSvc, user: ', appState.user);
  private MAX_CHUNKS = 1000;
  private MAX_RETRIES = 4;
  private MAX_SIMUL_PARTS_UPLOADING = 3;
  REQUEST_TIMEOUT = 30000; //30 seconds (default is 2 minutes)
  private PUBLIC_READ = "public-read";
  private PENDING = "pending";
  private UPLOADING = "uploading";
  private FAILED = "failed";
  private COMPLETE = "complete";
  private svc = {};
  private  _awsCache = {   
    s3: {}
   };

  private fiveMB = 1024 * 1024 * 5;
  private chunkSize = 0;
  private chunkCount = 0;
  private chunksUploaded = 0;
  private chunks = [];
  private chunkSearchIndex = 0;
  private files = [];
  private fileMeta = {};
  private fileIndex = 0;
  private fileBeingUploaded;
  private bytesUploaded = 0;
  private multipartUpload;
  private deferredUploads = [];
  private deferredUpload;
  private currentRequest;
  private uploadPaused = false;

  // ************************** public methods ************************************* //
  awsCache() {
    return this._awsCache;
  };

  getBucketListing() {
    var context = this;
    var defer = this.$q.defer();
    this.getUploadSession()
      .then(function listObjects() {
        context._awsCache.s3.listObjects(function (err, data) {
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

  uploadContainerFiles(containerId, fileList, tag?) {
    console.log('aws - upload container files', containerId, fileList);
    return this.uploadFiles("/v1/containers/" + containerId + "/assets", fileList, tag);
  };
  uploadUserFiles(userId, fileList) {
    return this.uploadFiles("/v1/users/" + userId + "/assets", fileList);
  };

  //Pass in a FileList object and the container in which the files are to be placed
  uploadFiles(assetEndpoint, fileList, tag?) {
    var deferredUploadsPromises = [];
    // console.log('files: ', files);
    for (var i = 0; i < fileList.length; i++) {
      //can access this with regular array index
      //https://developer.mozilla.org/en-US/docs/Web/API/FileList#Example
      this.files.push(fileList[i]);
      if (tag != null) {
        this.fileMeta[fileList[i].name] = [tag];
        console.log('adding meta stuff', this.fileMeta);
      }
      var deferred = this.$q.defer();
      this.deferredUploads.push(deferred);
      deferredUploadsPromises.push(deferred.promise);
    }
    this.startNextUpload(assetEndpoint);
    // console.log('DEFERRED UPLOADS: ', deferredUploads);
    return deferredUploadsPromises;
  };

  pauseUpload() {
    if (this.fileBeingUploaded && !this.uploadPaused) {
      this.uploadPaused = true;
      this.cancelCurrentUploadRequests();
      if (this.isSmallUpload()) {
        this.bytesUploaded = 0;
      } else {
        var chunkIndex = 0;
        this.bytesUploaded = 0;
        while (chunkIndex < this.chunkCount) {
          var chunk = this.chunks[chunkIndex];
          if (chunk.status === this.COMPLETE) {
            this.bytesUploaded += chunk.uploaded;
          }
          chunkIndex++;
        }
      }
      this.deferredUpload.notify({
        bytesSent: this.bytesUploaded,
        bytesTotal: this.fileBeingUploaded.size
      });
    }
  };

  resumeUpload() {
    if (this.fileBeingUploaded && this.uploadPaused) {
      this.uploadPaused = false;
      if (this.isSmallUpload()) {
        this.putObject();
      } else {
        for (var i = 0; i < this.MAX_SIMUL_PARTS_UPLOADING; i++) {
          this.startNextUploadPart();
        }
      }
    }
  };

  cancelUpload() {
    if (this.fileBeingUploaded) {
      this.uploadPaused = false;
      this.bytesUploaded = 0;
      this.cancelCurrentUploadRequests();
      if (!this.isSmallUpload()) {
        this.cancelMultipartUpload(this.multipartUpload);
        this.multipartUpload = null;
      }
      this.fileBeingUploaded = null;
      // deferredUpload.notify({
      // 	bytesSent: 0,
      // 	bytesTotal: 0
      // });
      this.deferredUploads[this.fileIndex].reject("Canceled by user");
    }
    // cancel pending uploads as well
    for (var i = this.fileIndex + 1; i < this.files.length; i++) {
      this.deferredUploads[i].reject("Canceled by user");
    }
    this.fileIndex = this.files.length;

  };

  networkError() {
    if (this.fileBeingUploaded) {
      this.cancelCurrentUploadRequests();
    }
  };

  deleteObject(bucketObject) {
    var context = this;
    var defer = this.$q.defer();
    this.getUploadSession()
      .then(function deleteObject() {
        var params = {
          Bucket: bucketObject.bucket,
          Key: bucketObject.Key
        };
        context._awsCache.s3.deleteObject(params, function (err, data) {
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

  getMultipartUploads() {
    var context = this;
    var defer = this.$q.defer();
    this.getUploadSession()
      .then(function listMultipartUploads() {
        context._awsCache.s3.listMultipartUploads(function (err, data) {
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

  getMultipartUploadParts(index, multipartUpload) {
    var context = this;
    var defer = this.$q.defer();
    this.getUploadSession()
      .then(function listParts() {
        var params = {
          Bucket: multipartUpload.bucket,
          Key: multipartUpload.Key,
          UploadId: multipartUpload.UploadId
        };
        context._awsCache.s3.listParts(params, function (err, data) {
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

  cancelMultipartUpload(multipartUpload) {
    var context = this;
    var defer = this.$q.defer();
    this.getUploadSession()
      .then(function abortMultipartUpload() {
        var params = {
          Bucket: multipartUpload.bucket,
          Key: multipartUpload.Key,
          UploadId: multipartUpload.UploadId
        };
        context._awsCache.s3.abortMultipartUpload(params, function (err, data) {
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

  uploadSuccess(data) {
    if (data.access_key_id) {
      AWS.config.update({
      accessKeyId: data.access_key_id,
      secretAccessKey: data.secret_access_key,
      sessionToken: data.session_token,
      region: config.awsRegion
    });
    var params = {
      maxRetries: 0,
      httpOptions: {timeout: this.REQUEST_TIMEOUT},
      params: {
        Bucket: data.bucket,
        Prefix: data.key_base
      }
    };
    this._awsCache.s3 = new AWS.S3(params);
    this._awsCache.sessionDeferred.resolve(data);
  } else {
    this._awsCache.sessionDeferred.reject();
  }
};


  getUploadSession() {
    if (this._awsCache.hasOwnProperty('sessionDeferred')) {
      return this._awsCache.sessionDeferred.promise;
    } else {
      this._awsCache.sessionDeferred = this.$q.defer();
    }
    this.$http.get(config.apiDataBaseUrl + "/v1/aws/s3/upload_session")
    // .success(function (data) {
      .success((data) => this.uploadSuccess(data))
      .error(function () {
        this._awsCache.sessionDeferred.reject();
      });
    return this._awsCache.sessionDeferred.promise;
  };

  startNextUpload(assetEndpoint) {
    // console.log('START NEXT UPLOAD: ', files.length, ', ', fileIndex, ', ', fileBeingUploaded);
    if (this.files.length > this.fileIndex && !this.fileBeingUploaded) {
      this.fileBeingUploaded = this.files[this.fileIndex];
      if (this.fileBeingUploaded.type === "") {
        // console.log('ABORTING UPLOAD, COULD NOT DETERMINE FILE TYPE FOR FILE:', fileBeingUploaded);
        this.deferredUploads[this.fileIndex].reject('Could not determine file type for file \'' + this.fileBeingUploaded.name + '\'');
        this.fileBeingUploaded = null;
        this.fileIndex++;
        this.startNextUpload(assetEndpoint);
        return;
      }
      // console.log('files: ', files);
      // console.log('awsSvc uploading file', fileBeingUploaded);

      // *************** maintain context for callback(s)
      var context = this;

      this.ensureUniqueFilename(this.$q.deferred)
        .then(function () {
          var fileUploadPromise;
          if (context.isSmallUpload()) {
            fileUploadPromise = context.uploadSmallFile();
          } else {
            fileUploadPromise = context.uploadBigFile();
          }
          fileUploadPromise
            .then(function () {
              context.createAsset(assetEndpoint);
            },
            function (reason) {
              context.deferredUploads[context.fileIndex].reject(reason);
            },
            function (update) {
              context.deferredUploads[context.fileIndex].notify(update);
            });
      });
    }
  };

  

  ensureUniqueFilename(deferred) {
    deferred = deferred || this.$q.defer();
    this.fileBeingUploaded.uniqueName = this.generateUUID();

    // **************** maintain the context (this) for the callback(s)
    var context = this;


    this.getUploadSession()
      .then(() => {
        var params = {
          Key: context._awsCache.s3.config.params.Prefix + context.fileBeingUploaded.uniqueName
      };
      context._awsCache.s3.headObject(params, function (err) {
        if (err) {
          if (err.statusCode !== 404) {
            console.error(err, err.stack); // an error occurred
            deferred.reject(err);
          } else {
            // Then, if this is going to be a multipart upload, make sure there isn't already a multipart upload with the same name
            if (context.isSmallUpload()) {
              deferred.resolve();
            } else {
              context.getMultipartUploads()
                .then(function (data) {

                  var findUnique = function (name) {
                    // console.log("Looking for a unique name", name);
                    for (var i = 0; i < data.Uploads.length; i++) {
                      // console.log("trying ", data.Uploads[i].Key);
                      if (data.Uploads[i].Key === context._awsCache.s3.config.params.Prefix + name) {
                        // console.log("Not unique; try again");
                        return findUnique(context.generateUUID());
                      }
                    }
                    return name;
                  };

                  context.fileBeingUploaded.uniqueName = findUnique(context.fileBeingUploaded.uniqueName);
                  deferred.resolve();
                });
            }
          }
        } else {
          //Had a filename collision, try again
          context.fileBeingUploaded.uniqueName = this.generateUUID();
          context.ensureUniqueFilename(deferred);
        }
      });
    });


    return deferred.promise;
  };

  generateUUID() {
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

  isSmallUpload() {
    if (this.fileBeingUploaded.size <= this.fiveMB) {
      return true;
    } else {
      return false;
    }
  };

  uploadSmallFile() {
    var context = this;
    // console.log('awsSvc uploading small file');
    this.deferredUpload = this.$q.defer();
    this.putObject()
      .then(function (data) {
        console.log('UPLOAD SMALL FILE COMPLETE', data);
      }, function (reason) {
        console.error('UPLOAD SMALL FILE FAILED: ', reason);
      }, function (update) {
        console.log('UPLOAD SMALL FILE UPDATE: ', update);
      });
    return this.deferredUpload.promise;
  };

  putObject() {
    var defer = this.$q.defer();

    // **************** maintain the context (this) for the callback(s)
    var context = this;

    this.getUploadSession()
      .then(function putObject() {
        // console.log('awsSvc, putting object with key: ', this._awsCache.s3.config.params.Prefix + fileBeingUploaded.uniqueName);
        context.getMD5ForFileOrBlob(context.fileBeingUploaded, 'base64')
          .then(function (md5) {
            var params = {
              Key: context._awsCache.s3.config.params.Prefix + context.fileBeingUploaded.uniqueName,
              ContentType: context.fileBeingUploaded.type,
              Body: context.fileBeingUploaded,
              ContentMD5: md5,
              ACL: context.PUBLIC_READ
            };

            context.currentRequest = context._awsCache.s3.putObject(params, function (err, data) {
              if (err) {
                console.error(err, err.stack); // an error occurred
                context.deferredUpload.reject();
              } else {
                // console.log('awsSvc, uploaded file!', data);
                context.deferredUpload.resolve(data); // successful response
              }
            });
            context.currentRequest
              .on('httpUploadProgress', function (progress) {
                context.deferredUpload.notify({
                  bytesSent: progress.loaded,
                  bytesTotal: progress.total
                });
              })
              .on('error', function (err, response) {
                console.error('error: ', err, response);
                context.deferredUpload.reject("An error occured while uploading the file, please try again.");
              });
          });
      }, function (reason) {
        console.error('PUT OBJECT FAILED: ', reason);
      }, function (update) {
        console.log('PUT OBJECT UPDATE: ', update);
      });
    return defer.promise;
  };

  uploadBigFile() {
    // console.log('awsSvc uploading big file');
    this.deferredUpload = this.$q.defer();
    
    // ******************* maintain context for callbacks ********************
    var context = this;

    this.createMultipartUpload()
      .then(context.prepareUploadParts)
      .then(function startUpload() {
        for (var i = 0; i < context.MAX_SIMUL_PARTS_UPLOADING; i++) {
          context.startNextUploadPart();
        }
      });
    return this.deferredUpload.promise;
  };

  createMultipartUpload() {
    var defer = this.$q.defer();

    // ******************* maintain context for callbacks ********************
    var context = this;
    
    this.getUploadSession()
      .then(function createMultipartUpload() {
        var params = {
          Key: context._awsCache.s3.config.params.Prefix + context.fileBeingUploaded.uniqueName,
          ContentType: context.fileBeingUploaded.type,
          ACL: context.PUBLIC_READ
        };
        context._awsCache.s3.createMultipartUpload(params, function (err, data) {
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

  prepareUploadParts(awsMultipartUpload) {
    var defer = this.$q.defer();
    this.multipartUpload = awsMultipartUpload;
    this.chunks = [];
    this.chunkCount = 0;
    this.chunksUploaded = 0;
    this.chunkSearchIndex = 0;
    this.chunkSize = this.fiveMB;
    this.bytesUploaded = 0;
    if (this.fileBeingUploaded.size > this.chunkSize * this.MAX_CHUNKS) {
      this.chunkSize = Math.ceil(this.fileBeingUploaded.size / this.MAX_CHUNKS);
    }
    this.chunkCount = Math.ceil(this.fileBeingUploaded.size / this.chunkSize);
    for (var i = 0; i < this.chunkCount; i++) {
      var chunk = {};
      chunk.start = i * this.chunkSize;
      chunk.end = chunk.start + this.chunkSize;
      chunk.uploaded = 0;
      if (chunk.end > this.fileBeingUploaded.size) {
        chunk.end = this.fileBeingUploaded.size;
      }
      chunk.status = this.PENDING;
      chunk.retries = 0;

      this.chunks.push(chunk);
    }
    defer.resolve();
    return defer.promise;
  };

  startNextUploadPart() {
    var context = this;
    var defer = this.$q.defer();
    var chunkIndex = this.chunkSearchIndex;
    var foundNextChunk = false;
    if (!this.uploadPaused) {
      while (!foundNextChunk && chunkIndex < this.chunkCount) {
        var chunk = this.chunks[chunkIndex];
        if (chunk.status === this.PENDING) {
          foundNextChunk = true;
          chunk.status = this.UPLOADING;
          var blob = this.fileBeingUploaded.slice(chunk.start, chunk.end);
          chunk.cancel = function () {
            chunk.request.abort();
            chunk.status = this.PENDING;
            chunk.uploaded = 0;
          };
          // use $q.all to pass along the part number parameter
          this.$q.all({
            partNumber: this.$q.when(chunkIndex + 1),
            eTag: this.uploadPart(chunkIndex + 1, blob)
          })
            .then(context.completePart, context.handleFailedPart)
            .then(function (data) {
              defer.resolve(data);
            }, function (reason) {
              console.error("UPLOAD PART FAILED: ", reason);
              defer.reject(reason);
            }, function (update) {
              defer.update(update);
            });
        } else if (chunk.status === this.COMPLETE && chunkIndex === this.chunkSearchIndex) {
          this.chunkSearchIndex++;
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

  getMD5ForFileOrBlob(fileOrBlob, hashType) {
    var defer = this.$q.defer();
    var reader = new FileReader();
    reader.onload = function () {
      var data = reader.result;
      defer.resolve(AWS.util.crypto.md5(new Uint8Array(data), hashType));
    };
    reader.readAsArrayBuffer(fileOrBlob);
    return defer.promise;
  };

  uploadPart(partNumber, blob, defer) {
    var context = this;
    // console.log('awsSvc, Uploading part: ', partNumber);
    if (!defer) {
      defer = this.$q.defer();
    }
    this.getUploadSession()
      .then(function () {
        context.getMD5ForFileOrBlob(blob, 'base64')
          .then(function (md5) {
            //console.log("MD5 for part '", partNumber, "' of size '", blob.size,"' is ", md5);
            var params = {
              Bucket: context.multipartUpload.Bucket,
              Key: context.multipartUpload.Key,
              UploadId: context.multipartUpload.UploadId,
              PartNumber: partNumber,
              ContentMD5: md5,
              Body: blob
            };
            context.chunks[partNumber - 1].request = context._awsCache.s3.uploadPart(params, function (err, data) {
              if (err) {
                if (context.chunks[partNumber - 1].retries < context.MAX_RETRIES) {
                  console.error("RETRYING PART UPLOAD FOR CHUNK ", partNumber);
                  context.chunks[partNumber - 1].request.abort();
                  context.chunks[partNumber - 1].retries++;
                  context.uploadPart(partNumber, blob, defer);
                } else {
                  console.error("PART UPLOAD FAILED FOR CHUNK ", partNumber, err, err.stack); // an error occurred
                  context.chunks[partNumber - 1].status = context.FAILED;
                  defer.reject(err);
                }
              } else {
                //console.log('awsSvc, uploadedPart! data.ETag:', data.ETag);
                defer.resolve(data.ETag); // successful response
              }
            });
            context.chunks[partNumber - 1].request
              .on('httpUploadProgress', function (progress) {
                context.bytesUploaded += progress.loaded - context.chunks[partNumber - 1].uploaded;
                context.chunks[partNumber - 1].uploaded = progress.loaded;
                context.deferredUpload.notify({
                  bytesSent: context.bytesUploaded,
                  bytesTotal: context.fileBeingUploaded.size
                });
              })
              .on('error', function (err, response) {
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

  completePart(data) {
    var defer = this.$q.defer();
    this.chunks[data.partNumber - 1].status = this.COMPLETE;
    this.chunks[data.partNumber - 1].part = {
      ETag: data.eTag,
      PartNumber: data.partNumber
    };
    this.chunksUploaded++;
    if (this.chunksUploaded === this.chunkCount) {
      var parts = [];
      for (var i = 0; i < this.chunkCount; i++) {
        parts.push(this.chunks[i].part);
      }
      var params = {
        Bucket: this.multipartUpload.Bucket,
        Key: this.multipartUpload.Key,
        UploadId: this.multipartUpload.UploadId,
        MultipartUpload: {
          Parts: parts
        }
      };
      this._awsCache.s3.completeMultipartUpload(params, function (err, data) {
        if (err) {
          console.error(err, err.stack); // an error occurred
          this.deferredUpload.reject(err);
          defer.reject(err);
        } else {
          this.deferredUpload.resolve(data);
          defer.resolve(data);
        }
      });

    } else {
      this.startNextUploadPart();
    }

    return defer.promise;
  };

  handleFailedPart(err) {
    console.error("PART OF MULTIPART UPLOAD FAILED, CANCELLING UPLOAD", err);
    this.cancelMultipartUpload(this.multipartUpload);
    this.deferredUpload.reject(err);
  };

  cancelCurrentUploadRequests() {
    if (this.isSmallUpload()) {
      this.currentRequest.abort();
    } else {
      var chunkIndex = this.chunkSearchIndex;
      var foundAllUploadingChunks = false;
      while (!foundAllUploadingChunks && chunkIndex < this.chunkCount) {
        var chunk = this.chunks[chunkIndex];
        if (chunk.status === this.UPLOADING) {
          // console.log('awsSvc, Cancelling upload of chunk: ', chunkIndex);
          chunk.cancel();
        } else if (chunk.status === this.PENDING) {
          foundAllUploadingChunks = true;
        }
        chunkIndex++;
      }
    }
  };

  createAssetSuccess = function( data, assetEndpoint ) {
    this.deferredUploads[this.fileIndex].resolve(data);
    this.fileBeingUploaded = null;
    this.fileIndex++;
    this.startNextUpload(assetEndpoint);
  }

  createAsset = function (assetEndpoint) {
    var context = this;
    var deferred = this.$q.defer();
    var assetData = {
      'url': 'https://s3.amazonaws.com/' + this._awsCache.s3.config.params.Bucket + '/' + this._awsCache.s3.config.params.Prefix + this.fileBeingUploaded.uniqueName,
      'type': this.fileBeingUploaded.type,
      'size': this.fileBeingUploaded.size,
      'original_filename': this.fileBeingUploaded.name
    };
    //add tag if necessary
    if (this.fileMeta[this.fileBeingUploaded.name]) {
      Object.assign(assetData, {tags: this.fileMeta[this.fileBeingUploaded.name]});
      this.fileMeta[this.fileBeingUploaded.name] = null;
    }

    this.$http.post(config.apiDataBaseUrl + assetEndpoint, assetData)
      .success((data) => context.createAssetSuccess(data, assetEndpoint))
    /*
      .success(function (data) {
        this.deferredUploads[this.fileIndex].resolve(data);
        this.fileBeingUploaded = null;
        this.fileIndex++;
        this.startNextUpload(assetEndpoint);
      })
      */
      .error(function () {
        context.deferredUploads[context.fileIndex].reject();
        context.fileBeingUploaded = null;
        context.fileIndex++;
        context.startNextUpload(assetEndpoint);
      });
    return deferred.promise;
  };

}
