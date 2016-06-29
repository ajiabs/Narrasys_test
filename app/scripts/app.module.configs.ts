/**
 * Created by githop on 12/13/15.
 */
import 'angular';

let configsModule = angular.module('iTT.configs', [
	'textAngular'
])
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
	});

export default configsModule;
