/**
 * Created by githop on 1/31/17.
 */

(function() {
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
			controller: ['$rootScope', 'MIMES', 'modelSvc', 'timelineSvc', 'ittUtils', function($rootScope, MIMES, modelSvc, timelineSvc, ittUtils) {
	        	var ctrl = this;
	        	ctrl.mimes = MIMES.transcripts;
	        	ctrl.handleTranscripts = handleTranscripts;
	        	var _existy = ittUtils.existy;

	        	function handleTranscripts(transcriptsResp) {
	        		console.log('data!', transcriptsResp);
					console.log('epi id', ctrl.episodeId);
	        		if (_existy(transcriptsResp) && _existy(transcriptsResp.data) && transcriptsResp.data.length > 0) {

						transcriptsResp.data.forEach(function(transcript) {
							modelSvc.cache('event', transcript);
						});

						modelSvc.resolveEpisodeEvents(ctrl.episodeId);

						transcriptsResp.data.forEach(function(event) {
							timelineSvc.updateEventTimes(event);
						});

						// timelineSvc.injectEvents(transcriptsResp.data);
						console.log('all done?');
						$rootScope.$emit('searchReindexNeeded'); // HACK
					}
				}
			}],
			controllerAs: '$ctrl',
			bindToController: true
	    };
	}

})();
