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
				'		<p ng-if="$ctrl.mixedContent.inform" class="error-red">Only HTTPS links can be embedded</p>',
				'		<p ng-if="$ctrl.emptyUrl.inform" class="error-red">Url cannot be blank</p>',
				'		<p ng-if="$ctrl.url.inform && $ctrl.url.payload" class="error-red">{{$ctrl.url.payload}} is not a valid URL</p>',
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
						case 'emptyUrl':
						case 'url':
							if (!notice.isValid) {
								ctrl.data.noEmbed = false;
							}
							break;
						case 'xFrameOpts':
						case 'mixedContent':
							if (!notice.isValid) {
								ctrl.data.noEmbed = true;
								ctrl.data.showInlineDetail = false;
								//grey out disabled options
								ctrl.data.templateOpts = ctrl.data.templateOpts.map(function(opt) {
									if (opt.name === 'Embedded Link' || opt.name === 'Link Modal') {
										opt.isDisabled = true;
									}
									return opt;
								});
							}
							break;
					}
					//emptyUrl and url notices seem to fire after the check for mixedContent.
					//This results in undoing the disabling of templateOpts.
					if (ctrl.mixedContent.inform) {
						ctrl.data.templateOpts = ctrl.data.templateOpts.map(function(opt) {
							if (opt.name === 'Embedded Link' || opt.name === 'Link Modal') {
								opt.isDisabled = true;
							}
							return opt;
						});
					} else {
						if (notice.type !== 'xFrameOpts') {
							ctrl.data.templateOpts = ctrl.data.templateOpts.map(function(opt) {
								opt.isDisabled = false;
								return opt;
							});
						}

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
