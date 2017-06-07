/* WARN I badly misnamed this; it's used in  producer.  TODO eliminate the sxs prefix, it never made sense anyway */

import {IDataSvc, IModelSvc} from '../interfaces';
// sxsContainerAssets.$inject = ['$rootScope', 'recursionHelper', 'dataSvc', 'modelSvc', 'awsSvc', 'appState', 'MIMES', 'authSvc'];
// export default function sxsContainerAssets($rootScope, recursionHelper, dataSvc, modelSvc, awsSvc, appState, MIMES, authSvc) {
//   return {
//     restrict: 'A',
//     replace: false,
//     scope: {
//       containerId: "=sxsContainerAssets",
//       mimeKey: '@'
//     },
//     templateUrl: 'templates/producer/container-assets.html',
//     compile: function (element) {
//       // Use the compile function from the recursionHelper,
//       // And return the linking function(s) which it returns
//       return recursionHelper.compile(element, function (scope) {
//         scope.appState = appState;
//
//         if (modelSvc.containers[scope.containerId]) {
//           // console.log("Container already loaded");
//           scope.container = modelSvc.containers[scope.containerId];
//           if (!scope.container.assetsHaveLoaded) {
//             // console.log("Assets had not loaded, getting them");
//             dataSvc.getContainerAssets(scope.containerId);
//           }
//         } else {
//           // console.log("Getting container");
//           dataSvc.getContainer(scope.containerId).then(function () {
//             // console.log("Getting assets");
//             scope.container = modelSvc.containers[scope.containerId];
//             dataSvc.getContainerAssets(scope.containerId);
//           });
//         }
//
//         scope.isCustAdmin = authSvc.userHasRole('customer admin');
//         scope.isAdmin = authSvc.userHasRole('admin');
//         scope.canAccess = scope.isCustAdmin || scope.isAdmin;
//
//         if (MIMES[scope.mimeKey]) {
//           scope.mimes = MIMES[scope.mimeKey];
//           if (scope.isAdmin) {
//             scope.mimes += ',video/*';
//           }
//         } else {
//           scope.mimes = MIMES.default;
//         }
//
//         scope.assets = modelSvc.assets; // this is going to be a horrible performance hit isn't it.  TODO: build asset array inside each container in modelSvc instead?
//         scope.uploadStatus = [];
//         scope.up = function () {
//           scope.showParent = true;
//         };
//
//         scope.toggleImages = function () {
//           scope.onlyImages = !scope.onlyImages;
//         };
//         scope.toggleGrid = function () {
//           scope.gridView = !scope.gridView;
//         };
//
//         scope.assetClick = function (assetId) {
//           console.log("User clicked on asset ", assetId);
//           $rootScope.$emit("UserSelectedAsset", assetId);
//         };
//
//         scope.uploadAsset = function (fileInput) {
//           var files = fileInput.files;
//           //Start the upload status out at 0 so that the
//           //progress bar renders correctly at first
//           scope.uploadStatus[0] = {
//             "bytesSent": 0,
//             "bytesTotal": 1
//           };
//           scope.uploads = awsSvc.uploadContainerFiles(scope.containerId, files);
//           scope.uploads[0].then(function (data) {
//             modelSvc.cache("asset", data.file);
//             fileInput.value = '';
//             delete scope.uploads;
//           }, function (data) {
//             console.log("FAIL", data);
//           }, function (update) {
//             scope.uploadStatus[0] = update;
//           });
//         };
//       });
//     }
//   };
// }

interface ISxsContainerAssetsBindings {
  containerId: string;
  mimeKey: string;
  context?: string;
  onAssetSelect: ($assetId: string) => string;
}

class SxsContainerAssetsController implements ng.IComponentController {
  containerId: string;
  mimeKey?: string;
  context?: string;
  onAssetSelect?: ($assetId) => string;
  //
  mimes: string;
  isAdmin: boolean;
  isCustAdmin: boolean;
  canAccess: boolean;
  showParent: boolean;
  container: any;
  assets: any;
  uploadStatus: any[] = [];
  uploads: any[] = [];
  onlyImages: boolean;
  gridView: boolean;
  static $inject = ['$rootScope', 'dataSvc', 'modelSvc', 'awsSvc', 'appState', 'MIMES', 'authSvc'];
  constructor(
    public $rootScope: ng.IRootScopeService,
    public dataSvc: IDataSvc,
    public modelSvc: IModelSvc,
    public awsSvc,
    public appState,
    public MIMES,
    public authSvc){ }

  $onInit() {
    if (this.modelSvc.containers[this.containerId]) {
      // console.log("Container already loaded");
      this.container = this.modelSvc.containers[this.containerId];
      if (!this.container.assetsHaveLoaded) {
        // console.log("Assets had not loaded, getting them");
        this.dataSvc.getContainerAssets(this.containerId);
      }
    } else {
      // console.log("Getting container");
      this.dataSvc.getContainer(this.containerId).then(() => {
        this.container = this.modelSvc.containers[this.containerId];
        console.log("Getting assets", this.container);
        this.dataSvc.getContainerAssets(this.containerId);
      });
    }

    this.isCustAdmin = this.authSvc.userHasRole('customer admin');
    this.isAdmin = this.authSvc.userHasRole('admin');
    this.canAccess = this.isCustAdmin || this.isAdmin;
    this.assets = this.modelSvc.assets;

    if (this.MIMES[this.mimeKey]) {
      this.mimes = this.MIMES[this.mimeKey];
      if (this.isAdmin) {
        this.mimes += ',video/*';
      }
    } else {
      this.mimes = this.MIMES.default;
    }
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
}


export class SxsContainerAssets implements ng.IComponentOptions {
  static Name: string = 'sxsContainerAssets';
  bindings: any = {
    containerId: '@',
    mimeKey: '@?',
    context: '@?',
    onAssetSelect: '&?'
  };
  templateUrl: string = 'templates/producer/container-assets.html';
  controller: ng.IComponentController = SxsContainerAssetsController;
}
