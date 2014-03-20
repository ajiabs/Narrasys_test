'use strict';

// UI Error Controller
angular.module('com.inthetelling.player')
	.controller('FileUploadController', function ($scope) {

		console.log("fileuploadcontroller");

		$scope.$on('flow::init', function() {
			console.log("flow init");
		});



		$scope.$on('flow::fileAdded', function() {
			console.log("file added");
		});

		$scope.$on('flow::fileAdded', function() {
			console.log("file added");
		});

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