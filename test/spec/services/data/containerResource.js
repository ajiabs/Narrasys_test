describe('containerResource', function () {
    var mockUserResource, $httpBackend;
    beforeEach(angular.mock.module('com.inthetelling.story'));

    beforeEach(function () {
        angular.mock.inject(function ($injector) {
            $httpBackend = $injector.get('$httpBackend');
            ContainerDataModel = $injector.get('ContainerDataModel');
            DataModelUtils = $injector.get('DataModelUtils');
            mockContainerResource = $injector.get('Container');
            config = $injector.get('config');
        })
    });

    describe('getContainer', function () {
        it('should call container get by id', inject(function (Container) {
            var containerId = "527d078fd72cc3699f000003";
            DataModelUtils.setData(ContainerDataModel.data);
            var container = DataModelUtils.findOne(containerId);
            console.log('expected container: ', container);
            $httpBackend.expectGET(config.apiDataBaseUrl + '/v3/containers/' + containerId)
                .respond(container);

            var result = mockContainerResource.get({
                containerId: containerId
            });
            $httpBackend.flush();
            console.log("Container: ", result)
            expect(result._id).toEqual(containerId);
        }));

    });
});
