/**
 * Created by githop on 6/6/17.
 */

export interface IUploadData {
  bytesSent: number;
  bytesTotal: number;
  percent: number;
  name: string
}

interface IUploadsService {
  uploadTaggedFiles(fileLists: {file: FileList, tag: string}[], containerId: string, tag): ng.IPromise<any>
  resetUploads(): void;
}

//so the upload progess state is not coupled to a component.
export class UploadsService implements IUploadsService {

  // uploadsDisplay: IUploadData[];
  uploadsDisplay = {
    square: null,
    wide: null,
  };
  private uploadQueue: ng.IPromise<any>[] = [];

  static $inject = ['$q', 'awsSvc'];
  constructor(private $q: ng.IQService, private awsSvc) {

  }

  uploadTaggedFiles(fileLists: {file: FileList, tag: string}[], containerId: string, tag): ng.IPromise<any> {

    return this.$q((resolve, reject) => {
      for (const {file, tag} of fileLists) {
        this.uploadsDisplay[tag] = {
          'bytesSent': 0,
          'bytesTotal': 1,
          'percent': 0,
          'name': file[0].name
        };

        this.uploadQueue.push(this.uploadToAws(containerId, file, tag));
      }

      return this.$q.all(this.uploadQueue)
        .then(data => resolve(data))
        .catch(e => reject(e));
    });

  }

  resetUploads(): void {
    this.uploadsDisplay = {
      square: null,
      wide: null,
    };
    this.uploadQueue = [];
  }

  private uploadToAws(containerId, fileList, tagType) {
    return this.awsSvc.uploadContainerFiles(containerId, fileList, tagType)[0]
      .then(asset => asset)
      .catch(e => console.error('upload error', e))
      .finally(null, (progress) => {
        this.uploadsDisplay[tagType].bytesSent = progress.bytesSent;
        this.uploadsDisplay[tagType].bytesTotal = progress.bytesTotal;
        this.uploadsDisplay[tagType].percent = Math.ceil(progress.bytesSent / progress.bytesTotal * 100);
      });
  }

}

