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
  uploadTaggedFiles(fileLists: any[], containerId: string): ng.IPromise<any>;
  resetUploadDisplay(): void;
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

  uploadTaggedFiles(fileLists: any[], containerId: string): ng.IPromise<any> {

    return this.$q((resolve, reject) => {
      for (const fileList of fileLists) {
        const tagType = fileList[0].tags[0];
        this.uploadsDisplay[tagType] = {
          'bytesSent': 0,
          'bytesTotal': 1,
          'percent': 0,
          'name': fileList[0].name
        };

        this.uploadQueue.push(this.uploadToAws(containerId, fileList, tagType));
      }

      return this.$q.all(this.uploadQueue)
        .then(data => resolve(data))
        .catch(e => reject(e));
    });

  }

  resetUploadDisplay(): void {
    this.uploadsDisplay = {
      square: null,
      wide: null,
    };
  }

  private uploadToAws(containerId, fileList, tagType) {
    return this.awsSvc.uploadContainerFiles(containerId, fileList)[0]
      // .then(
      //   (asset) => asset,
      //   (e) => console.error('e', e),
      //   (progress) => {
      //     this.uploadsDisplay[tagType].bytesSent = progress.bytesSent;
      //     this.uploadsDisplay[tagType].bytesTotal = progress.bytesTotal;
      //     this.uploadsDisplay[tagType].percent = Math.ceil(progress.bytesSent / progress.bytesTotal * 100);
      //     console.log('progress is a thing', this.uploadsDisplay);
      //   }
      // );
      .then(asset => asset)
      .catch(e => console.error('upload error', e))
      .finally(null, progress => {
        this.uploadsDisplay[tagType].bytesSent = progress.bytesSent;
        this.uploadsDisplay[tagType].bytesTotal = progress.bytesTotal;
        this.uploadsDisplay[tagType].percent = Math.ceil(progress.bytesSent / progress.bytesTotal * 100);
        console.log('progress is a thing', this.uploadsDisplay);
      });
  }

}

