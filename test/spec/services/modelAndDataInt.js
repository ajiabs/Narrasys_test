'use strict';
describe('modelAndDataInt', function () {
	var $httpBackend, authSvc, backendStub, appState, modelSvc, dataSvc;
	beforeEach(angular.mock.module('com.inthetelling.story'));

	beforeEach(function () {
		angular.mock.inject(function ($injector) {
			$httpBackend = $injector.get('$httpBackend');
			authSvc = $injector.get('authSvc');
			backendStub = $injector.get('BackendStub');
			appState = $injector.get('appState');
			modelSvc = $injector.get('modelSvc');
			dataSvc = $injector.get('dataSvc');
			backendStub.StubIt($httpBackend);
		})
	});

	describe('getEpisode', function () {
		it('should set the episode data in model svc', inject(function () {
			var episodeId = "51da82dcbd526e960d000001";
			dataSvc.getEpisode(episodeId);
			expect(modelSvc.episodes[episodeId]._id)
				.toEqual(episodeId);
			$httpBackend.flush();
		}));
	});
});
