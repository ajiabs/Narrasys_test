import {IModelSvc, Partial} from '../interfaces';
import {IDataSvc} from '../services/dataSvc';
import {existy} from '../services/ittUtils';
/**
 * Created by githop on 1/31/17.
 */

const TEMPLATE = `
<div class="field">
  <div class="label">Batch Upload Transcripts
  </div>
  <div class="input">
    <div ng-if="!$ctrl.showUploader">
      <span><button ng-click="$ctrl.showUploader = true">Batch Upload Transcripts</button></span>
    </div>


    <itt-asset-uploader
      ng-if="$ctrl.showUploader"
      episode-id="{{$ctrl.episodeId}}"
      mime-types="{{$ctrl.mimes}}"
      on-filedrop="$ctrl.handleTranscriptFiles(data)"
      file-receive="$ctrl.transcripts"
      callback="$ctrl.onUploadComplete()">
    </itt-asset-uploader>

    <itt-modal
      wrapper-class="responsive-modal__wrapper"
      modal-class="responsive-modal__content"
      ng-if="$ctrl.showOptions">
      <div class="smart-sentences__wrapper">
        <div><p>
          Thank you for using this new feature currently in Beta! Are you sure you want to proceed? Once saved,
          transcript entries must be individually edited or deleted. This page will automatically refresh after
          transcripts have successfully uploaded.</p>
        </div>
        <div class="smart-sentences__input">
          <div>
            <input class="smart-sentences__input" id="groupParam" type="checkbox" ng-model="$ctrl.selectedParam"
                   ng-false-value="'none'"
                   ng-true-value="'group_into_sentences'"/>
          </div>
          <div>
            <label class="smart-sentences__input"
                   for="groupParam">Group transcript segments into complete sentences (recommended for closed caption
              transcripts)</label>
          </div>
        </div>
        <div>
          <button ng-click="$ctrl.commenseUpload()">upload transcripts</button>
          <button ng-click="$ctrl.cancelUpload()">cancel</button>
        </div>
      </div>

    </itt-modal>
  </div>
</div>`;

export const TRANSCRIPT_UPLOAD = 'TRANSCRIPT_UPLOAD';
interface ITranscriptPayload {
  payload: {
    type: 'TRANSCRIPT_UPLOAD';
    promises: ng.IPromise<any>;
    files: FileList;
  }
}

class UploadTranscriptsController implements ng.IComponentController {
  mimes: any;
  episodeId: string;
  showOptions: boolean = false;
  showUploader: boolean = false;
  selectedParam: string = 'none';
  maxDuration: number = null;
  transcripts: Partial<ITranscriptPayload> = {};
  private _maxDurParam: string = 'max_subtitle_duration';
  private files: FileList | null;
  static $inject = ['MIMES', 'modelSvc', 'dataSvc', 'timelineSvc'];
  constructor(
    public MIMES,
    public modelSvc: IModelSvc,
    public dataSvc: IDataSvc,
    public timelineSvc) {

  }

  $onInit() {
    this.mimes = this.MIMES.transcripts;
  }

  cancelUpload() {
    this.files = null;
    this.showUploader = false;
    this.showOptions = false;
  }

  handleTranscriptFiles(data: FileList): void {
    this.showOptions = true;
    this.files = data;
  }

  commenseUpload() {
    const params = this.formatParams();
    const files = this.files;
    const promises = this._handleTranscripts(this.episodeId, files[0], params);
    this.transcripts = {
      payload: {
        type: TRANSCRIPT_UPLOAD,
        promises,
        files
      }
    }
  }

  onUploadComplete() {
    //to reset the component;
    this.cancelUpload();
    window.location.reload();
  }

  formatParams() {
    let optionalParams = {};
    if (this.selectedParam !== 'none') {
      optionalParams[this.selectedParam] = true;
    }

    if (existy(this.maxDuration)) {
      optionalParams[this._maxDurParam] = this.maxDuration;
    }

    return optionalParams;
  }

  private _handleTranscripts(episodeId, postData, params) {
    let fd = new FormData();
    fd.append('subtitles', postData);
    return this.dataSvc.batchUploadTranscripts(episodeId, fd, params);
  }

}

export class UploadTranscripts implements ng.IComponentOptions {
  static Name: string = 'ittUploadTranscripts';
  bindings: any = {
    episodeId: '@'
  };
  template: string = TEMPLATE;
  controller: ng.IComponentController = UploadTranscriptsController;
}
