'use strict';

angular.module('com.inthetelling.player')
	.factory('formDataObject', function () {
		return function (data) {
			var fd = new FormData();
			angular.forEach(data, function (value, key) {
				fd.append(key, value);
			});
			return fd;
		};
	});


angular.module('com.inthetelling.player')
	.controller('FileUploadController', function ($scope, $http, config, formDataObject) {

		console.log("fileuploadcontroller", $scope);

		//$('#CONTAINER > div').scope().episode._id

		console.log($('#CONTAINER > div').scope().episode);

		$scope.handleUpload = function () {
			var episodeId;
			var containerId;
			//if ($('#CONTAINER > div').scope().episode) {
			//	episodeId = $('#CONTAINER > div').scope().episode._id;
			//	containerId = $('#CONTAINER > div').scope().episode.containerId;
			//} else {
				episodeId = "528fa688ba4f654bbe000006"; // tmp...
				containerId = "528fa688ba4f654bbe000005";
			//}

			$http({
				method: 'POST',
				url: config.apiDataBaseUrl + '/v1/containers/'+containerId+'/assets',
				data: {
					"asset[attachment]": $scope.fileToUpload,
				},
				transformRequest: formDataObject, // this sends your data to the formDataObject provider that we are defining below.
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			}).
			success(function (data, status, headers, config) {
				console.log(data,status,headers,config);
			}).
			error(function (data, status, headers, config) {
				console.log("ERROR",data,status,headers,config);
			});



		};

/*
		$scope.$on('flow::init', function () {
			console.log("flow init");
		});


		$scope.$on('flow::fileAdded', function () {
			console.log("file added");
		});

		$scope.$on('flow::complete', function () {
			console.log("complete");
		});
*/
	});

/*

     flow-file-success=" ... properties '$file', '$message' can be accessed ... "
      flow-file-progress=" ... property '$file' can be accessed ... "
      flow-file-added=" ... properties '$file', '$event' can be accessed ... "
      flow-files-added=" ... properties '$files', '$event' can be accessed ... "
      flow-files-submitted=" ... properties '$files', '$event' can be accessed ... "
      flow-file-retry=" ... property '$file' can be accessed ... "
      flow-file-error=" ... properties '$file', '$message' can be accessed ... "
      flow-error=" ... properties '$file', '$message' can be accessed ... "
      flow-complete=" ... "
      flow-upload-start=" ... "
      flow-progress=" ... "
*/
