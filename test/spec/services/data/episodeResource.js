describe('episodeResource', function () {
    var mockUserResource, $httpBackend;
    beforeEach(angular.mock.module('com.inthetelling.story'));

    beforeEach(function () {
        angular.mock.inject(function ($injector) {
            $httpBackend = $injector.get('$httpBackend');
            EpisodeDataModel = $injector.get('EpisodeDataModel');
            DataModelUtils = $injector.get('DataModelUtils');
            mockEpisodeResource = $injector.get('Episode');
            config = $injector.get('config');
        })
    });
    //a silly test, just to make sure we haven't screwed up anything in our resources
    describe('getEpisode', function () {
        it('should call episode get by id', inject(function (Episode) {
            var episodeId = "51da82dcbd526e960d000001";
            DataModelUtils.setData(EpisodeDataModel.data);
            var episode = DataModelUtils.findOne(episodeId);
            $httpBackend.expectGET(config.apiDataBaseUrl + '/v3/episodes/' + episodeId)
                .respond(episode);

            var result = mockEpisodeResource.get({
                episodeId: episodeId
            });
            $httpBackend.flush();
            console.log(result)
            expect(result._id).toEqual(episodeId);

        }));

    });
});
