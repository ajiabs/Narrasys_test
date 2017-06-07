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

const old = `
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

const TEMPLATE = `
<span>
  <label for="socialshare-checkbox">Enable Socialshare</label>
  <input id="socialshare-checkbox" type="checkbox" ng-model="$ctrl[$ctrl.type].enable_social_sharing"/>
</span>
<div ng-if="$ctrl[$ctrl.type].enable_social_sharing" class="socialshare-filedrop">
<!--begin square image-->
  <itt-filedrop
    class="itt-filedrop__square"
    ng-if="$ctrl.images.square == null"
    on-drop="$ctrl.handleImage(files)">
  </itt-filedrop>
  <div class="itt-filedrop__square" ng-if="$ctrl.images.square.path">
   <itt-upload-progress upload="$ctrl.uploadsService.uploadsDisplay.square"></itt-upload-progress>
   <span class="socialshare__img--cancel" ng-click="$ctrl.resetImg($ctrl.images.square, 'square')"></span>
   <img class="socialshare__img" ng-src="{{$ctrl.images.square.path}}"/>
  </div>
  <!--end square image-->
  
  <!--begin wide image-->
  <itt-filedrop
    class="itt-filedrop__wide"
    ng-if="$ctrl.images.wide == null"
    on-drop="$ctrl.handleImage(files)">
  </itt-filedrop>
  <div class="itt-filedrop__wide" ng-if="$ctrl.images.wide.path">
    <itt-upload-progress upload="$ctrl.uploadsService.uploadsDisplay.wide"></itt-upload-progress>
    <span class="socialshare__img--cancel" ng-click="$ctrl.resetImg($ctrl.images.wide, 'wide')"></span>
    <img class="socialshare__img" ng-src="{{$ctrl.images.wide.path}}"/>
  </div>
  <!--end wide image-->
  
  <!--begin social controls-->
  <div class="socialshare__controls">
    <button ng-click="$ctrl.toggleBrowseUploaded()">Browse Uploaded</button>
    <label class="button" for="fileBtn">Upload New</label>
    <input id="fileBtn" type="file" accept="image/*" itt-files-handler on-selected="$ctrl.handleImage(files)"/>
  </div>
  <!--end social controls-->
  
  <!--begin browse uploaded-->
    <itt-modal modal-class="narrative__modal" ng-if="$ctrl.browseUploaded">
    <div class="scrollContainer">
      <sxs-container-assets
        container-id="{{$ctrl.containerId}}"
        on-asset-select="$ctrl.uploadedAssetSelected($assetId)"
        context="narrative">
      </sxs-container-assets>
    </div>
    <div class="controlsContainer">
      <button ng-click="$ctrl.toggleBrowseUploaded()">Cancel</button>
    </div>
  </itt-modal>
  <!--end browse uploaded-->
  
</div>
`;

interface EnableSocialShareBindings {
  narrative: any;
  containerId: string
  editorForm: ng.IFormController;
  timeline?: any;
}

interface IImages {
  square: { assetId?: string, name:string, path: string, file: FileList | null };
  wide: { assetId?: string, name: string, path: string, file: FileList | null };
}

class EnableSocialshareController implements ng.IComponentController, EnableSocialShareBindings {
  narrative;
  timeline;
  containerId;
  editorForm: ng.IFormController;
  //
  browseUploaded: boolean = false;
  images: Partial<IImages> = {
    square: null,
    wide: null,
  };
  model: any;
  imageIdsArr: string[];
  private files = {
    square: { file: null },
    wide: { file: null }
  };

  private type: 'narrative' | 'timeline';
  static $inject = ['$scope', 'uploadsService', 'imageResize', 'dataSvc', 'modelSvc'];
  constructor(
    private $scope: ng.IScope,
    public uploadsServce,
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
    if (this.imageIdsArr && this.imageIdsArr.length > 0) {
      this.getImageAssets();
    }
  }

  // setSelection(type: 'uploadNew' | 'browseUploaded'): void {
  //   this.selection = type;
  // }

  resetImg(img, type: string): void {
    this.images[type] = null;
    if (img.assetId) {
      this.removeImageId(img.assetId);
    }
  }

  private removeImageId(targetId: string): void {
    this.imageIdsArr = this.imageIdsArr.filter(id => targetId !== id);
  }

  private addImageId(targetId: string): void {
    if (!this.imageIdsArr.includes(targetId)) {
      this.imageIdsArr.push(targetId);
    }
  }

  toggleBrowseUploaded() {
    this.browseUploaded = !this.browseUploaded;
  }

  uploadedAssetSelected(assetId) {
    let imgAsset = this.modelSvc.assets[assetId];
    this.setImageFromAsset(imgAsset);
  }

  // toggleEditsocialshare() {
  //   this.editSocialshare = !this.editSocialshare;
  //   //get social images
  //   if (this.model.enable_social_sharing === true && this.imageIdsArr.length === 2) {
  //     this.getImageAssets();
  //   }
  // }

  getImageAssets() {
    this.dataSvc.fetchAndCacheAssetsByIds(this.imageIdsArr)
      .then((assets: IAsset[]) => {
        assets.forEach((asset) => this.setImageFromAsset(asset));
      });
  }

  private setImageFromAsset(asset: IAsset): void {
    const tagType = asset.tags[0];
    const currentImage = this.images[tagType];
    if (currentImage && currentImage.assetId) {
      this.removeImageId(currentImage.assetId)
    }
    this.images[tagType] = { assetId: asset._id, path: asset.url };
    this.addImageId(asset._id);

    console.log('img ids arr', this.imageIdsArr);
    console.log('old', currentImage, 'new', asset._id);
  }

  handleImage(data): void {
    this.checkAspectRatio(data[0])
      .then(({images, tag}) => {
        data[0].tags = [tag];
        this.files[tag].file = data;
        this.images = Object.assign({}, this.images, images);
        this.model[tag] = {file: data};
        console.log('fileList huh?', data);
      })
      .catch(e => console.log('whoopsies', e));
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
    //
    // this.newImgIds.push(data);
    // if (this.newImgIds.length === 2) {
    //   this.editorForm.$setValidity(this.editorForm.$name, true, this.editorForm);
    //   this.model[this.type + '_image_ids'] = this.newImgIds;
    // }



  }

  private checkAspectRatio(file: File) {
    // this.editorForm.$setValidity(this.editorForm.$name, false, this.editorForm);
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

