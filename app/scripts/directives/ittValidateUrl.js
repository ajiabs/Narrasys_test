/**
 *
 * Created by githop on 4/21/16.
 */

(function() {
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
				function allowSchemelessUrls() {
					ngModel.$asyncValidators.url = function(modelVal) {
						return $q(function(resolve, reject) {
							//check for mixed content
							if (modelVal.match(/^http:\/\//)) {
								errorSvc.notify('Link Embed is disabled because ' + modelVal +' is not HTTPS');
								ngModel.$setDirty();
								resolve();
							}
							//check valid URLS (not youtube videos) for x-frame-options
							if (!youtubeSvc.isYoutubeUrl(modelVal) && ittUtils.isValidURL(modelVal)) {
								var itemUrl = modelVal;
								dataSvc.checkXFrameOpts(itemUrl)
									.then(function(noEmbed) {
										var xFrameOptsNote = ' does not allow embedding, so this link will open in a new tab';
										scope.item.noEmbed = noEmbed;
										if (noEmbed) {
											scope.item.tipText = 'Link embed is disabled because ' + itemUrl + ' does not allow iframing';
											scope.item.showInlineDetail = false;
											errorSvc.notify(itemUrl + xFrameOptsNote);
										}
										ngModel.$setDirty();
										resolve(modelVal);
									});
							} else {
								//validate links to youtube videos
								if (ngModel.$isEmpty(modelVal) || ittUtils.isValidURL(modelVal)) {
									scope.item.noEmbed = false;
									scope.item.tipText = undefined;
									ngModel.$setDirty();
									resolve(modelVal);
								} else {
									ngModel.$setDirty();
									reject(modelVal);
								}
							}
						});
					};
				}

				if (ngModel && !ngModel.$pristine &&attrs.type === 'url') {
					allowSchemelessUrls();
				}
			}
		};
	}


})();
