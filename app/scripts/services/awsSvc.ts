import * as AWS from 'aws-sdk';
import { generateUUID } from './ittUtils';

interface IChunk {
  start: number;
  end: number;
  uploaded: number;
  status: string;
  retries: number;
  request: AWS.Request<AWS.S3.UploadPartOutput, AWS.AWSError>;
  part: AWS.S3.CompletedPart;
  cancel(): void;
}

interface IAwsCache{
  sessionDeferred: ng.IDeferred<any>;
  s3: AWS.S3;
}

interface IAwsSvc {
  getBucketListing(): ng.IPromise<any>;
  uploadContainerFiles(
    containerId: string,
    fileList: FileList,
    tag?: string
  ): ng.IPromise<any>[];
  uploadUserFiles(
    userId: string,
    fileList: FileList
  ): ng.IPromise<any>[];
  pauseUpload(): void;
  resumeUpload(): void;
  cancelUpload(): void;
  networkError(): void;
  deleteObject(bucketObject: any): ng.IPromise<any>;
  getMultipartUploads(): ng.IPromise<AWS.S3.ListMultipartUploadsOutput>;
  getMultipartUploadParts(
    index: number,
    multipartUpload: any
  ): ng.IPromise<{ i: number, parts: any }>;
  cancelMultipartUpload(multipartUpload: any): ng.IPromise<any>;
}

export class AwsService implements IAwsSvc {
  MAX_CHUNKS = 1000;
  MAX_RETRIES = 4;
  MAX_SIMUL_PARTS_UPLOADING = 3;
  REQUEST_TIMEOUT = 30000; //30 seconds (default is 2 minutes)
  PUBLIC_READ = 'public-read';
  PENDING = 'pending';
  UPLOADING = 'uploading';
  FAILED = 'failed';
  COMPLETE = 'complete';
  svc = {};
  awsCache = {
    s3: {}
  } as IAwsCache;
  fiveMB = 1024 * 1024 * 5;
  chunkSize = 0;
  chunkCount = 0;
  chunksUploaded = 0;
  chunks: IChunk[] = [];
  chunkSearchIndex = 0;
  files = [];
  fileMeta = {};
  fileIndex = 0;
  fileBeingUploaded;
  bytesUploaded = 0;
  multipartUpload: AWS.S3.CompleteMultipartUploadRequest;
  deferredUploads = [];
  deferredUpload;
  currentRequest: AWS.Request<any, any>;
  uploadPaused = false;
  static Name = 'awsSvc'; // tslint:disable-line
  static $inject = ['$http', '$q', 'config'];
  constructor(
    private $http: ng.IHttpService,
    private $q: ng.IQService,
    private config) {
    //
  }

  getBucketListing() {
    const defer = this.$q.defer();
    this.getUploadSession().then(() => {
      this.awsCache.s3.listObjects((err, data) => {
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
  }

  /*
 CRUFT asset creation endpoint is passed down through uploadFiles, startNextUpload, and createAsset.
 TODO Refactor to create asset record outside of awsSvc, after returned promise from uploadFiles
 (meaning we could go back to a single svc.uploadFiles fn),
 or at the very least to handle it within these next two functions instead of passing it all the way down the chain
 */

  uploadContainerFiles(containerId: string, fileList: FileList, tag?) {
    console.log('aws - upload container files', containerId, fileList);
    return this.uploadFiles('/v1/containers/' + containerId + '/assets', fileList, tag);
  }

  uploadUserFiles(userId: string, fileList: FileList) {
    return this.uploadFiles('/v1/users/' + userId + '/assets', fileList);
  }

  pauseUpload() {
    if (this.fileBeingUploaded && !this.uploadPaused) {
      this.uploadPaused = true;
      this.cancelCurrentUploadRequests();
      if (this.isSmallUpload()) {
        this.bytesUploaded = 0;
      } else {
        let chunkIndex = 0;
        this.bytesUploaded = 0;
        while (chunkIndex < this.chunkCount) {
          const chunk = this.chunks[chunkIndex];
          if (chunk.status === this.COMPLETE) {
            this.bytesUploaded += chunk.uploaded;
          }
          chunkIndex += 1;
        }
      }
      this.deferredUpload.notify({
        bytesSent: this.bytesUploaded,
        bytesTotal: this.fileBeingUploaded.size
      });
    }
  }

  resumeUpload() {
    if (this.fileBeingUploaded && this.uploadPaused) {
      this.uploadPaused = false;
      if (this.isSmallUpload()) {
        this.putObject();
      } else {
        for (let i = 0; i < this.MAX_SIMUL_PARTS_UPLOADING; i += 1) {
          this.startNextUploadPart();
        }
      }
    }
  }

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
      this.deferredUploads[this.fileIndex].reject('Canceled by user');
    }
    // cancel pending uploads as well
    for (let i = this.fileIndex + 1; i < this.files.length; i += 1) {
      this.deferredUploads[i].reject('Canceled by user');
    }
    this.fileIndex = this.files.length;

  }

  networkError() {
    if (this.fileBeingUploaded) {
      this.cancelCurrentUploadRequests();
    }
  }

  deleteObject(bucketObject) {
    const defer = this.$q.defer();
    this.getUploadSession().then(function deleteObject() {
      const params = {
        Bucket: bucketObject.bucket,
        Key: bucketObject.Key
      };
      this.awsCache.s3.deleteObject(params, (err, data) => {
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
  }

  getMultipartUploads(): ng.IPromise<AWS.S3.ListMultipartUploadsOutput> {
    const defer = this.$q.defer();
    this.getUploadSession().then(() => {
      this.awsCache.s3.listMultipartUploads((err, data) => {
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
  }

  getMultipartUploadParts(index, multipartUpload): ng.IPromise<{ i: number, parts: any }> {
    const defer = this.$q.defer() as ng.IDeferred<{ i: number, parts: any }>;
    this.getUploadSession().then(() => {
      const params = {
        Bucket: multipartUpload.bucket,
        Key: multipartUpload.Key,
        UploadId: multipartUpload.UploadId
      };
      this.awsCache.s3.listParts(params, (err, data) => {
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
  }

  cancelMultipartUpload(multipartUpload): ng.IPromise<any> {
    const defer = this.$q.defer();
    this.getUploadSession().then(() => {
      const params = {
        Bucket: multipartUpload.bucket,
        Key: multipartUpload.Key,
        UploadId: multipartUpload.UploadId
      } as AWS.S3.AbortMultipartUploadRequest;
      this.awsCache.s3.abortMultipartUpload(params, (err, data) => {
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
  }

  //Pass in a FileList object and the container in which the files are to be placed
  private uploadFiles(assetEndpoint: string, fileList: FileList, tag?: string) {
    const deferredUploadsPromises = [];
    // console.log('files: ', files);
    for (let i = 0; i < fileList.length; i += 1) {
      //can access this with regular array index
      //https://developer.mozilla.org/en-US/docs/Web/API/FileList#Example
      this.files.push(fileList[i]);
      if (tag != null) {
        this.fileMeta[fileList[i].name] = [tag];
        // console.log('adding meta stuff', this.fileMeta);
      }
      const deferred = this.$q.defer();
      this.deferredUploads.push(deferred);
      deferredUploadsPromises.push(deferred.promise);
    }
    this.startNextUpload(assetEndpoint);
    // console.log('DEFERRED UPLOADS: ', deferredUploads);
    return deferredUploadsPromises;
  }

  private getUploadSession() {
    if (this.awsCache.hasOwnProperty('sessionDeferred')) {
      return this.awsCache.sessionDeferred.promise;
    } else {
      this.awsCache.sessionDeferred = this.$q.defer();
    }
    this.$http.get(this.config.apiDataBaseUrl + '/v1/aws/s3/upload_session')
      .then(resp => resp.data)
      .then((data: any) => {
        if (data.access_key_id) {
          AWS.config.update({
            accessKeyId: data.access_key_id,
            secretAccessKey: data.secret_access_key,
            sessionToken: data.session_token,
            region: this.config.awsRegion
          });
          const params = {
            maxRetries: 0,
            httpOptions: { timeout: this.REQUEST_TIMEOUT },
            params: {
              Bucket: data.bucket,
              Prefix: data.key_base
            }
          };
          this.awsCache.s3 = new AWS.S3(params);
          this.awsCache.sessionDeferred.resolve(data);
        } else {
          this.awsCache.sessionDeferred.reject();
        }
      })
      .catch(() => {
        this.awsCache.sessionDeferred.reject();
      });
    return this.awsCache.sessionDeferred.promise;
  }

  private startNextUpload(assetEndpoint) {
    // console.log('START NEXT UPLOAD: ', files.length, ', ', fileIndex, ', ', fileBeingUploaded);
    if (this.files.length > this.fileIndex && !this.fileBeingUploaded) {
      this.fileBeingUploaded = this.files[this.fileIndex];
      if (this.fileBeingUploaded.type === '') {
        // console.log('ABORTING UPLOAD, COULD NOT DETERMINE FILE TYPE FOR FILE:', fileBeingUploaded);
        const rejectText = `Could not determine file type for file ${this.fileBeingUploaded.name}`;
        this.deferredUploads[this.fileIndex].reject(rejectText);
        this.fileBeingUploaded = null;
        this.fileIndex += 1;
        this.startNextUpload(assetEndpoint);
        return;
      }
      // console.log('files: ', files);
      // console.log('awsSvc uploading file', fileBeingUploaded);
      this.ensureUniqueFilename().then(() => {
        let fileUploadPromise;
        if (this.isSmallUpload()) {
          fileUploadPromise = this.uploadSmallFile();
        } else {
          fileUploadPromise = this.uploadBigFile();
        }
        fileUploadPromise.then(
          () => {
            this.createAsset(assetEndpoint);
          },
          (reason) => {
            this.deferredUploads[this.fileIndex].reject(reason);
          },
          (update) => {
            this.deferredUploads[this.fileIndex].notify(update);
          }
        );
      });
    }
  }

  private ensureUniqueFilename(_deferred?: ng.IDeferred<any>) {
    const deferred = _deferred || this.$q.defer();
    this.fileBeingUploaded.uniqueName = generateUUID();
    this.getUploadSession().then(() => {
      // console.log('awsSvc, ensureUniqueFilename: ', fileBeingUploaded.uniqueName);
      //First check for an object with the same name
      const params = {
        Key: this.awsCache.s3.config.params.Prefix + this.fileBeingUploaded.uniqueName
      } as AWS.S3.HeadObjectRequest;
      this.awsCache.s3.headObject(params, (err) => {
        if (err) {
          if (err.statusCode !== 404) {
            console.error(err, err.stack); // an error occurred
            deferred.reject(err);
          } else {
            // Then, if this is going to be a multipart upload,
            // make sure there isn't already a multipart upload with the same name
            if (this.isSmallUpload()) {
              deferred.resolve();
            } else {
              this.getMultipartUploads().then((data) => {

                const findUnique = (name) => {
                  // console.log("Looking for a unique name", name);
                  for (let i = 0; i < data.Uploads.length; i += 1) {
                    // console.log("trying ", data.Uploads[i].Key);
                    if (data.Uploads[i].Key === this.awsCache.s3.config.params.Prefix + name) {
                      // console.log("Not unique; try again");
                      return findUnique(generateUUID());
                    }
                  }
                  return name;
                };

                this.fileBeingUploaded.uniqueName = findUnique(this.fileBeingUploaded.uniqueName);
                deferred.resolve();
              });
            }
          }
        } else {
          //Had a filename collision, try again
          this.fileBeingUploaded.uniqueName = generateUUID();
          this.ensureUniqueFilename(deferred);
        }
      });
    });

    return deferred.promise;
  }

  private isSmallUpload() {
    if (this.fileBeingUploaded.size <= this.fiveMB) {
      return true;
    } else {
      return false;
    }
  }

  private uploadSmallFile() {
    // console.log('awsSvc uploading small file');
    this.deferredUpload = this.$q.defer();
    this.putObject().then(
      (data) => {
        console.log('UPLOAD SMALL FILE COMPLETE', data);
      },
      (reason) => {
        console.error('UPLOAD SMALL FILE FAILED: ', reason);
      },
      (update) => {
        console.log('UPLOAD SMALL FILE UPDATE: ', update);
      }
    );
    return this.deferredUpload.promise;
  }

  private putObject() {
    const defer = this.$q.defer();
    this.getUploadSession().then(
      () => {
        this.getMD5ForFileOrBlob(this.fileBeingUploaded, 'base64').then((md5: string) => {
          const params = {
            Key: this.awsCache.s3.config.params.Prefix + this.fileBeingUploaded.uniqueName,
            ContentType: this.fileBeingUploaded.type,
            Body: this.fileBeingUploaded,
            ContentMD5: md5,
            ACL: this.PUBLIC_READ
          } as AWS.S3.PutObjectRequest;

          this.currentRequest = this.awsCache.s3.putObject(params, (err, data) => {
            if (err) {
              console.error(err, err.stack); // an error occurred
              this.deferredUpload.reject();
            } else {
              // console.log('awsSvc, uploaded file!', data);
              this.deferredUpload.resolve(data); // successful response
            }
          });
          this.currentRequest.on('httpUploadProgress', (progress) => {
            this.deferredUpload.notify({
              bytesSent: progress.loaded,
              bytesTotal: progress.total
            });
          }).on('error', function (err, response) {
            console.error('error: ', err, response);
            this.deferredUpload.reject('An error occured while uploading the file, please try again.');
          });
        });
      },
      (reason) => {
        console.error('PUT OBJECT FAILED: ', reason);
      },
      (update) => {
        console.log('PUT OBJECT UPDATE: ', update);
      });
    return defer.promise;
  }

  private uploadBigFile() {
    // console.log('awsSvc uploading big file');
    this.deferredUpload = this.$q.defer();
    this.createMultipartUpload().then(this.prepareUploadParts).then(() => {
      for (let i = 0; i < this.MAX_SIMUL_PARTS_UPLOADING; i += 1) {
        this.startNextUploadPart();
      }
    });
    return this.deferredUpload.promise;
  }

  private createMultipartUpload() {
    const defer = this.$q.defer();
    this.getUploadSession().then(function createMultipartUpload() {
      const params = {
        Key: this.awsCache.s3.config.params.Prefix + this.fileBeingUploaded.uniqueName,
        ContentType: this.fileBeingUploaded.type,
        ACL: this.PUBLIC_READ
      };
      this.awsCache.s3.createMultipartUpload(params, (err, data) => {
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
  }

  private prepareUploadParts(awsMultipartUpload: AWS.S3.CompleteMultipartUploadRequest) {
    const defer = this.$q.defer();
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
    for (let i = 0; i < this.chunkCount; i += 1) {
      const chunk = {} as IChunk;
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
  }

  private startNextUploadPart() {
    const defer = this.$q.defer();
    let chunkIndex = this.chunkSearchIndex;
    let foundNextChunk = false;
    if (!this.uploadPaused) {
      while (!foundNextChunk && chunkIndex < this.chunkCount) {
        const chunk = this.chunks[chunkIndex];
        if (chunk.status === this.PENDING) {
          foundNextChunk = true;
          chunk.status = this.UPLOADING;
          const blob = this.fileBeingUploaded.slice(chunk.start, chunk.end);
          chunk.cancel = () => {
            chunk.request.abort();
            chunk.status = this.PENDING;
            chunk.uploaded = 0;
          };
          // use $q.all to pass along the part number parameter
          this.$q.all({
            partNumber: this.$q.when(chunkIndex + 1),
            eTag: this.uploadPart(chunkIndex + 1, blob)
          }).then((data: any) => this.completePart(data), (e: any) => this.handleFailedPart(e))
            .then(
            (data) => {
              defer.resolve(data);
            },
            (reason) => {
              console.error('UPLOAD PART FAILED: ', reason);
              defer.reject(reason);
            },
            (update) => {
              defer.notify(update);
            });
        } else if (chunk.status === this.COMPLETE && chunkIndex === this.chunkSearchIndex) {
          this.chunkSearchIndex += 1 ;
        }
        chunkIndex += 1;
      }
      if (!foundNextChunk) {
        defer.reject('All chunks uploaded');
      }
    } else {
      defer.reject('Upload paused');
    }

    return defer.promise;
  }

  private getMD5ForFileOrBlob(fileOrBlob, hashType) {
    const defer = this.$q.defer();
    const reader: FileReader = new FileReader();
    reader.onload = () => {
      const data = reader.result;
      defer.resolve(AWS.util.crypto.md5(new Uint8Array(data), hashType));
    };
    reader.readAsArrayBuffer(fileOrBlob);
    return defer.promise;
  }

  private uploadPart(partNumber, blob, defer = this.$q.defer()) {
    // console.log('awsSvc, Uploading part: ', partNumber);
    this.getUploadSession().then(() => {
      this.getMD5ForFileOrBlob(blob, 'base64').then((md5) => {
        //console.log("MD5 for part '", partNumber, "' of size '", blob.size,"' is ", md5);
        const params = {
          Bucket: this.multipartUpload.Bucket,
          Key: this.multipartUpload.Key,
          UploadId: this.multipartUpload.UploadId,
          PartNumber: partNumber,
          ContentMD5: md5,
          Body: blob
        } as AWS.S3.UploadPartRequest;
        this.chunks[partNumber - 1].request = this.awsCache.s3.uploadPart(params, (err, data) => {
          if (err) {
            if (this.chunks[partNumber - 1].retries < this.MAX_RETRIES) {
              console.error('RETRYING PART UPLOAD FOR CHUNK ', partNumber);
              this.chunks[partNumber - 1].request.abort();
              this.chunks[partNumber - 1].retries += 1;
              this.uploadPart(partNumber, blob, defer);
            } else {
              console.error('PART UPLOAD FAILED FOR CHUNK ', partNumber, err, err.stack); // an error occurred
              this.chunks[partNumber - 1].status = this.FAILED;
              defer.reject(err);
            }
          } else {
            //console.log('awsSvc, uploadedPart! data.ETag:', data.ETag);
            defer.resolve(data.ETag); // successful response
          }
        });
        this.chunks[partNumber - 1].request.on('httpUploadProgress', (progress) => {
          this.bytesUploaded += progress.loaded - this.chunks[partNumber - 1].uploaded;
          this.chunks[partNumber - 1].uploaded = progress.loaded;
          this.deferredUpload.notify({
            bytesSent: this.bytesUploaded,
            bytesTotal: this.fileBeingUploaded.size
          });
        }).on('error', (err, response) => {
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
  }

  private completePart(data) {
    const defer = this.$q.defer();
    this.chunks[data.partNumber - 1].status = this.COMPLETE;
    this.chunks[data.partNumber - 1].part = {
      ETag: data.eTag,
      PartNumber: data.partNumber
    } as AWS.S3.CompletedPart;
    this.chunksUploaded += 1;
    if (this.chunksUploaded === this.chunkCount) {
      const parts = [];
      for (let i = 0; i < this.chunkCount; i += 1) {
        parts.push(this.chunks[i].part);
      }
      const params = {
        Bucket: this.multipartUpload.Bucket,
        Key: this.multipartUpload.Key,
        UploadId: this.multipartUpload.UploadId,
        MultipartUpload: {
          Parts: parts
        }
      } as AWS.S3.CompleteMultipartUploadRequest;
      this.awsCache.s3.completeMultipartUpload(params, (err, data) => {
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
  }

  private handleFailedPart(err) {
    console.error('PART OF MULTIPART UPLOAD FAILED, CANCELLING UPLOAD', err);
    this.cancelMultipartUpload(this.multipartUpload);
    this.deferredUpload.reject(err);
  }

  private cancelCurrentUploadRequests() {
    if (this.isSmallUpload()) {
      this.currentRequest.abort();
    } else {
      let chunkIndex = this.chunkSearchIndex;
      let foundAllUploadingChunks = false;
      while (!foundAllUploadingChunks && chunkIndex < this.chunkCount) {
        const chunk = this.chunks[chunkIndex];
        if (chunk.status === this.UPLOADING) {
          // console.log('awsSvc, Cancelling upload of chunk: ', chunkIndex);
          chunk.cancel();
        } else if (chunk.status === this.PENDING) {
          foundAllUploadingChunks = true;
        }
        chunkIndex += 1;
      }
    }
  }

  private createAsset(assetEndpoint) {
    const deferred = this.$q.defer();
    const assetDataUrl = 'https://s3.amazonaws.com/' + this.awsCache.s3.config.params.Bucket
      + '/'
      + this.awsCache.s3.config.params.Prefix + this.fileBeingUploaded.uniqueName;
    const assetData = {
      'url': assetDataUrl,
      'type': this.fileBeingUploaded.type,
      'size': this.fileBeingUploaded.size,
      'original_filename': this.fileBeingUploaded.name
    };
    //add tag if necessary
    if (this.fileMeta[this.fileBeingUploaded.name]) {
      Object.assign(assetData, { tags: this.fileMeta[this.fileBeingUploaded.name] });
      this.fileMeta[this.fileBeingUploaded.name] = null;
    }

    this.$http.post(this.config.apiDataBaseUrl + assetEndpoint, assetData)
      .then((data) => {
        this.deferredUploads[this.fileIndex].resolve(data);
        this.fileBeingUploaded = null;
        this.fileIndex += 1;
        this.startNextUpload(assetEndpoint);
      })
      .catch(() => {
        this.deferredUploads[this.fileIndex].reject();
        this.fileBeingUploaded = null;
        this.fileIndex += 1;
        this.startNextUpload(assetEndpoint);
      });
    return deferred.promise;
  }
}
