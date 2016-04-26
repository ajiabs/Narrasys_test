/**
 *
 * Created by githop on 4/21/16.
 */

(function () {
	'use strict';
	/**
	 * @ngdoc directive
	 * @name iTT.directive:ittValidateUrl
	 * @restrict 'EA'
	 * @scope
	 * @description
	 * Directive used on url inputs to allow custom validation
	 * @requires $q
	 * @requires ngModel
	 * @requires errorSvc
	 * @requires youtubeSvc
	 * @requires ittUtils
	 * @requires dataSvc
	 * @param {Object} item The item that the url we are validating belongs to
	 * @example
	 * <pre>
	 *     <input type="url" itt-validate-url item="item"/>
	 * </pre>
	 */
	angular.module('com.inthetelling.story')
		.directive('ittValidateUrl', ittValidateUrl);

	function ittValidateUrl($q, errorSvc, youtubeSvc, ittUtils, dataSvc) {
		return {
			require: '?ngModel',
			scope: {
				item: '='
			},
			link: function link(scope, elm, attrs, ngModel) {

				if (ngModel) {
					console.log('tigger validation', ngModel);
					validateUrl();
				}

				function validateUrl() {
					//always consider mixedContent url 'valid' but notify user
					ngModel.$validators.mixedContent = function (modelVal, viewVal) {
						if (viewVal.match(/^http:\/\//)) {
							errorSvc.notify('Link Embed is disabled because ' + viewVal + ' is not HTTPS');
							console.log("resolving mixed content!", viewVal);
						}
						return true;
					};

					ngModel.$validators.url = function (modelVal, viewVal) {
						if (ngModel.$isEmpty(viewVal) || ittUtils.isValidURL(viewVal)) {
							scope.item.noEmbed = false;
							scope.item.tipText = undefined;
							return true;
						} else {
							if (viewVal !== 'https://') {
								errorSvc.notify(viewVal + ' is not a valid URL.');
							}
							return false;
						}
					};

					ngModel.$asyncValidators.xFrameOpts = function (modelVal, viewVal) {
						//bail out if empty or link to youtube
						if (ngModel.$isEmpty(viewVal) || youtubeSvc.isYoutubeUrl(viewVal)) {
							return $q(function (resolve) { resolve(); });
						}

						return dataSvc.checkXFrameOpts(viewVal)
							.then(function (noEmbed) {
								var xFrameOptsNote = ' does not allow embedding, so this link will open in a new tab';
								scope.item.noEmbed = noEmbed;
								if (noEmbed) {
									scope.item.tipText = 'Link embed is disabled because ' + viewVal + ' does not allow iframing';
									scope.item.showInlineDetail = false;
									errorSvc.notify(viewVal + xFrameOptsNote);
								}
							});
					};
				}
			}
		};
	}


})();