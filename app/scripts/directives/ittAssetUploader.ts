ittAssetUploader.$inject = ['$timeout', 'awsSvc', 'appState', 'modelSvc', 'dataSvc'];
export default function ittAssetUploader($timeout, awsSvc, appState, modelSvc, dataSvc) {
  return {
    restrict: 'A',
    replace: false,
    transclude: true,
    scope: {
      containerId: '=ittAssetUploader', // If no container ID is supplied, the uploaded asset(s) will be placed in user space instead.
      episodeId: '@', //for uploading transcripts
      callback: '&', // function that will be called for each uploaded file (with the newly cretaed asset's ID)
      mimeTypes: '@',
      instructions: '@',
      errorText: '@'
    },
    templateUrl: 'templates/producer/asset-uploader.html',
    link: function (scope, element, attrs) {

      function strStartsWith(str, prefix) {
        return str.indexOf(prefix) === 0;
      }

      function strEndsWith(str, match) {
        return str.substring(str.length - match.length, str.length) === match;
      }

      if (scope.instructions === undefined) {
        scope.manPage = 'We support uploads of most common file formats, including .doc, .docx, .jpeg, .jpg, .pdf, .png, .ppt, .pptx, .rtf, .txt, and .zip. ';
      } else {
        scope.manPage = scope.instructions;
      }

      var _mimeTypes;
      if (scope.mimeTypes === undefined) {
        //allow basically doc, image, or video.
        _mimeTypes = ['application/*', 'image/*', 'video/*', 'text/*', 'audio/*', 'model/*'];
      } else {
        _mimeTypes = scope.mimeTypes.split(',');
      }

      var _errorText;
      if (scope.errorText === undefined) {
        _errorText = 'Whoops! You may want to try that again!';
      } else {
        _errorText = scope.errorText;
      }

      //normalize passed in params
      angular.forEach(_mimeTypes, function (m, i) {
        _mimeTypes[i] = m.trim();
      });

      function handleTranscripts(episodeId, postData, params) {
        var fd = new FormData();
        fd.append('subtitles', postData);
        return dataSvc.batchUploadTranscripts(episodeId, fd, params);
      }

      scope.uploadStatus = [];
      scope.uploads = [];
      scope.uploadsinprogress = 0;
      scope.multiple = (attrs.multiple !== undefined);

      scope.handleUploads = function (files) {

        if (!scope.multiple) {
          if (files.length > 1 || scope.uploads.length > 0) {
            scope.errormessage = "You may only upload one file at a time here.";
            return false;
          }
        }

        //disallow certain file types
        var stop = false;
        // gotta filter
        angular.forEach(files, function (f) {
          //properties on a File (such as type) are read only.
          var ftype = f.type;
          //if batch uploading transcripts get mimetype off of name
          if (scope.episodeId) {
            var ext = f.name.match(/(vtt|srt)/);
            if (ext && ext.length) {
              ftype = 'text/' + ext[0];
            }
          }

          angular.forEach(_mimeTypes, function (m) {
            var paramStrEndsWithStar = strEndsWith(m, '*');

            if (paramStrEndsWithStar) {

              var mimeTypeUntilWildcard = m.slice(0, -1);

              var applicationTypesMatch = strStartsWith(ftype, mimeTypeUntilWildcard);

              if (applicationTypesMatch) {
                stop = true;
              }

            } else {
              //only accept identical mimeType?
              if (ftype === m) {
                stop = true;
              }

            }
            _errorText = ftype + ' uploads are not allowed here.';
          });
        });

        if (!stop) {
          scope.errormessage = _errorText;
          return;
        }

        // push these onto the end of the existing uploads array, if any:
        var oldstack = scope.uploads.length;
        var newstack = scope.uploads.length + files.length;
        scope.uploadsinprogress = scope.uploadsinprogress + files.length;
        if (scope.containerId) {
          scope.uploads = scope.uploads.concat(awsSvc.uploadContainerFiles(scope.containerId, files));
        } else if (scope.episodeId) {
          //store copy of files on scope
          scope.tempTranscripts = files;
          //and let parent controller know
          scope.callback();
          //for view
          scope.uploadStatus.push({
            "bytesSent": 0,
            "bytesTotal": 1,
            "percent": 0,
            "name": files[0].name
          });
          scope.uploads = scope.uploadStatus;
          //and wait for $broadcast to receive optional params for transcripts then upload files
          return;
        } else{
          scope.uploads = scope.uploads.concat(awsSvc.uploadUserFiles(appState.user._id, files));
        }

        resolveUploads(oldstack, newstack, files);
      };

      scope.$on('transcriptsReceived', function(e, params) {
        var files = scope.tempTranscripts;
        scope.uploads = [handleTranscripts(scope.episodeId, files[0], params)];
        scope.uploadStatus = [];
        resolveUploads(0, 1, files);
      });

      function resolveUploads(oldstack, newstack, files) {
        for (var i = oldstack; i < newstack; i++) {
          (function (i) { // closure for i
            scope.uploadStatus[i] = {
              "bytesSent": 0,
              "bytesTotal": 1,
              "percent": 0,
              "name": files[i - oldstack].name
            };
            scope.uploads[i].then(function (data) {

              if (scope.episodeId && scope.callback) {
                //this currently only happens when batch uploading transcripts
                scope.uploadStatus[i].done = true;
                scope.oneDone();
                scope.$emit('transcriptsUploaded');
                return;
              }

              modelSvc.cache("asset", data.file);
              if (scope.callback) {
                scope.callback({data: data.file._id});
              }
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
      }

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
        scope.droptarget.addClass('droppable');

      };
      scope.handleDragLeave = function () {
        scope.droptarget.removeClass('droppable');

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
      };

      $timeout(function () { // need to wait for the DOM
        scope.droptarget = element.find('.uploadDropTarget');
        scope.fileinput = element.find('.uploadFileInput');
        scope.uploadsinprogress = 0;
        scope.droptarget[0].addEventListener('drop', scope.handleDrop);
        scope.droptarget[0].addEventListener('dragover', scope.handleDragOver);
        scope.droptarget[0].addEventListener('dragenter', scope.handleDragEnter);
        scope.droptarget[0].addEventListener('dragleave', scope.handleDragLeave);
      });
    }
  };
}
