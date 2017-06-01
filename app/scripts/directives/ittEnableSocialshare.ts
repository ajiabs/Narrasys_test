/**
 * Created by githop on 5/26/17.
 */
import {IimageResize, Partial} from '../interfaces';
import {SOCIAL_UPLOAD} from './ittAssetUploader';
/**
 * Created by githop on 5/22/17.
 */

const TEMPLATE = `
<div>
  <button ng-if="!$ctrl[$ctrl.type].enable_social_sharing" ng-click="$ctrl.enableSocialSharing()">Enable social share
  </button>
</div>
<div ng-if="$ctrl[$ctrl.type].enable_social_sharing">

  <div class="controls" ng-if="!$ctrl.selection">
    <button ng-click="$ctrl.setSelection('uploadNew')">upload new</button>
    <button ng-click="$ctrl.setSelection('browseUploaded')">browse uploaded</button>
  </div>
  <!--browse uploaded-->
  <itt-modal modal-class="narrative__modal" ng-if="$ctrl.selection === 'browseUploaded'" class="brows-uploaded">
    <div class="scrollContainer">
      <sxs-container-assets container-id="{{$ctrl.containerId}}"></sxs-container-assets>
    </div>
    <div class="controlsContainer">
      <button>Cancel</button>
    </div>
  </itt-modal>
  <!--upload new-->
  <div ng-if="$ctrl.selection === 'uploadNew'" class="upload-new">
    <div class="social-images__required-tags">
      <itt-validation-tip text="One 'square' and one 'wide' image required"></itt-validation-tip>
      tags: 
      <span
        class="button social-images--tag"
        ng-class="val.file != null ? 'set' : 'unset'"
        ng-repeat="(type, val) in $ctrl.files">
          {{type}}
        </span>
        
        <button
          ng-click="$ctrl.sendUploads()"
          ng-if="$ctrl.images.square.path && $ctrl.images.wide.path">Upload images
        </button>
    </div>
    <div class="social-images">
      <div class="social-images__img" ng-repeat="(imgType, imgPath) in $ctrl.images">
       <span ng-if="imgPath.path.length > 0">
        <img width="95px" ng-src="{{imgPath.path}}"/>
       </span>
      </div>
    </div>

    <itt-asset-uploader
      container-id="{{$ctrl.containerId}}"
      mimeTypes="image/*"
      on-filedrop="$ctrl.handleImage(data)"
      file-receive="$ctrl.uploads"
      callback="$ctrl.handleComplete(data)">
    </itt-asset-uploader>
  </div>

</div>
`;

interface EnableSocialShareBindings {
  narrative: any;
  containerId: string
  editorForm: ng.IFormController;
  timeline?: any;
}

interface IImages {
  square: { name:string, path: string, file: FileList | null };
  wide: { name: string, path: string, file: FileList | null };
}

class EnableSocialshareController implements ng.IComponentController, EnableSocialShareBindings {
  narrative;
  timeline;
  containerId;
  editorForm: ng.IFormController;
  //
  selection: 'uploadNew' | 'browseUploaded';
  images: Partial<IImages> = {
    square: null,
    wide: null,
  };
  uploads = {
    payload: {
      type: null,
      files: null
    }
  };
  private files = {
    square: {name: '', path: '', file: null},
    wide: {name: '', path: '', file: null}
  };

  private type: 'narrative' | 'timeline';
  static $inject = ['imageResize'];
  constructor(private imageResize: IimageResize) {}

  $onInit() {
    if (this.timeline == null) {
      this.type = 'narrative';
    } else {
      this.type = 'timeline';
    }
  }

  setSelection(type: 'uploadNew' | 'browseUploaded'): void {
    this.selection = type;
  }

  enableSocialSharing() {
    this[this.type].enable_social_sharing = true;
  }

  handleImage(data: FileList): void {
    this.checkAspectRatio(data[0])
      .then(({images, tag}) => {
        this.files[tag].file = data;
        this.files[tag].name = data[0].name;

        this.images = Object.assign({}, this.images, images);
      })
      .catch(e => console.log('whoopsies', e));
  }

  sendUploads(): void {
    //using a new object will change the ref thus trigger $onChanges in the
    //asset uploader component

    this.uploads = {
      payload: {
        type: SOCIAL_UPLOAD,
        files: {
          square: this.files.square,
          wide: this.files.wide
        }
      }
    };
  }

  private checkAspectRatio(file: File) {
    this.editorForm.$setValidity(this.editorForm.$name, false, this.editorForm);
    return this.imageResize.readFileToImg(file)
      .then((img: HTMLImageElement) => {
        const tag = this.imageResize.getImageTagType(img.width, img.height);
        const images = { [tag]: {name: file.name, path: img.src } };
        return {images, tag};
      });
  }

  handleComplete(data) {
    //as file uploads complete, the file id is returned
    //push the returned id into the relevant image_ids array
    if (this[this.type][this.type + '_image_ids'] && this[this.type][this.type + '_image_ids'].length) {
      this[this.type][this.type + '_image_ids'].push(data);

      if(this[this.type][this.type + '_image_ids'].length === 2) {
        //when we have both of our files, set form back to valid and allow user to save.
        this.editorForm.$setValidity(this.editorForm.$name, true, this.editorForm);
      }

    } else {
      this[this.type][this.type + '_image_ids'] = [data];
    }

  }
}

export class EnableSocialshare implements ng.IComponentOptions {
  static Name: string = 'ittEnableSocialshare';
  bindings: any = {
    containerId: '@?',
    narrative: '=',
    editorForm: '=',
    timeline: '=?'
  };
  template: string = TEMPLATE;
  controller: ng.IComponentController = EnableSocialshareController;
}

