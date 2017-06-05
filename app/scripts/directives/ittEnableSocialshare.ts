/**
 * Created by githop on 5/26/17.
 */
import {IimageResize, Partial} from '../interfaces';
import {SOCIAL_UPLOAD} from './ittAssetUploader';
import {IDataSvc} from '../services/dataSvc';
import {IModelSvc} from '../services/modelSvc';
import {createInstance, IAsset} from '../models';
/**
 * Created by githop on 5/22/17.
 */

const TEMPLATE = `
<div>
  <button ng-if="!$ctrl.editSocialshare" ng-click="$ctrl.toggleEditsocialshare()">Social share settings</button>
</div>

<div ng-if="$ctrl.editSocialshare">
  <label for="socialshare-checkbox">Enable Socialshare</label>
  <input id="socialshare-checkbox" type="checkbox" ng-model="$ctrl[$ctrl.type].enable_social_sharing"/>
</div>

<div ng-if="$ctrl[$ctrl.type].enable_social_sharing && $ctrl.editSocialshare">

  <div class="controls" ng-if="!$ctrl.selection">
    <button ng-click="$ctrl.setSelection('uploadNew')">upload new</button>
    <div ng-if="$ctrl.imageIdsArr.length > 0">
    
      <button ng-click="$ctrl.setSelection('browseUploaded')">browse uploaded</button>
      <itt-social-images images="$ctrl.images"></itt-social-images>
    </div>
  </div>
  <!--browse uploaded-->
  <itt-modal modal-class="narrative__modal" ng-if="$ctrl.selection === 'browseUploaded'" class="brows-uploaded">
    <div class="scrollContainer">
      <sxs-container-assets container-id="{{$ctrl.containerId}}" context="narrative"></sxs-container-assets>
    </div>
    <div class="controlsContainer">
      <button ng-click="$ctrl.setSelection(null)">Cancel</button>
    </div>
  </itt-modal>
  <!--upload new-->
  <div ng-if="$ctrl.selection === 'uploadNew'" class="upload-new">

    <itt-social-images images="$ctrl.images">
      <button
        ng-click="$ctrl.sendUploads()"
        ng-if="$ctrl.images.square.path && $ctrl.images.wide.path">Upload images
      </button>    
    </itt-social-images>

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
  editSocialshare: boolean = false;
  selection: 'uploadNew' | 'browseUploaded' | null;
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
  model: any;
  imageIdsArr: string[];
  newImgIds: string[] = [];
  private files = {
    square: {name: '', path: '', file: null},
    wide: {name: '', path: '', file: null}
  };

  private type: 'narrative' | 'timeline';
  static $inject = ['$scope', 'imageResize', 'dataSvc', 'modelSvc'];
  constructor(
    private $scope: ng.IScope,
    private imageResize: IimageResize,
    private dataSvc: IDataSvc,
    private modelSvc: IModelSvc) {}

  $onInit() {
    if (this.timeline == null) {
      this.type = 'narrative';
    } else {
      this.type = 'timeline';
    }
    this.model = this[this.type];
    this.imageIdsArr = this.model[this.type + '_image_ids'];
    console.log('it worked!', this.imageIdsArr);
  }

  setSelection(type: 'uploadNew' | 'browseUploaded'): void {
    this.selection = type;
  }

  toggleEditsocialshare() {
    this.editSocialshare = !this.editSocialshare;
    //get social images
    if (this.model.enable_social_sharing === true && this.imageIdsArr.length === 2) {
      this.getImageAssets();
    }
  }

  async getImageAssets() {
    const [a, b] = this.imageIdsArr;
    const [imgA, imgB] = [this.dataSvc.getSingleAsset(a), this.dataSvc.getSingleAsset(b)];
    try {
      for (const resp of [imgA, imgB]) {
        const img: IAsset = createInstance('Asset', await resp);
        const tagType = img.tags[0];
        this.modelSvc.cache('asset', img);
        this.images[tagType] = {path: img.url};
      }
      //async await happens outside of digest loop unfortunately
      this.$scope.$apply();
    } catch (e) {
      console.log('whoops!', e);
    }
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

  handleComplete(data) {
    //as file uploads complete, the file id is returned
    //push the returned id into the relevant image_ids array
    // if (this[this.type][this.type + '_image_ids'] && this[this.type][this.type + '_image_ids'].length) {
    //   this[this.type][this.type + '_image_ids'].push(data);
    //
    //   if(this[this.type][this.type + '_image_ids'].length === 2) {
    //     //when we have both of our files, set form back to valid and allow user to save.
    //     this.editorForm.$setValidity(this.editorForm.$name, true, this.editorForm);
    //   }
    //
    // } else {
    //   this[this.type][this.type + '_image_ids'] = [data];
    // }

    this.newImgIds.push(data);
    if (this.newImgIds.length === 2) {
      this.editorForm.$setValidity(this.editorForm.$name, true, this.editorForm);
      this.model[this.type + '_image_ids'] = this.newImgIds;
    }

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

