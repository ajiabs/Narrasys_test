'use strict';

/* If no container ID is supplied, the uploaded asset(s) will be placed in user space instead. */

angular.module('com.inthetelling.story')
	.directive('ittAssetUploader', function ($timeout, awsSvc, appState, modelSvc) {
		return {
			restrict: 'A',
			replace: false,
			scope: {
				containerId: '=ittAssetUploader'
			},
			templateUrl: 'templates/producer/asset-uploader.html',
			link: function (scope, element) {
				scope.uploadStatus = [];
				scope.uploads = [];
				scope.uploadsinprogress = 0;

				scope.handleUploads = function (files) {
					// TODO push these onto the end of anything that's already in progress...
					console.log("handleUploads:", files);
					scope.uploadsinprogress = files.length;

					for (var i = 0; i < files.length; i++) {
						scope.uploadStatus[i] = {
							"bytesSent": 0,
							"bytesTotal": 1,
							"percent": 0,
							"name": files[i].name
						};
					}
					if (scope.containerId) {
						scope.uploads = awsSvc.uploadContainerFiles(scope.containerId, files);
					} else {
						scope.uploads = awsSvc.uploadUserFiles(appState.user._id, files);
					}
					for (i = 0; i < scope.uploads.length; i++) {
						(function (i) { // closure for i
							scope.uploads[i].then(function (data) {
								modelSvc.cache("asset", data.file);
								scope.uploadStatus[i].done = true;
								scope.oneDone();
							}, function (data) {
								scope.uploadStatus[i].error = data;
								scope.oneDone();
							}, function (update) {
								scope.uploadStatus[i].bytesSent = update.bytesSent;
								scope.uploadStatus[i].bytesTotal = update.bytesTotal;
								scope.uploadStatus[i].percent = Math.ceil(update.bytesSent / update.bytesTotal * 100);
							});
						})(i);
					}
				};

				scope.oneDone = function () {
					scope.uploadsinprogress = scope.uploadsinprogress - 1;
					if (scope.uploadsinprogress === 0) {
						scope.fileinput.value = '';
						scope.paused = false;

					}
				};

				scope.handleDrop = function (e) {
					e.preventDefault();
					e.stopPropagation();

					console.log(scope.containerType, scope.containerId);
					console.log(e.dataTransfer.files);

					scope.handleDragLeave();
					scope.handleUploads(e.dataTransfer.files);
				};

				scope.handleDragOver = function (e) {
					e.preventDefault();
					e.dataTransfer.dropEffect = 'move';
					scope.handleDragEnter();
					return false;
				};
				scope.handleDragEnter = function () {
					angular.element(scope.droptarget).addClass('droppable');
					return false;
				};
				scope.handleDragLeave = function () {
					angular.element(scope.droptarget).removeClass('droppable');
					return false;
				};

				scope.pauseUpload = function () {
					awsSvc.pauseUpload();
					scope.paused = true;
				};

				scope.resumeUpload = function () {
					awsSvc.resumeUpload();
					scope.paused = false;
				};

				scope.cancelUpload = function () {
					awsSvc.cancelUpload();
					scope.uploadsinprogress = 0;
					for (var i = 0; i < scope.uploadStatus.length; i++) {
						if (!scope.uploadStatus[i].done && !scope.uploadStatus[i].error) {
							scope.uploadStatus[i].error = "Canceled by user";
						}
					}
				};

				$timeout(function () {
					scope.droptarget = element.find('.uploadDropTarget')[0];
					scope.fileinput = element.find('.uploadFileInput')[0];
					scope.uploadsinprogress = 0;
					scope.droptarget.addEventListener('drop', scope.handleDrop);
					scope.droptarget.addEventListener('dragover', scope.handleDragOver);
					scope.droptarget.addEventListener('dragenter', scope.handleDragEnter);
					scope.droptarget.addEventListener('dragleave', scope.handleDragLeave);

				});

			}
		};
	});
