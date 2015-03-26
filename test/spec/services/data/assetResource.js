describe('assetResource', function () {
    var mockUserResource, $httpBackend;
    beforeEach(angular.mock.module('com.inthetelling.story'));

    beforeEach(function () {
        angular.mock.inject(function ($injector) {
            $httpBackend = $injector.get('$httpBackend');
						AssetDataModel = $injector.get('AssetDataModel');
						DataModelUtils = $injector.get('DataModelUtils');
            mockAssetResource = $injector.get('Asset');
        })
    });

    describe('getAsset', function () {
        it('should call asset get by id', inject(function (Asset) {
						var assetId = "52697c7add4736339000000d";						
						var containerId = "51da82dcbd526e960d000001";
						
						DataModelUtils.setData(AssetDataModel.data);
						var asset = DataModelUtils.findOne(assetId);
            $httpBackend.expectGET('/v1/assets/' + assetId)
                .respond(asset);

            var result = mockAssetResource.get({assetId:assetId});
            $httpBackend.flush();
            console.log(result)
            expect(result._id).toEqual(assetId);
        }));

    });
});
