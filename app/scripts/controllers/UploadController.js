'use strict';

angular.module('com.inthetelling.story')
    .controller('UploadController', function ($scope, config, awsSvc) {
    //.controller('UploadController', function ($scope, config, awsSvc, appState) {
	
	$scope.loading = true;
	awsSvc.getBucketListing().then(function (data) {
	    $scope.bucket_objects = data.Contents;
	    $scope.loading = false;
	});

	//$scope.loading = true;
	//awsSvc.createMultipartUpload().then(function (data) {
	//    $scope.new_upload = data.Contents;
	//    $scope.loading = false;
	//});
	
	$scope.loading = true;
	awsSvc.getMultipartUploads().then(function (data) {
	    $scope.uploads_in_progress = data;
	    $scope.upload_parts = [];
	    for(var i=0; i<data.Uploads.length; i++) {
		awsSvc.getMultipartUploadParts(i, data.Uploads[i]).then(function (data) {
		    $scope.upload_parts[data.i] = data.parts;
		    $scope.loading = false;
		});
	    }
	});

	$scope.loading = true;
	$scope.uploadFile = function(){
	    awsSvc.uploadFile(document.getElementById('file').files[0]).then(function (data) {
		$scope.upload_result = data;
		$scope.loading = false;
	    }, function(reason) {
		console.log('Upload Failed: ', reason);
	    }, function(update) {
		$scope.upload_status = update;
	    });
	};

	$scope.pauseUpload = function(){
	    awsSvc.pauseUpload();
	};

	$scope.resumeUpload = function(){
	    awsSvc.resumeUpload();
	};

	$scope.cancelUpload = function(){
	    awsSvc.cancelUpload();
	};

	$scope.deleteObject = function(bucketObject) {
	    awsSvc.deleteObject(bucketObject);
	};

	$scope.cancelMultipartUpload = function(multipartUpload) {
	    awsSvc.cancelMultipartUpload(multipartUpload);
	};
	
    });
