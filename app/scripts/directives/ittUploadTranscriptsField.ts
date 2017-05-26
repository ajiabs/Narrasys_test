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
      		<itt-asset-uploader episode-id="{{$ctrl.episodeId}}" mime-types="{{$ctrl.mimes}}" callback="$ctrl.handleTranscripts(data)"></itt-asset-uploader>
      	</div>
      </div>`,
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

          //failed attempts to add the transcripts without requiring a page reload.
          // transcriptsResp.data.forEach(function (transcript) {
          // 	modelSvc.cache('event', dataSvc.resolveIDs(transcript));
          // });
          //
          // modelSvc.resolveEpisodeEvents(ctrl.episodeId);
          //
          // // transcriptsResp.data.forEach(function(event) {
          // // 	timelineSvc.updateEventTimes(event);
          // // });
          //
          // timelineSvc.injectEvents(modelSvc.episodeEvents(ctrl.episodeId));
          // console.log('all done?');
          // $rootScope.$emit('searchReindexNeeded'); // HACK
        } else {

          errorSvc.error({data: 'No new transcripts were detected'});
        }
      }
    }],
    controllerAs: '$ctrl',
    bindToController: true
  };
}
