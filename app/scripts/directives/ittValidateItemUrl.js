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
		.directive('ittValidItemUrl', ittValidItemUrl);

	function ittValidItemUrl($q, youtubeSvc, ittUtils, dataSvc) {
		return {
			require: '?ngModel',
			scope: {
				onValidationNotice: '&'
			},
			link: function link(scope, elm, attrs, ngModel) {
				if (ngModel) {
					validateUrl();
				}

				function _emailOrPlaceholder(val) {
					return /mailto:/.test(val) || val === 'https://';
				}

				function validateUrl() {
					//always consider mixedContent url 'valid' but notify user
					ngModel.$validators.mixedContent = function (modelVal, viewVal) {
						if (ittUtils.existy(viewVal) && viewVal.match(/^http:\/\//)) {
							scope.onValidationNotice({$notice: {type: 'mixedContent', isValid: false}});
						} else {
							scope.onValidationNotice({$notice: {type: 'mixedContent', isValid: true}});
						}
						return true;
					};

					ngModel.$validators.emptyUrl = function (modelVal, viewVal) {
						if (ngModel.$isEmpty(viewVal) && !_emailOrPlaceholder(viewVal)) {
							scope.onValidationNotice({$notice: {type: 'emptyUrl', isValid: false}});
							return false;
						} else {
							scope.onValidationNotice({$notice: {type: 'emptyUrl', isValid: true}});
							return true;
						}
					};

					ngModel.$validators.url = function (modelVal, viewVal) {
						if (ittUtils.isValidURL(viewVal) || _emailOrPlaceholder(viewVal)) {
							scope.onValidationNotice({$notice: {type: 'url', isValid: true}});
							return true;
						} else {
							var message = viewVal + ' is not a valid URL.';
							scope.onValidationNotice({$notice: {type: 'url', isValid: false, payload: message}});
							return false;
						}
					};

					ngModel.$asyncValidators.xFrameOpts = function (modelVal, viewVal) {
						//bail out if empty or link to youtube
						if (ngModel.$isEmpty(viewVal) || youtubeSvc.isYoutubeUrl(viewVal) || _emailOrPlaceholder(viewVal)) {
							return $q(function (resolve) {
								scope.onValidationNotice({$notice: {type: 'xFrameOpts', isValid: true}});
								return resolve();
							});
						}

						return dataSvc.checkXFrameOpts(viewVal)
							.then(function (noEmbed) {
								if (noEmbed) {
									var tipText = 'Link embed is disabled because ' + viewVal + ' does not allow iframing';
									scope.onValidationNotice({
										$notice: {
											type: 'xFrameOpts',
											isValid: false,
											payload: tipText
										}
									});
								}
							});
					};
				}
			}
		};
	}


})();
