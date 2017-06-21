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
<div ng-if="$ctrl.narrative.enable_social_sharing" class="socialshare-filedrop">

  <div ng-repeat="(tag, imgObj) in $ctrl.images" ng-class="'itt-filedrop__' + tag">
    <itt-filedrop
      on-error="$ctrl.display[tag].error"
      on-drop="$ctrl.handleImage(files, tag)">
      
      <itt-filedrop-target>
        <div class="itt-filedrop__wrapper" ng-if="imgObj.path == null">
          <span class="itt-filedrop__placeholder"></span>
        </div>
      </itt-filedrop-target>

      <itt-filedrop-preview>
        <div ng-if="imgObj.path">
          <span class="socialshare__img--cancel" ng-click="$ctrl.resetImg(imgObj, tag)"></span>
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

interface EnableSocialShareBindings {
  narrative: any;
  containerId: string
  timeline?: any;
}

interface ITagPayload {
  assetId?: string;
  name:string;
  path: string;
  file: FileList | null;
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
  social_image_square: 'Recommend 500 x 500',
  social_image_wide: 'Recommend 1200 x 630'
};

class EnableSocialshareController implements ng.IComponentController, EnableSocialShareBindings {
  narrative;
  timeline;
  containerId;
  //
  browseUploaded: boolean = false;
  images: Partial<IImages> = {
    social_image_square: null,
    social_image_wide: null,
  };
  display: ITagDisplay = {
    social_image_square: {
      text: DEFAULT_DISPLAY_TEXT.social_image_square,
      error: false
    },
    social_image_wide: {
      text: DEFAULT_DISPLAY_TEXT.social_image_wide,
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
    const assetsToFetch = [];
    this.model[this.type + '_image_ids'].forEach(assetId => {
      if (assetId && this.modelSvc.assets[assetId]) {
        this.setImageFromAsset(this.modelSvc.assets[assetId]);
      } else {
        assetsToFetch.push(assetId);
      }
    });

    if (assetsToFetch.length > 0) {
      this.dataSvc.fetchAndCacheAssetsByIds(assetsToFetch)
        .then((assets: IAsset[]) => {
          assets.forEach((asset) => this.setImageFromAsset(asset));
        });
    }
  }

  handleImage(data, currentTag): void {
    this.checkAspectRatio(data[0])
      .then(({images, tag}) => {

      if (currentTag !== tag) {
        return this.$q.reject({errorType: 'TAG_MISMATCH', currentTag, tag});
      }

        this.files[tag].file = data;
        this.images = Object.assign({}, this.images, images);
        //set a reference to the uploaded file
        this.model[tag] = {file: data};
      })
      .catch(({errorType, currentTag, tag}) => this.handleTagmismatchError(errorType, currentTag, tag));
  }

  private handleTagmismatchError(errorType: string, currentTag: string, newTag: string) {
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
  controller = EnableSocialshareController;
}

