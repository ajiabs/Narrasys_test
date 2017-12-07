/* WARN I badly misnamed this; it's used in  producer.  TODO eliminate the sxs prefix, it never made sense anyway */

import {IDataSvc, IModelSvc} from '../interfaces';

import {SOCIAL_IMAGE_SQUARE, SOCIAL_IMAGE_WIDE} from '../constants';
import { IAsset } from '../models';
import { omit } from '../services/ittUtils';

interface ISxsContainerAssetsBindings {
  containerId: string;
  mimeKey?: string;
  context?: string;
  onAssetSelect?: ($assetId: string) => string;
  onAssetRemove?: ($ev: { $assetId: string }) => ({ $assetId: string });
}

class SxsContainerAssetsController implements ng.IComponentController, ISxsContainerAssetsBindings {
  containerId: string;
  mimeKey?: string;
  context?: string;
  onAssetSelect?: ($assetId) => string;
  onAssetRemove?: ($ev: { $assetId: string }) => ({ $assetId: string });
  //
  mimes: string;
  isAdmin: boolean;
  isCustAdmin: boolean;
  canAccess: boolean;
  showParent: boolean;
  container: any;
  assets: { [assetId: string]: IAsset };
  onlyImages: boolean;
  gridView: boolean;
  assetToDelete: IAsset;
  static $inject = ['$rootScope', '$q', 'dataSvc', 'modelSvc', 'awsSvc', 'appState', 'MIMES', 'authSvc'];
  constructor(
    public $rootScope: ng.IRootScopeService,
    private $q: ng.IQService,
    public dataSvc: IDataSvc,
    public modelSvc: IModelSvc,
    public awsSvc,
    public appState,
    public MIMES,
    public authSvc) { }

  $onInit() {
    this.$q((resolve, reject) => {
      if (this.modelSvc.containers[this.containerId]) {
        // console.log("Container already loaded");
        this.container = this.modelSvc.containers[this.containerId];
        if (!this.container.assetsHaveLoaded) {
          // console.log("Assets had not loaded, getting them");
          this.dataSvc.getContainerAssets(this.containerId)
            .then(resolve);
        } else {
          resolve();
        }

      } else {
        // console.log("Getting container");
        this.dataSvc.getContainer(this.containerId).then(() => {
          this.container = this.modelSvc.containers[this.containerId];
          this.dataSvc.getContainerAssets(this.containerId)
            .then(resolve);
        });
      }
    }).then(_ => {
      //filter assets if necessary
      if (this.context === 'narrative') {
        this.assets = Object.keys(this.modelSvc.assets)
          .reduce((newAssets: any, assetKey: any) => {
            const asset = this.modelSvc.assets[assetKey];
            if (asset.tags && asset.tags[0] === SOCIAL_IMAGE_SQUARE || asset.tags[0] === SOCIAL_IMAGE_WIDE) {
              newAssets[assetKey] = asset;
            }
            return newAssets;
          }, {});
      } else {
        this.assets = this.modelSvc.assets;
      }

      this.isCustAdmin = this.authSvc.userHasRole('customer admin');
      this.isAdmin = this.authSvc.userHasRole('admin');
      this.canAccess = this.isCustAdmin || this.isAdmin;

      if (this.MIMES[this.mimeKey]) {
        this.mimes = this.MIMES[this.mimeKey];
        if (this.isAdmin) {
          this.mimes += ',video/*';
        }
      } else {
        this.mimes = this.MIMES.default;
      }
    });
  }

  up() {
    this.showParent = true;
  }

  toggleImages() {
    this.onlyImages = !this.onlyImages;
  }

  toggleGrid() {
    this.gridView = !this.gridView;
  }

  assetClick(assetId) {
    console.log('User clicked on asset ', assetId);
    //when it comes time to emit data from a component
    //"isolate scope &" is a better fit than pubsub with $rootScope
    if (this.context && this.context === 'narrative') {
      this.onAssetSelect({$assetId: assetId});
      return;
    }
    this.$rootScope.$emit('UserSelectedAsset', assetId);
  }

  requestDeleteAsset($asset: IAsset, $ev: ng.IAngularEvent) {
    // to avoid triggering the click handler on the <tr> element.
    $ev.stopPropagation();
    this.assetToDelete = $asset;
  }

  deleteAsset(id: string): void {
    this.dataSvc.deleteAsset(id)
      .then(() => {
        //delete local copies on scope and modelSvc
        this.assets = omit(this.assets, id);
        this.modelSvc.assets = omit(this.modelSvc.assets, id);
      })
      .catch(e => console.log(e))
      .finally(() => this.assetToDelete = null);
  }
}

export class SxsContainerAssets implements ng.IComponentOptions {
  bindings: any = {
    containerId: '@',
    mimeKey: '@?',
    context: '@?',
    onAssetSelect: '&?'
  };
  templateUrl: string = 'templates/producer/container-assets.html';
  controller: ng.IComponentController = SxsContainerAssetsController;
  static Name: string = 'sxsContainerAssets'; // tslint:disable-line
}
