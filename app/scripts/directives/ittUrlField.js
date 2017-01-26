/**
 * Created by githop on 6/30/16.
 */

(function () {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittUrlField', ittUrlField);

	function ittUrlField() {
		return {
			restrict: 'EA',
			scope: {
				data: '=',
				videoOnly: '=',
				label: '@',
				onAttach: '&'
			},
			template: [
				'<div class="field">',
				'	<div class="label">{{$ctrl.label || "URL"}}',
				'	<span ng-repeat="(field, val) in $ctrl.validatedFields">',
				'		<itt-validation-tip ng-if="val.showInfo" text="{{val.message}}" do-info="val.doInfo"></itt-validation-tip>',
				'	</span>',
				'	</div>',
				'	<div class="input" ng-if="!$ctrl.videoOnly">',
				'		<input type="text" name="itemUrl" ng-model="$ctrl.data.url" ng-focus="$ctrl.onFocus()" ng-model-options="{ updateOn: \'blur\' }"  itt-valid-item-url on-validation-notice="$ctrl.handleValidationMessage($notice)"/>',
				'	</div>',
				'	<div class="input" ng-if="$ctrl.videoOnly === true">',
				'		<input type="text" ng-model="$ctrl.data" ng-change="$ctrl.handleMasterAssetUrl($ctrl.data)"/>',
				'		<button ng-if="$ctrl.data" ng-click="$ctrl.onAttach({$url: $ctrl.data})">Attach Video</button>',
				'	</div>',
				'</div>'
			].join(' '),
			controller: ['$scope', 'urlService', 'ittUtils', function ($scope, urlService, ittUtils) {
				var ctrl = this;
				ctrl.handleValidationMessage = handleValidationMessage;
				ctrl.onFocus = onFocus;
				ctrl.handleMasterAssetUrl = handleMasterAssetUrl;
				var _existy = ittUtils.existy;

				onInit();

				function onInit() {
					if (ctrl.videoOnly === true) {
						handleMasterAssetUrl(ctrl.data);
					}
				}

				function handleMasterAssetUrl(url) {
					var type;
					var message;
					if (_existy(url) && url.length) {
						type = urlService.checkUrl(url).type;
						if (type.length > 0) {
							message = {
								showInfo: true,
								message: type,
								doInfo: true
							};
							ctrl.validatedFields = {
								type: message
							};
						}
					}
				}

				function onFocus() {
					$scope.$broadcast('url:focus');
				}

				function handleValidationMessage(notice) {
					ctrl.validatedFields = {
						url: null,
						xFrameOpts: null,
						'404': null,
						'301': null,
						mixedContent: null
					};

					angular.extend(ctrl.validatedFields, notice);

					var xFrameOptsdisableEmbedTemplates   = ctrl.validatedFields.xFrameOpts.showInfo === true && ctrl.validatedFields.mixedContent.showInfo === false;
					var mixedContentDisableEmbedTemplates = ctrl.validatedFields.xFrameOpts.showInfo === false && ctrl.validatedFields.mixedContent.showInfo === true;

					if (xFrameOptsdisableEmbedTemplates || mixedContentDisableEmbedTemplates) {
						ctrl.data.noEmbed = true;
						ctrl.data.showInlineDetail = false;
						//grey out disabled options
						ctrl.data.templateOpts = ctrl.data.templateOpts.map(function (opt) {
							if (opt.name === 'Embedded link' || opt.name === 'Link modal') {
								opt.isDisabled = true;
							}
							return opt;
						});
					} else {
						ctrl.data.noEmbed = false;
						ctrl.data.templateOpts = ctrl.data.templateOpts.map(function (opt) {
							if (opt.name === 'Embedded link' || opt.name === 'Link modal') {
								opt.isDisabled = false;
							}
							return opt;
						});
					}

					if (ctrl.validatedFields.url.showInfo === true) {
						ctrl.data.noEmbed = false;
					}

					if (ctrl.validatedFields['301'].showInfo === true) {
						ctrl.data.url = ctrl.validatedFields['301'].url;
					}
				}
			}],
			controllerAs: '$ctrl',
			bindToController: true
		};
	}


})();
