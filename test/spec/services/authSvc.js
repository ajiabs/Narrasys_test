'use strict';
describe('authSvc', function () {
	var $httpBackend, authSvc, backendStub, appState;
	beforeEach(angular.mock.module('com.inthetelling.story'));

	beforeEach(function () {
		angular.mock.inject(function ($injector) {
			$httpBackend = $injector.get('$httpBackend');
			authSvc = $injector.get('authSvc');
			backendStub = $injector.get('BackendStub');
			appState = $injector.get('appState');
			backendStub.StubIt($httpBackend);
		});
	});

	describe('getCurrentUser', function () {
		it('should call get current user', inject(function () {
			var userId = "5494786021e37f20f0000004";
			console.log("TESTING CURRENT USER");
			var promise = authSvc.getCurrentUser();
			promise.then(function (result) {
				console.log(result);
				console.log("RESULTS", result);
				expect(result._id)
					.toEqual(userId);
				expect(appState.user._id)
					.toEqual(userId);
			});
			$httpBackend.flush();
		}));
	});
});
