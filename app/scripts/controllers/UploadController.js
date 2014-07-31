'use strict';

angular.module('com.inthetelling.story')
    .controller('UploadController', function ($scope, config, awsSvc) {
    //.controller('UploadController', function ($scope, config, awsSvc, appState) {
	
	$scope.loading = true;
	awsSvc.getBucketListing().then(function (data) {
	    $scope.bucket_objects = data.Contents;
	    $scope.loading = false;
	});
	
	
    });
