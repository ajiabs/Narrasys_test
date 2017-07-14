/**
 * Created by githop on 5/26/17.
 */
import {IAsset, INarrative, ITimeline} from '../../models';

import {IDataSvc, IimageResize} from '../../interfaces';
import {IModelSvc} from '../../services/modelSvc';

import {SOCIAL_IMAGE_SQUARE, SOCIAL_IMAGE_WIDE, TSocialTagTypes} from '../../constants';
/**
 * Created by githop on 5/22/17.
 */

/* tslint:disable: no-trailing-whitespace */
const TEMPLATE = `
<div ng-if="$ctrl.narrative.enable_social_sharing" class="socialshare-filedrop">

  <div ng-repeat="(tag, imgObj) in $ctrl.images" ng-class="'itt-filedrop__' + tag">
    <itt-filedrop
      on-error="$ctrl.display[tag].error"
      on-drop="$ctrl.handleImage(files, tag)">
      
      <itt-filedrop-target>
        <div class="itt-filedrop__wrapper" ng-if="imgObj.path == null">
          <span class="itt-filedrop__placeholder --default-image-opacity" ng-class="tag + '--default'"></span>
        </div>
      </itt-filedrop-target>

      <itt-filedrop-preview>
        <div ng-if="imgObj.path">
          <div class="socialshare__img">
            <itt-upload-progress upload="$ctrl.uploadsService.uploadsDisplay[tag]"></itt-upload-progress>
            <img
              ng-class="{
                '--drop-error': $ctrl.display[tag].error,
                '--default-image-opacity': $ctrl.display[tag].defaultFromNarrative
              }"
              ng-src="{{imgObj.path}}"/>
          </div>
        </div>
      </itt-filedrop-preview> 

    </itt-filedrop> 
    <div>{{$ctrl.display[tag].text}}</div>
  </div>

  <!--begin social controls-->
  <div class="socialshare__controls">
    <button
      ng-disabled="$ctrl.isUsingDefaultImages()"
      ng-click="$ctrl.resetImgs()">
      {{$ctrl.isUsingDefaultImages() ? 'Default images in use' : 'Use default images'}}
    </button>
    <button ng-click="$ctrl.toggleBrowseUploaded()">Browse uploaded</button>
    <label class="button" for="fileBtn">Upload new</label>

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
/* tslint:enable */

interface IEnableSocialShareBindings {
  narrative: any;
  containerId: string;
  timeline?: any;
  editorForm: ng.IFormController;
}

interface ITagPayload {
  assetId?: string;
  name?: string;
  file?: FileList | null;
  path: string | null;
}

interface IDisplay {
  text: string;
  error: boolean;
  defaultFromNarrative: boolean;
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

const initialImages = {
  social_image_square: {file: null, path: null},
  social_image_wide: {file: null, path: null}
};

const initialDisplay = {
  social_image_square: {
    text: DEFAULT_DISPLAY_TEXT[SOCIAL_IMAGE_SQUARE],
    error: false,
    defaultFromNarrative: false
  },
  social_image_wide: {
    text: DEFAULT_DISPLAY_TEXT[SOCIAL_IMAGE_WIDE],
    error: false,
    defaultFromNarrative: false
  }
};

class EnableSocialshareController implements ng.IComponentController, IEnableSocialShareBindings {
  narrative: INarrative;
  timeline: ITimeline;
  containerId: string;
  editorForm: ng.IFormController;
  //
  browseUploaded: boolean = false;
  images: IImages;
  display: ITagDisplay;
  model: any;
  private files = {
    social_image_square: {file: null},
    social_image_wide: {file: null}
  };
  private type: 'narrative' | 'timeline';

  static $inject = ['$q', '$timeout', 'uploadsService', 'imageResize', 'dataSvc', 'modelSvc'];

  constructor(private $q: ng.IQService,
              private $timeout: ng.ITimeoutService,
              public uploadsService,
              private imageResize: IimageResize,
              private dataSvc: IDataSvc,
              private modelSvc: IModelSvc) {
  }

  $onInit() {
    if (this.timeline == null) {
      this.type = 'narrative';
    } else {
      this.type = 'timeline';
    }
    this.model = this[this.type];
    this.setInitialDisplay();
    this.fetchAssetsOnInit();
  }

  resetImgs(): void {

    if (this.type === 'timeline') {
      if (this.narrative.narrative_image_ids && this.narrative.narrative_image_ids.length === 2) {
        this.narrative.narrative_image_ids.forEach((nAssedId: string) => {
          const asset = this.modelSvc.assets[nAssedId];
          const tagType = asset.tags[0];
          this.images[tagType] = {assetId: asset._id, path: asset.url} as ITagPayload;
          this.display[tagType].defaultFromNarrative = true;
        });
      } else {
        this.setInitialDisplay();
      }

      this.timeline.timeline_image_ids = [];
      return;
    }

    this.narrative.narrative_image_ids = [];
    this.images = Object.assign({}, initialImages);
  }

  isUsingDefaultImages(): boolean {
    const fromNarrative = this.display[SOCIAL_IMAGE_SQUARE].defaultFromNarrative === true &&
      this.display[SOCIAL_IMAGE_WIDE].defaultFromNarrative === true;

    const narrasysBranded = this.images[SOCIAL_IMAGE_SQUARE].path == null &&
      this.images[SOCIAL_IMAGE_WIDE].path == null;

    return fromNarrative || narrasysBranded;
  }

  toggleBrowseUploaded() {
    this.browseUploaded = !this.browseUploaded;
  }

  uploadedAssetSelected(assetId) {
    const imgAsset = this.modelSvc.assets[assetId];
    this.setImageFromAsset(imgAsset, false);
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
        this.setValidity();
      })
      .catch(e => this.handleTagmismatchError(e.errorType, e.currTag, e.tag));
  }

  private setInitialDisplay(): void {
    this.display = angular.copy(initialDisplay);
    this.images = angular.copy(initialImages);
  }

  private fetchAssetsOnInit() {
    if (this.type === 'narrative') {
      this.fetchNarrativeImageAssets();
    }

    if (this.type === 'timeline') {
      this.fetchImageAssetsTimeline();
    }
  }

  private fetchNarrativeImageAssets() {
    if (this.narrative && this.narrative.narrative_image_ids && this.narrative.narrative_image_ids.length > 0) {
      this.getImageAssets('narrative').then(() => void 0);
    }
  }

  private fetchImageAssetsTimeline() {

    interface ILoadStatus {
      narrative: string[];
      timeline: string[];
      use?: 'timeline' | 'narrative';
    }

    const loadStatus: ILoadStatus = {
      narrative: [],
      timeline: []
    };

    if (this.timeline.timeline_image_ids && this.timeline.timeline_image_ids.length > 0) {
      // queue timeline ids for loading
      loadStatus.timeline = [...this.timeline.timeline_image_ids];
      // set narrative to only be loaded
      loadStatus.use = 'timeline';
    } else {
      loadStatus.use = 'narrative';
    }

    if (this.narrative.narrative_image_ids && this.narrative.narrative_image_ids.length > 0) {
      // queue narrative ids for loading
      loadStatus.narrative = [...this.narrative.narrative_image_ids];
    }

    const allIds = [...loadStatus.narrative, ...loadStatus.timeline];
    // the above assets need to be retrieved either from teh API or the cache
    // only fetch the necessary ids that aren't already cached
    const idsToFetch = allIds.reduce((toFetch: string[], id: string) => {
      if (!this.modelSvc.assets[id]) {
        toFetch.push(id);
      }
      return toFetch;
    }, []);

    const setCorrectImagesFromAssets = () => {
      loadStatus[loadStatus.use].forEach((id: string) => {
        // the second parameter when true will set the $ctrl.images (for display) with assets from the
        // narrative but avoid putting the ID's from these assets into the timeline.timeline_image_ids array
        this.setImageFromAsset(this.modelSvc.assets[id], loadStatus.use === 'narrative');
      });
    };

    // get assets and set them for use in display
    if (idsToFetch.length > 0) {
      this.dataSvc.fetchAndCacheAssetsByIds(idsToFetch).then(setCorrectImagesFromAssets);
    } else {
      setCorrectImagesFromAssets();
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
    const tagType = asset.tags[0];
    const currentImage = this.images[tagType];

    this.images[tagType] = {assetId: asset._id, path: asset.url} as ITagPayload;
    this.display[tagType].defaultFromNarrative = false;
    if (skipImgIdArray) {
      this.display[tagType].defaultFromNarrative = true;
      this.setValidity();
      return;
    }

    if (currentImage && currentImage.assetId) {
      this.removeImageId(currentImage.assetId);
    }

    this.addImageId(asset._id);
    this.setValidity();
  }

  private setValidity() {
    const {social_image_square, social_image_wide} = this.images;
    const isMixedDefault = this.display[SOCIAL_IMAGE_SQUARE].defaultFromNarrative !==
      this.display[SOCIAL_IMAGE_WIDE].defaultFromNarrative;

    const bothPathsSet = typeof social_image_square.path === 'string' && typeof social_image_wide.path === 'string';
    const bothPathsNull = social_image_square.path == null && social_image_wide.path == null;
    // if either path is null consider invalid or we have mixed default images
    const isValid = !isMixedDefault && (bothPathsSet || bothPathsNull);

    this.editorForm.$setValidity(this.editorForm.$name, isValid, this.editorForm);
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
    timeline: '=?',
    editorForm: '='
  };
  template: string = TEMPLATE;
  controller = EnableSocialshareController;
  static Name: string = 'ittEnableSocialshare'; // tslint:disable-line
}
