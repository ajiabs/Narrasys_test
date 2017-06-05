import {IModelSvc, IDataSvc} from '../interfaces';

const TRANSCRIPT_UPLOAD = 'TRANSCRIPT_UPLOAD';
export const SOCIAL_UPLOAD = 'SOCIAL_UPLOAD';

interface AssetUploaderBindings {
  containerId?: string;
  episodeId?: string;
  callback?: (data: any) => any;
  onFiledrop?: (data: any) => any;
  fileReceive?: any;
  mimeTypes: string;
  instructions?: string;
  errorText?: string;
  multiple?: boolean;
}

class AssetUploaderController implements ng.IComponentController, AssetUploaderBindings {
  //bindings
  containerId: string;
  episodeId: string;
  callback: (data: any) => any;
  onFiledrop?: (data: any) => { data: FileList };
  fileReceive?: any;
  mimeTypes: string;
  instructions: string | undefined;
  errorText: string;
  multiple: boolean = false;
  //props
  uploadsinprogress = 0;
  paused: boolean = false;
  errormessage: string;
  uploadStatus = [];
  uploads = [];
  manPage: string;
  private droptarget: JQuery;
  private fileinput: JQuery;
  private mimeTypesArr: string[];
  static $inject = ['$timeout', '$element', 'awsSvc', 'appState', 'modelSvc', 'dataSvc'];

  constructor(public $timeout: ng.ITimeoutService,
              public $element,
              public awsSvc,
              public appState,
              public modelSvc: IModelSvc,
              public dataSvc: IDataSvc) {
  }

  $onInit() {
    if (this.instructions === undefined) {
      this.manPage = 'We support uploads of most common file formats, including .doc, .docx, .jpeg, .jpg, .pdf, .png, .ppt, .pptx, .rtf, .txt, and .zip. ';
    } else {
      this.manPage = this.instructions;
    }

    if (this.mimeTypes == null) {
      //allow basically doc, image, or video.
      this.mimeTypesArr = ['application/*', 'image/*', 'video/*', 'text/*', 'audio/*', 'model/*'];
    } else {
      this.mimeTypesArr = (<string>this.mimeTypes).split(',');
    }

    if (this.errorText === undefined) {
      this.errorText = 'Whoops! You may want to try that again!';
    }

    //normalize passed in params
    this.mimeTypesArr = this.mimeTypesArr.map(m => m.trim());
  }

  $postLink() {
    this.$timeout(() => { // need to wait for the DOM
      this.droptarget = this.$element.find('.uploadDropTarget');
      this.fileinput = this.$element.find('.uploadFileInput');
      this.uploadsinprogress = 0;
      this.droptarget[0].addEventListener('drop', (ev) => this.handleDrop(ev));
      this.droptarget[0].addEventListener('dragover', (ev) => this.handleDragOver(ev));
      this.droptarget[0].addEventListener('dragenter', (ev) => this.handleDragEnter(ev));
      this.droptarget[0].addEventListener('dragleave', (ev) => this.handleDragLeave(ev));
    });
  }

  $onChanges(changesObj) {
    if (changesObj.fileReceive) {
      const { fileReceive: { currentValue } } = changesObj;
      const { payload } = currentValue;
      if (payload != null) {
        switch (payload.type) {
          case SOCIAL_UPLOAD:
            // Object.entries(payload.files)
            //   .map(([type, fileData]: any) => {
            //     fileData.file[0].tags = [type];
            //     return fileData.file;
            //   })
            //   .forEach((fl: FileList) => this.commenseUploads(fl));
            // break;
        }
      }
    }
  }

  //pause and resume and cancel are currently broken on story prior to refactoring into component...
  pauseUpload() {
    this.awsSvc.pauseUpload();
    this.paused = true;
  };

  resumeUpload() {
    this.awsSvc.resumeUpload();
    this.paused = false;
  };

  cancelUpload() {
    this.awsSvc.cancelUpload();
  };

  private handleUploads(files: FileList) {
    if (this.multiple) {
      if (files.length > 1 || this.uploads.length > 0) {
        this.errormessage = 'You may only upload one file at a time here.';
        return false;
      }
    }

    if (!this.checkMimeType(files)) {
      this.errormessage = this.errorText;
      return;
    }

    //if optional onFiledrop attr is used,
    //emit FileList to parent component and bail
    if (this.onFiledrop) {
      this.onFiledrop({data: files});
      return;
    }

    this.commenseUploads(files);
  }

  private commenseUploads(files) {
    const {oldstack, newstack} = this.setupUploadDisplay(files);
    this.processUploads(oldstack, newstack, files);
  }

  private setupUploadDisplay(files: FileList) {
    let oldstack = this.uploads.length;
    let newstack = this.uploads.length + files.length;
    this.uploadsinprogress = this.uploadsinprogress + files.length;

    this.uploadStatus.push({
      'bytesSent': 0,
      'bytesTotal': 1,
      'percent': 0,
      'name': files[0].name
    });

    if (this.containerId) {
      this.uploads = this.uploads.concat(this.awsSvc.uploadContainerFiles(this.containerId, files));
    } else if (this.episodeId) {
      this.uploads = this.uploads.concat(this.handleTranscripts(this.episodeId, files[0]));
    } else {
      this.uploads = this.uploads.concat(this.awsSvc.uploadUserFiles(this.appState.user._id, files));
    }

    return {oldstack, newstack};
  }

  private checkMimeType(files): boolean {
    let acceptMimeTypes = false;
    //because fileList object is not iterable, convert it to an array for .forEach to work
    Array.from(files).forEach((file: File) => {
      let fileType = file.type;

      if (this.episodeId) {
        let ext = file.name.match(/(vtt|srt)/);
        if (ext && ext.length) {
          fileType = 'text/' + ext[0];
        }
      }

      this.mimeTypesArr.forEach((m: string) => {
        const paramStrEndsWithStar = AssetUploaderController.strEndsWith(m, '*');
        if (paramStrEndsWithStar) {
          const mimeTypeUntilWildcard = m.slice(0, -1);
          const applicationTypesMatch = AssetUploaderController.strStartsWith(fileType, mimeTypeUntilWildcard);
          if (applicationTypesMatch) {
            acceptMimeTypes = true;
          }
        } else {
          if (fileType === m) {
            acceptMimeTypes = true;
          }
        }
        this.errorText = fileType + ' uploads are not allowed here.';
      });
    });
    return acceptMimeTypes;
  }

  private processUploads(oldstack, newstack, files) {
    for (let i = oldstack; i < newstack; i++) {
      ((i) => { // closure for i
        this.uploadStatus[i] = {
          'bytesSent': 0,
          'bytesTotal': 1,
          'percent': 0,
          'name': files[i - oldstack].name
        };

        this.uploads[i]
          .then((data) => {
            if (this.episodeId && this.callback) {
              this.callback({data: data});
              this.uploadStatus[i].done = true;
              this.oneDone();
              return;
            }

            this.modelSvc.cache('asset', data.file);
            if (this.callback) {
              this.callback({data: data.file._id});
            }
            this.uploadStatus[i].done = true;
            this.oneDone();
          })
          .catch(error => {
            this.uploadStatus[i].error = error;
          })
          //second arg $q finally is 'nofify' to handle updaing upload progress
          .finally(null, update => {
            this.uploadStatus[i].bytesSent = update.bytesSent;
            this.uploadStatus[i].bytesTotal = update.bytesTotal;
            this.uploadStatus[i].percent = Math.ceil(update.bytesSent / update.bytesTotal * 100);
          });
      })(i);
    }
  }

  private oneDone() {
    this.uploadsinprogress = this.uploadsinprogress - 1;
    if (this.uploadsinprogress === 0) {
      this.fileinput.value = '';
      this.paused = false;
    }
  };

  private handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    this.handleDragLeave(e);
    this.handleUploads(e.dataTransfer.files);
  };

  private handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.handleDragEnter(e);
    return false;
  };

  private handleDragEnter(e) {
    this.droptarget.addClass('droppable');
  };

  private handleDragLeave(e) {
    this.droptarget.removeClass('droppable');
  };

  private handleTranscripts(episodeId, postData) {
    let fd = new FormData();
    fd.append('subtitles', postData);
    return this.dataSvc.batchUploadTranscripts(episodeId, fd);
  }

  private static strStartsWith(str, prefix) {
    return str.indexOf(prefix) === 0;
  }

  private static strEndsWith(str, match) {
    return str.substring(str.length - match.length, str.length) === match;
  }

}

export class AssetUploader implements ng.IComponentOptions {
  static Name: string = 'ittAssetUploader';
  bindings: any = {
    containerId: '@?', // If no container ID is supplied, the uploaded asset(s) will be placed in user space instead.
    episodeId: '@?', //for uploading transcripts
    callback: '&?', // function that will be called for each uploaded file (with the newly cretaed asset's ID)
    onFiledrop: '&?',
    fileReceive: '<?',
    mimeTypes: '@?',
    instructions: '@?',
    errorText: '@?',
    multiple: '<?'
  };
  templateUrl: string = 'templates/producer/asset-uploader.html';
  controller: ng.IComponentController = AssetUploaderController;
}
