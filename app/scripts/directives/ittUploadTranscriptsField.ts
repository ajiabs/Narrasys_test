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
        		<div itt-asset-uploader episode-id="{{$ctrl.episodeId}}" mime-types="{{$ctrl.mimes}}" callback="$ctrl.showOptions = true">
             <div ng-if="$ctrl.showOptions" class="asset__field-group">
               <div>
                 <label>group into sentences <input type="radio" ng-model="$ctrl.selectedParam" value="group_into_sentences"/></label>
                 <label>smart sentences <input type="radio" ng-model="$ctrl.selectedParam" value="smart_sentences"/></label>
                 <label>none <input type="radio" ng-model="$ctrl.selectedParam" value="none"/></label></br>
               </div>
               <div><label>max subtitle duration <input type="number" ng-model="$ctrl.maxDuration"/></label></div>
               <div><button ng-click="$ctrl.commenseUpload()">upload transcripts</button></div>
             </div>
           </div>
        	</div>
        </div>`,
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
          selectedParam: 'none',
          maxDuration: null,
          commenseUpload: commenseUpload
        });

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
