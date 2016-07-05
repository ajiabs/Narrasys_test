/**
 * Created by githop on 12/13/15.
 */
import 'angular';

let configsModule = angular.module('iTT.configs', [])
//// Configure x-domain resource whitelist (TODO: do we actually need this?)
	.config(['$sceDelegateProvider', '$httpProvider', '$compileProvider',($sceDelegateProvider, $httpProvider, $compileProvider) => {
		$sceDelegateProvider.resourceUrlWhitelist([
			'self',
			/.*/,
			/^http(s)?:\/\/platformuniv-p.edgesuite.net/,
			/^http(s)?:\/\/themes.googleusercontent.com/
		]);

		$httpProvider.defaults.useXDomain = true;
		$httpProvider.defaults.withCredentials = true;
		delete $httpProvider.defaults.headers.common['X-Requested-With'];
		$httpProvider.interceptors.push(['$q', 'errorSvc',function ($q, errorSvc) {
			return {
				'responseError': function (rejection) {
					errorSvc.error(rejection);
					return $q.reject(rejection);
				}
			};
		}]);

		var isDev = false;
		var currentHost = window.location.hostname;
		if (currentHost.indexOf('localhost') === 0 || currentHost.indexOf('api-dev') === 0) {
			isDev = true;
		}
		if (isDev === false) {
			$compileProvider.debugInfoEnabled(false);
		}
	}]);

export default configsModule;
