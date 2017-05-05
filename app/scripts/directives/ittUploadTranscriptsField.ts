/**
 * Created by githop on 1/31/17.
 */

export default function ittUploadTranscripts() {
  return {
    restrict: 'EA',
    template: `
<div class="field">
  <div class="label">Batch Upload Transcripts
  </div>
  <div class="input">
    <div ng-if="!$ctrl.showUploader">
      <span><button ng-click="$ctrl.showUploader = true">Batch Upload Transcripts</button></span>
    </div>
    <div ng-if="$ctrl.showUploader"
         itt-asset-uploader
         episode-id="{{$ctrl.episodeId}}"
         mime-types="{{$ctrl.mimes}}"
         callback="$ctrl.showOptions = true">

      <itt-modal modal-class="narrative__modal" ng-if="$ctrl.showOptions">
        <div class="smart-sentences__wrapper">
          <div>
            <label class="smart-sentences__input"
             for="groupParam">Would you like to group CC segments into complete sentences?</label>
            <input class="smart-sentences__input" id="groupParam" type="checkbox" ng-model="$ctrl.selectedParam"
                   ng-false-value="'none'"
                   ng-true-value="'group_into_sentences'"/>
          </div>
          <div>
            Thank you for using this new feature currently in Beta! Are you sure you want to proceed? Once saved,
            transcript entries must be individually edited or deleted.
          </div>
        </div>
        <div>
          <button ng-click="$ctrl.commenseUpload()">upload transcripts</button>
          <button ng-click="$ctrl.cancelUpload()">cancel</button>
         </div>
      </itt-modal>

    </div>
  </div>
</div>
    `,
    scope: {
      episodeId: '@'
    },
    controller: ['$scope', 'MIMES', 'modelSvc', 'dataSvc', 'timelineSvc', 'ittUtils',
      function ($scope, MIMES, modelSvc, dataSvc, timelineSvc, ittUtils) {
        var ctrl = this;
        var _existy = ittUtils.existy;
        var _maxDurParam = 'max_subtitle_duration';

        angular.extend(ctrl, {
          mimes: MIMES.transcripts,
          showOptions: false,
          showUploader: false,
          selectedParam: 'none',
          maxDuration: null,
          commenseUpload,
          cancelUpload
        });

        function cancelUpload() {
          ctrl.showUploader = false;
          ctrl.showOptions = false;
        }

        function commenseUpload() {
          var optionalParams = {};
          if (ctrl.selectedParam !== 'none') {
            optionalParams[ctrl.selectedParam] = true;
          }

          if (_existy(ctrl.maxDuration)) {
            optionalParams[_maxDurParam] = ctrl.maxDuration;
          }

          $scope.$broadcast('transcriptsReceived', optionalParams);
          $scope.$on('transcriptsUploaded', function () {
            ctrl.showOptions = null;
            window.location.reload();
          });
        }
      }],
    controllerAs: '$ctrl',
    bindToController: true
  };
}
