/**
 * Created by githop on 12/13/15.
 */
'use strict';

import angular from 'angular';

let configsModule = angular.module('iTT.configs', [])
	//// Configure x-domain resource whitelist (TODO: do we actually need this?)
	.config(function($sceDelegateProvider, $httpProvider) {
		'ngInject';
		$sceDelegateProvider.resourceUrlWhitelist([
			'self',
			/.*/,
			/^http(s)?:\/\/platformuniv-p.edgesuite.net/,
			/^http(s)?:\/\/themes.googleusercontent.com/
		]);

		$httpProvider.defaults.useXDomain = true;
		$httpProvider.defaults.withCredentials = true;
		delete $httpProvider.defaults.headers.common['X-Requested-With'];
		$httpProvider.interceptors.push(function ($q, errorSvc) {
			return {
				'responseError': function (rejection) {
					errorSvc.error(rejection);
					return $q.reject(rejection);
				}
			};
		});

		//$provide.decorator('taOptions', ['taRegisterTool', '$delegate', function (taRegisterTool, taOptions) { // $delegate is the taOptions we are decorating
		//	taOptions.toolbar = [
		//		['h1', 'h2', 'h3'],
		//		['bold', 'italics', 'underline', 'strikeThrough'],
		//		['ul', 'ol'],
		//		['undo', 'redo', 'clear']
		//		// ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
		//		// ['justifyLeft','justifyCenter','justifyRight','indent','outdent'],
		//		// ['html', 'insertImage', 'insertLink', 'insertVideo', 'wordcount', 'charcount']
		//	];
		//	return taOptions;
		//}]);

	});

export default configsModule;
