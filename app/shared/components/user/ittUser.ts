// @npUpgrade-shared-false
const noAvatarImg = require('../../../images/no-avatar.gif');

import userHtml from './user.html';

ittUser.$inject = ['$q', 'appState', 'authSvc', 'dataSvc', 'awsSvc', 'modelSvc', 'imageResize'];

export default function ittUser($q, appState, authSvc, dataSvc, awsSvc, modelSvc, imageResize) {
  return {
    restrict: 'A',
    replace: true,
    scope: {},
    template: userHtml,
    link: function (scope, element, attrs) {

      scope.inPlayer = attrs.inPlayer;
      scope.appState = appState;
      scope.loading = true;
      scope.logout = authSvc.logout;
      scope.authSvc = authSvc;
      scope.canAccess = scope.authSvc.userHasRole('admin') || scope.authSvc.userHasRole('customer admin');


   //   scope.canAccess =  authSvc.userHasRole('admin') || authSvc.userHasRole('customer admin');

      authSvc.authenticate().then(function () {
        scope.loading = false;
        scope.user = appState.user;
        scope.userHasRole = authSvc.userHasRole;

        //TS-1120 - remove purchases
        // if (!scope.inPlayer && !authSvc.isGuest()) {
        // 	scope.getMyNarratives();
        // }
      });

      scope.isEditing = false;
      scope.toggleEditing = toggleEditing;
      function toggleEditing() {
        scope.isEditing = !scope.isEditing;
      }

      // TODO refactor: this is very similar to ittItemEditor's uploadAsset
      scope.uploadStatus = [];
      scope.toggleUploadAvatar = function () {
        scope.showUploadField = !scope.showUploadField;
      };

      scope.uploadAvatar = function (files) {
        //Start the upload status out at 0 so that the
        //progress bar renders correctly at first
        scope.uploadStatus[0] = {
          "bytesSent": 0,
          "bytesTotal": 1
        };

        //promise chain
        imageResize.readFileToImg(files[0])
          .then(_resizeWithService)
          .then(_avatarFileFromImg)
          .then(_postToAWS)
          .catch(function (e) {
            console.log('something failed resizing / uploading the image', e);
          });

        //handler functions; i.e., 'links' in the 'promise chain' ;)
        function _resizeWithService(img) {
          return imageResize.resizeImg(img, 60, 60, true)
            .then(function (dataUrl) {
              return dataUrl;
            });
        }

        //takes a base64 encoded URL with PNG image
        //and turns it back into a File Object
        function _avatarFileFromImg(dataUrl) {
          return $q(function (resolve) {
            var file = imageResize.createFileFromDataURL(dataUrl, files[0].name);
            resolve(file);
          });
        }

        //pass file to AWS service for file upload
        function _postToAWS(file) {
          awsSvc.uploadUserFiles(appState.user._id, [file])[0]
            .then(function (data) {
              scope.showUploadField = false;
              modelSvc.cache("asset", data.file);
              if (appState.user.avatar_id) {
                // TODO delete the user's previous avatar asset now that we have a new one
                // (but first confirm that events the user has already created aren't storing the old avatar_id directly.... which would be a bug)
              }
              appState.user.avatar_id = data.file._id;
              scope.updateUser();
              delete scope.uploads;
            });
        }
      };

      scope.updateUser = function () {
        authSvc.updateUser(appState.user).then(function () {
          scope.user = appState.user;
        });
      };
      scope.getMyNarratives = function () {
        dataSvc.getUserNarratives(scope.user._id).then(function (data) {
          // console.log("purchase", data);

          scope.myPurchases = data;

          angular.forEach(scope.myPurchases, function (purchase) {
            purchase.daysUntilExpiration = Math.floor((new Date(purchase.expiration_date) - new Date()) / 86400000);

            // get the narrative data for each purchase (this copes with multiple purchases of the same narrative)
            dataSvc.getNarrativeOverview(purchase.narrative_id).then(function (nData) {
              angular.forEach(scope.myPurchases, function (pur) {
                if (pur.narrative_id === nData._id) {
                  pur.narrativeData = nData;
                }
              });
            });
          });

        });
      };

    }
  };
}
