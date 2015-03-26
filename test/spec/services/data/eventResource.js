describe('eventResource', function () {
    var mockUserResource, $httpBackend;
    beforeEach(angular.mock.module('com.inthetelling.story'));

    beforeEach(function () {
        angular.mock.inject(function ($injector) {
            $httpBackend = $injector.get('$httpBackend');
						EventDataModel = $injector.get('EventDataModel');
						DataModelUtils = $injector.get('DataModelUtils');
            mockEventResource = $injector.get('Event');
        })
    });

    describe('getEvent', function () {
        it('should call event get by id', inject(function (Event) {
						var eventId = "5240be41dd4736976c00000d";						
						DataModelUtils.setData(EventDataModel.data);
						var event = DataModelUtils.findOne(eventId);
            $httpBackend.expectGET('/v1/events/' + eventId)
                .respond(event);

            var result = mockEventResource.get({eventId:eventId});
            $httpBackend.flush();
            console.log(result)
            expect(result._id).toEqual(eventId);
        }));

    });
});
