'use strict';

angular.module('com.inthetelling.story')
	.controller('UploadController', function ($scope, config, awsSvc) {

		$scope.loading = true;
		awsSvc.getBucketListing().then(function (data) {
			$scope.bucket_objects = data.Contents;
			$scope.loading = false;
		});

		$scope.loading = true;
		awsSvc.getMultipartUploads().then(function (data) {
			$scope.uploads_in_progress = data;
			$scope.upload_parts = [];
			for (var i = 0; i < data.Uploads.length; i++) {
				awsSvc.getMultipartUploadParts(i, data.Uploads[i]).then(function (data) {
					$scope.upload_parts[data.i] = data.parts;
					$scope.loading = false;
				});
			}
		});

		$scope.uploadFiles = function () {
			$scope.upload_status = [];
			$scope.uploads = awsSvc.uploadFiles(document.getElementById('file').files);
			for (var i in $scope.uploads) {
				//Pass i in a closure so it is unique for each promise
				(function (i) {
					var uploadPromise = $scope.uploads[i];
					uploadPromise.then(function (data) {
						console.log('Upload succeeded!', data);
						$scope.upload_result = data;
					}, function (reason) {
						console.log('Upload Failed: ', reason);
					}, function (update) {
						$scope.upload_status[i] = update;
					});
				})(i);
			}
			console.log('$scope.uploads: ', $scope.uploads);
		};

		$scope.pauseUpload = function () {
			awsSvc.pauseUpload();
		};

		$scope.resumeUpload = function () {
			awsSvc.resumeUpload();
		};

		$scope.cancelUpload = function () {
			awsSvc.cancelUpload();
		};

		$scope.networkError = function () {
			awsSvc.networkError();
		};

		$scope.deleteObject = function (bucketObject) {
			awsSvc.deleteObject(bucketObject);
		};

		$scope.cancelMultipartUpload = function (multipartUpload) {
			awsSvc.cancelMultipartUpload(multipartUpload);
		};

	});
