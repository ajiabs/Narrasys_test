/**
 * Created by githop on 1/31/17.
 */

(function () {
  'use strict';

  angular.module('com.inthetelling.story')
    .directive('ittUploadTranscripts', ittUploadTranscripts);

  function ittUploadTranscripts() {
    return {
      restrict: 'EA',
      template: [
        '<div class="field">',
        '	<div class="label">Batch Upload Transcripts',
        '	</div>',
        '	<div class="input">',
        '		<div itt-asset-uploader episode-id="{{$ctrl.episodeId}}" mime-types="{{$ctrl.mimes}}" callback="$ctrl.handleTranscripts(data)"></div>',
        '	</div>',
        '</div>'
      ].join(''),
      scope: {
        episodeId: '@'
      },
      controller: ['$rootScope', 'MIMES', 'modelSvc', 'dataSvc', 'timelineSvc', 'ittUtils', 'errorSvc',
        function ($rootScope, MIMES, modelSvc, dataSvc, timelineSvc, ittUtils, errorSvc) {
          var ctrl = this;
          ctrl.mimes = MIMES.transcripts;
          ctrl.handleTranscripts = handleTranscripts;
          var _existy = ittUtils.existy;

          function handleTranscripts(transcriptsResp) {
            if (_existy(transcriptsResp) && _existy(transcriptsResp.data) && transcriptsResp.data.length > 0) {
              window.location.reload();
            } else {
              errorSvc.error({data: 'No new transcripts were detected'});
            }
          }
        }],
      controllerAs: '$ctrl',
      bindToController: true
    };
  }
})();
