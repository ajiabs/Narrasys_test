/**
 * Created by githop on 5/26/17.
 */
import {IimageResize, Partial} from '../interfaces';
import {IDataSvc} from '../services/dataSvc';
import {IModelSvc} from '../services/modelSvc';
import { IAsset } from '../models';
/**
 * Created by githop on 5/22/17.
 */

const TEMPLATE = `
<span>
  <label for="socialshare-checkbox">Enable Socialshare</label>
  <input
    id="socialshare-checkbox"
    type="checkbox"
    ng-disabled="$ctrl.type === 'timeline' || $ctrl.narrative.disableSocialshare"
    ng-model="$ctrl.narrative.enable_social_sharing"/>
</span>
<div ng-if="$ctrl.narrative.enable_social_sharing" class="socialshare-filedrop">

  <div ng-repeat="(tag, imgObj) in $ctrl.images" ng-class="'itt-filedrop__' + tag">
    <itt-filedrop
      ng-if="imgObj == null"
      on-drop="$ctrl.handleImage(files)">
    </itt-filedrop>
    <div ng-if="imgObj.path">
      <span class="socialshare__img--cancel" ng-click="$ctrl.resetImg(imgObj, tag)"></span>
      <div class="socialshare__img">
        <itt-upload-progress upload="$ctrl.uploadsService.uploadsDisplay[tag]"></itt-upload-progress>
        <img ng-src="{{imgObj.path}}"/>
      </div>
    </div>
  </div>

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
  //
  browseUploaded: boolean = false;
  images: Partial<IImages> = {
    square: null,
    wide: null,
  };
  model: any;
  private files = {
    square: { file: null },
    wide: { file: null }
  };
  private type: 'narrative' | 'timeline';

  static $inject = ['uploadsService', 'imageResize', 'dataSvc', 'modelSvc'];
  constructor(
    public uploadsService,
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
    if (this.model[this.type + '_image_ids'] && this.model[this.type + '_image_ids'].length > 0) {
      this.getImageAssets();
    } else {
      //narratives / timelines depend on the client for adding the <type>_image_ids array to new records...
      this.model[this.type + '_image_ids'] = [];
    }
  }

  resetImg(img, type: string): void {
    this.images[type] = null;
    if (img.assetId) {
      this.removeImageId(img.assetId);
    }
  }

  toggleBrowseUploaded() {
    this.browseUploaded = !this.browseUploaded;
  }

  uploadedAssetSelected(assetId) {
    let imgAsset = this.modelSvc.assets[assetId];
    this.setImageFromAsset(imgAsset);
    this.browseUploaded = false;
  }

  getImageAssets() {
    this.dataSvc.fetchAndCacheAssetsByIds(this.model[this.type + '_image_ids'])
      .then((assets: IAsset[]) => {
        assets.forEach((asset) => this.setImageFromAsset(asset));
      });
  }

  handleImage(data): void {
    this.checkAspectRatio(data[0])
      .then(({images, tag}) => {
        this.files[tag].file = data;
        this.images = Object.assign({}, this.images, images);
        //set a reference to the uploaded file
        this.model[tag] = {file: data};
      })
      .catch(e => console.log('whoopsies', e));
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

  private setImageFromAsset(asset: IAsset): void {
    const tagType = asset.tags[0];
    const currentImage = this.images[tagType];
    if (currentImage && currentImage.assetId) {
      this.removeImageId(currentImage.assetId)
    }
    this.images[tagType] = { assetId: asset._id, path: asset.url };
    this.addImageId(asset._id);
  }

  private removeImageId(targetId: string): void {
    this.model[this.type + '_image_ids'] = this.model[this.type + '_image_ids'].filter(id => targetId !== id);
  }

  private addImageId(targetId: string): void {

    if (!this.model[this.type + '_image_ids'].includes(targetId)) {
      this.model[this.type + '_image_ids'].push(targetId);
    }
  }
}

export class EnableSocialshare implements ng.IComponentOptions {
  static Name: string = 'ittEnableSocialshare';
  bindings: any = {
    containerId: '@?',
    narrative: '=',
    timeline: '=?'
  };
  template: string = TEMPLATE;
  controller: ng.IComponentController = EnableSocialshareController;
}

