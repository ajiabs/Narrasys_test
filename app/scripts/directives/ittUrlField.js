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
				'		<input type="text" name="itemUrl" ng-model="$ctrl.data.url" ng-model-options="{ updateOn: \'blur\' }"  itt-valid-item-url on-validation-notice="$ctrl.handleValidationMessage($notice)"/>',
				'	</div>',
				'</div>'
			].join(' '),
			controller: [function() {
				var ctrl = this;
				ctrl.handleValidationMessage = handleValidationMessage;
				ctrl.emptyUrl = ctrl.url = ctrl.xFrameOpts = ctrl.mixedContent = {};

				function _handleItemSideEffects(notice) {
					switch(notice.type) {
						case 'xFrameOpts':
							if (!notice.isValid) {
								ctrl.data.tipText = notice.payload;
								ctrl.data.noEmbed = true;
								ctrl.data.showInlineDetail = false;
								//grey out disabled options
								angular.forEach(ctrl.data.templateOpts, function(opt) {
									opt.isDisabled = (opt.name === 'Embedded Link');
								});
							}
							break;
						case 'emptyUrl':
						case 'url':
							if (notice.isValid) {
								ctrl.data.noEmbed = false;
								ctrl.data.tipText = undefined;
							}
							break;
						case 'mixedContent':
							break;
					}
					//restore greyed out options
					if (notice.type !== 'xFrameOpts') {
						angular.forEach(ctrl.data.templateOpts, function(opt) {
							opt.isDisabled = false;
						});
					}
				}

				function handleValidationMessage(notice) {
					//inform user when field is not valid
					ctrl[notice.type] = {inform: !notice.isValid };

					//show payload data if present
					if (notice.payload != null) { //jshint ignore:line
						ctrl[notice.type].payload = notice.payload;
					}

					//If user fails for xFrameOpts, then fails another unrelated validation,
					//remove the original xFrameOpts notice...
					//example: user inputs google.com, is notified for xFrameOpts, then changes URL
					//to empty string -> xFrameOpts notice (from google) should no longer be visible.
					if (ctrl.xFrameOpts.payload !== null && notice.type !== 'xFrameOpts') {
						ctrl.xFrameOpts.payload = null;
					}
					_handleItemSideEffects(notice);
				}
			}],
			controllerAs: '$ctrl',
			bindToController: true
		};
	}


})();
