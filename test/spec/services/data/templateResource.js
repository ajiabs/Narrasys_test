describe('templateResource', function () {
    var mockUserResource, $httpBackend;
    beforeEach(angular.mock.module('com.inthetelling.story'));

    beforeEach(function () {
        angular.mock.inject(function ($injector) {
            $httpBackend = $injector.get('$httpBackend');
            TemplateDataModel = $injector.get('TemplateDataModel');
            DataModelUtils = $injector.get('DataModelUtils');
            mockTemplateResource = $injector.get('Template');
            config = $injector.get('config');
        })
    });

    describe('getTemplate', function () {
        it('should call template get by id', inject(function (Template) {
            var templateId = "5240be41dd4736976c00000d";
            DataModelUtils.setData(TemplateDataModel.data);
            var template = DataModelUtils.findOne(templateId);
            $httpBackend.expectGET(config.apiDataBaseUrl + '/v1/templates/' + templateId)
                .respond(template);

            var result = mockTemplateResource.get({
                templateId: templateId
            });
            $httpBackend.flush();
            console.log(result)
            expect(result._id).toEqual(templateId);
        }));

    });
});
