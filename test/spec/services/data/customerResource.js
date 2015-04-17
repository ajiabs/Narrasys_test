describe('customerResource', function () {
    var mockUserResource, $httpBackend;
    beforeEach(angular.mock.module('com.inthetelling.story'));

    beforeEach(function () {
        angular.mock.inject(function ($injector) {
            $httpBackend = $injector.get('$httpBackend');
						CustomerDataModel = $injector.get('CustomerDataModel');
						DataModelUtils = $injector.get('DataModelUtils');
            mockCustomerResource = $injector.get('Customer');
						config = $injector.get('config');
        })
    });

    describe('getCustomer', function () {
        it('should call customer get by id', inject(function (Customer) {
						var customerId = "51d365cdbd526e037d000001";						
						console.log("CUSTOMER DATA", CustomerDataModel.data);	
						DataModelUtils.setData(CustomerDataModel.data);
						var customer = DataModelUtils.findOne(customerId);
						console.log('customer0---', customer);
            $httpBackend.expectGET(config.apiDataBaseUrl + '/v3/customers/' + customerId)
                .respond(customer);

            var result = mockCustomerResource.get({customerId:customerId});
            $httpBackend.flush();
            console.log(result)
            //expect(result._id).toEqual(customerId);
        }));

    });
});
