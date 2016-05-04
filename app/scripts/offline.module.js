/**
 * Created by githop on 5/4/16.
 */

(function () {
	'use strict';

	angular.module('iTT.offline', ['ngMockE2E'])
		.run(function ($httpBackend, demoMock, $location) {

			var _origin = '//' + $location.host();

			console.log($location.port());

			if ($location.port() !== 443) {
				 _origin += ':' + $location.port();
			}

			console.log('origin', _origin);

			//$httpBackend.whenGET('//show_user').respond(function () {
			//	console.log("we matched //show_user");
			//	return demoMock.showUser;
			//});
			//$httpBackend.whenGET('/show_user').respond(function () {
			//	console.log("we matched /show_user");
			//	return demoMock.showUser;
			//});
            //
			//$httpBackend.whenGET('//localhost:3001/v1/get_nonce').respond(function() {
			//	console.log('mocking nonce');
			//	return demoMock.nonce;
			//});
			//$httpBackend.whenGET('/v1/get_nonce').passThrough();


			$httpBackend.whenGET(_origin + '/v1/get_nonce').respond(function() {
				console.log('get nonce');
				return demoMock.nonce;
			});

			$httpBackend.whenGET(_origin + '/v1/get_access_token/' + demoMock.nonce.nonce).respond(function() {
				console.log("we're golden");
				return demoMock.accessToken;
			});
		});
})();
