/* WARN I badly misnamed this; it's used in  producer.  TODO eliminate the sxs prefix, it never made sense anyway */

sxsContainerAssets.$inject = ['$rootScope', 'recursionHelper', 'dataSvc', 'modelSvc', 'awsSvc', 'appState', 'MIMES', 'authSvc'];

export default function sxsContainerAssets($rootScope, recursionHelper, dataSvc, modelSvc, awsSvc, appState, MIMES, authSvc) {
  return {
    restrict: 'A',
    replace: false,
    scope: {
      containerId: "=sxsContainerAssets",
      mimeKey: '@'
    },
    templateUrl: 'templates/producer/container-assets.html',
    compile: function (element) {
      // Use the compile function from the recursionHelper,
      // And return the linking function(s) which it returns
      return recursionHelper.compile(element, function (scope) {
        scope.appState = appState;

        if (modelSvc.containers[scope.containerId]) {
          // console.log("Container already loaded");
          scope.container = modelSvc.containers[scope.containerId];
          if (!scope.container.assetsHaveLoaded) {
            // console.log("Assets had not loaded, getting them");
            dataSvc.getContainerAssets(scope.containerId);
          }
        } else {
          // console.log("Getting container");
          dataSvc.getContainer(scope.containerId).then(function () {
            // console.log("Getting assets");
            scope.container = modelSvc.containers[scope.containerId];
            dataSvc.getContainerAssets(scope.containerId);
          });
        }

        scope.isCustAdmin = authSvc.userHasRole('customer admin');
        scope.isAdmin = authSvc.userHasRole('admin');
        scope.canAccess = scope.isCustAdmin || scope.isAdmin;

        if (MIMES[scope.mimeKey]) {
          scope.mimes = MIMES[scope.mimeKey];
          if (scope.isAdmin) {
            scope.mimes += ',video/*';
          }
        } else {
          scope.mimes = MIMES.default;
        }

        scope.assets = modelSvc.assets; // this is going to be a horrible performance hit isn't it.  TODO: build asset array inside each container in modelSvc instead?
        scope.uploadStatus = [];
        scope.up = function () {
          scope.showParent = true;
        };

        scope.toggleImages = function () {
          scope.onlyImages = !scope.onlyImages;
        };
        scope.toggleGrid = function () {
          scope.gridView = !scope.gridView;
        };

        scope.assetClick = function (assetId) {
          console.log("User clicked on asset ", assetId);
          $rootScope.$emit("UserSelectedAsset", assetId);
        };

        scope.uploadAsset = function (fileInput) {
          var files = fileInput.files;
          //Start the upload status out at 0 so that the
          //progress bar renders correctly at first
          scope.uploadStatus[0] = {
            "bytesSent": 0,
            "bytesTotal": 1
          };
          scope.uploads = awsSvc.uploadContainerFiles(scope.containerId, files);
          scope.uploads[0].then(function (data) {
            modelSvc.cache("asset", data.file);
            fileInput.value = '';
            delete scope.uploads;
          }, function (data) {
            console.log("FAIL", data);
          }, function (update) {
            scope.uploadStatus[0] = update;
          });
        };
      });
    }
  };
}
