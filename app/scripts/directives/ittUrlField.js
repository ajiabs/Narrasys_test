/**
 * Created by githop on 6/30/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittUrlField', ittUrlField);

	function ittUrlField() {
		return {
			restrict: 'EA',
			scope: {
				data: '=',
			},
			template: [
				'<div class="field">',
				'	<div class="label">URL</div>',
				'	<div class="input">',
				'		<p ng-if="$ctrl.mixedContent.inform" class="error-red">Mixed Content</p>',
				'		<p ng-if="$ctrl.emptyUrl.inform" class="error-red">Empty Url</p>',
				'		<p ng-if="$ctrl.url.inform" class="error-red">{{$ctrl.url.payload}}</p>',
				'		<p ng-if="$ctrl.xFrameOpts.inform" class="error-red">{{$ctrl.xFrameOpts.payload}}</p>',
				'		<input type="text" name="itemUrl" ng-model="$ctrl.data.url" ng-model-options="{ updateOn: \'blur\' }" itt-valid-item-url on-validation-notice="$ctrl.handleValidationMessage($notice)"/>',
				'	</div>',
				'</div>'
			].join(' '),
			controller: [function() {
				var ctrl = this;
				ctrl.handleValidationMessage = handleValidationMessage;
				ctrl.emptyUrl = ctrl.url = ctrl.xFrameOpts = ctrl.mixedContent = false;

				function handleValidationMessage(notice) {
					//inform user when field is not valid
					ctrl[notice.type] = {inform: !notice.isValid };

					//show payload data if present
					if (notice.payload != null) {
						ctrl[notice.type].payload = notice.payload;
					}

				}
			}],
			controllerAs: '$ctrl',
			bindToController: true
		};
	}


})();
