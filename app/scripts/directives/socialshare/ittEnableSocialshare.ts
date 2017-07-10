/**
 * Created by githop on 5/26/17.
 */
import { IAsset } from '../../models';

import { IDataSvc, IimageResize, Partial } from '../../interfaces';
import {IModelSvc} from '../../services/modelSvc';
import {SOCIAL_IMAGE_SQUARE, SOCIAL_IMAGE_WIDE, TSocialTagTypes} from '../../constants';
/**
 * Created by githop on 5/22/17.
 */

const TEMPLATE = `
<div ng-if="$ctrl.narrative.enable_social_sharing" class="socialshare-filedrop">

  <div ng-repeat="(tag, imgObj) in $ctrl.images" ng-class="'itt-filedrop__' + tag">
    <itt-filedrop
      on-error="$ctrl.display[tag].error"
      on-drop="$ctrl.handleImage(files, tag)">
      
      <itt-filedrop-target>
        <div class="itt-filedrop__wrapper" ng-if="imgObj.path == null">
          <span class="itt-filedrop__placeholder" ng-class="tag + '--default'"></span>
        </div>
      </itt-filedrop-target>

      <itt-filedrop-preview>
        <div ng-if="imgObj.path">
          <span class="socialshare__img--cancel" ng-hide="imgObj.defaultFromNarrative" ng-click="$ctrl.resetImg(imgObj, tag)"></span>
          <div class="socialshare__img">
            <itt-upload-progress upload="$ctrl.uploadsService.uploadsDisplay[tag]"></itt-upload-progress>
            <img ng-src="{{imgObj.path}}" ng-class="{'--drop-error': $ctrl.display[tag].error}"/>
          </div>
        </div>
      </itt-filedrop-preview> 

    </itt-filedrop> 
    <div>{{$ctrl.display[tag].text}}</div>
  </div>

  <!--begin social controls-->
  <div class="socialshare__controls">
    <button ng-click="$ctrl.toggleBrowseUploaded()">Browse Uploaded</button>
    <label class="button" for="fileBtn">Upload New</label>
    <input id="fileBtn" type="file" accept="image/*" itt-files-handler on-selected="$ctrl.handleImage(files)"/>
  </div>
  <!--end social controls-->

  <!--begin browse uploaded-->
  <itt-modal wrapper-class="responsive-modal__wrapper" modal-class="narrative__modal" ng-if="$ctrl.browseUploaded">
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

interface IEnableSocialShareBindings {
  narrative: any;
  containerId: string;
  timeline?: any;
}

interface ITagPayload {
  assetId?: string;
  name?: string;
  file?: FileList | null;
  defaultFromNarrative?: boolean;
  path: string;
}

interface IDisplay {
  text: string;
  error: boolean;
}

interface ITagDisplay {
  social_image_square: IDisplay;
  social_image_wide: IDisplay;
}

interface IImages {
  social_image_square: ITagPayload;
  social_image_wide: ITagPayload;
}
const DEFAULT_DISPLAY_TEXT = {
  social_image_square: 'Recommend 576 x 576',
  social_image_wide: 'Recommend 1200 x 630'
};

class EnableSocialshareController implements ng.IComponentController, IEnableSocialShareBindings {
  narrative;
  timeline;
  containerId;
  //
  browseUploaded: boolean = false;
  images: Partial<IImages> = {
    social_image_square: null,
    social_image_wide: null
  };
  display: ITagDisplay = {
    social_image_square: {
      text: DEFAULT_DISPLAY_TEXT[SOCIAL_IMAGE_SQUARE],
      error: false
    },
    social_image_wide: {
      text: DEFAULT_DISPLAY_TEXT[SOCIAL_IMAGE_WIDE],
      error: false
    }
  };
  model: any;
  private files = {
    social_image_square: { file: null },
    social_image_wide: { file: null }
  };
  private type: 'narrative' | 'timeline';

  static $inject = ['$q', '$timeout', 'uploadsService', 'imageResize', 'dataSvc', 'modelSvc'];
  constructor(
    private $q: ng.IQService,
    private $timeout: ng.ITimeoutService,
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
    this.fetchAssetsOnInit();
  }

  resetImg(img, type: TSocialTagTypes): void {
    if (this.type === 'timeline' && this.narrative.narrative_image_ids.length > 0) {
      for (const assetId of this.narrative.narrative_image_ids) {
        const asset = this.modelSvc.assets[assetId];
        if (asset.tags.includes(type)) {
          this.images[type] = <ITagPayload> { assetId, path: asset.url, defaultFromNarrative: true };
          if (img.assetId) {
            this.removeImageId(img.assetId);
          }
          return;
        }

      }
    }

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

  handleImage(data, currTag: TSocialTagTypes): void {
    this.checkAspectRatio(data[0])
      .then(({images, tag}) => {

        if (currTag !== tag) {
          return this.$q.reject({errorType: 'TAG_MISMATCH', currTag, tag});
        }
        this.files[tag].file = data;
        this.images = Object.assign({}, this.images, images);
        //set a reference to the uploaded file
        this.model[tag] = {file: data};
      })
      .catch(e => this.handleTagmismatchError(e.errorType, e.currTag, e.tag));
  }

  private fetchAssetsOnInit() {
    if (this.model[this.type + '_image_ids'] && this.model[this.type + '_image_ids'].length > 0) {

      if (this.type === 'timeline') {
        if (this.narrative.narrative_image_ids.length > 0) {
          this.getImageAssets('narrative', true).then(() => void 0);
        }
      }

      this.getImageAssets(this.type).then(() => void 0);
    } else {
      //narratives / timelines depend on the client for adding the <type>_image_ids array to new records...
      this.model[this.type + '_image_ids'] = [];
      if (this.type === 'timeline') {
        if (this.narrative.narrative_image_ids.length > 0) {
          this.getImageAssets('narrative', true).then(() => void 0);
        }
      }
    }
  }

  private getImageAssets(type: 'narrative' | 'timeline', skipImgIdArray: boolean = false) {
    return this.$q((resolve) => {
      const assetsToFetch = [];
      this[type][type + '_image_ids'].forEach(assetId => {
        if (assetId && this.modelSvc.assets[assetId]) {
          this.setImageFromAsset(this.modelSvc.assets[assetId], skipImgIdArray);
        } else {
          assetsToFetch.push(assetId);
        }
      });

      if (assetsToFetch.length > 0) {
        this.dataSvc.fetchAndCacheAssetsByIds(assetsToFetch)
          .then((assets: IAsset[]) => {
            assets.forEach((asset) => this.setImageFromAsset(asset, skipImgIdArray));
            return resolve();
          });
      }

      return resolve();
    });
  }

  private handleTagmismatchError(errorType: string, currentTag: TSocialTagTypes, newTag: TSocialTagTypes) {
    this.display[currentTag].error = true;
    this.display[currentTag].text = 'The aspect ratio is not correct.';
    this.$timeout(() => {
      this.display[currentTag].error = false;
      this.display[currentTag].text = DEFAULT_DISPLAY_TEXT[currentTag];
    }, 3 * 1000);
  }

  private checkAspectRatio(file: File) {
    return this.imageResize.readFileToImg(file)
      .then((img: HTMLImageElement) => {
        const tag: TSocialTagTypes = this.imageResize.getImageTagType(img.width, img.height);
        const images = { [tag]: {name: file.name, path: img.src } };
        return {images, tag};
      });
  }

  private setImageFromAsset(asset: IAsset, skipImgIdArray: boolean = false): void {
    const tagType: TSocialTagTypes = asset.tags[0];
    const currentImage = this.images[tagType];

    this.images[tagType] = { assetId: asset._id, path: asset.url };

    if (skipImgIdArray) {
      this.images[tagType].defaultFromNarrative = true;
      return;
    }

    if (currentImage && currentImage.assetId) {
      this.removeImageId(currentImage.assetId);
    }

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
  bindings: any = {
    containerId: '@?',
    narrative: '=',
    timeline: '=?'
  };
  template: string = TEMPLATE;
  controller = EnableSocialshareController;
  static Name: string = 'ittEnableSocialshare'; // tslint:disable-line
}

