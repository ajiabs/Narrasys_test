/**
 *
 * Created by githop on 4/21/16.
 */

(function() {
	'use strict';

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

					ngModel.$asyncValidators.url = function(modelVal, viewVal) {

						if ( modelVal.match(/^http:\/\//)) {
							console.log('rejected!!');
							errorSvc.notify('Link Embed is disabled because ' + modelVal +' is not HTTPS');
							return $q(function(resolve) {resolve();});
						}

						if (!youtubeSvc.isYoutubeUrl(modelVal) && ittUtils.isValidURL(modelVal)) {
							var itemUrl = modelVal;
							return dataSvc.checkXFrameOpts(itemUrl)
							.then(function(noEmbed) {
								var xFrameOptsNote = ' does not allow embedding, so this link will open in a new tab';
								scope.item.noEmbed = noEmbed;
								if (noEmbed) {
									scope.item.tipText = 'Link embed is disabled because ' + itemUrl + ' does not allow iframing';
									scope.item.showInlineDetail = false;
									errorSvc.notify(itemUrl + xFrameOptsNote);
								}
								return modelVal;
							});
						} else {
							return $q(function(resolve, reject) {
								if (ngModel.$isEmpty(modelVal) || ittUtils.isValidURL(modelVal)) {
									console.log("we must be here!!", modelVal);
									scope.item.noEmbed = false;
									scope.item.tipText = undefined;
									resolve(modelVal);
								} else {
									console.log('hmm', modelVal);
									reject(modelVal);
								}
							});
						}
					};
				}

				if (ngModel && attrs.type === 'url') {
					allowSchemelessUrls();
				}
			}
		};
	}


})();
