'use strict';

angular.module('com.inthetelling.player')
// properly encodes multipart/form POSTs:
.factory('formDataObject', function () {
	return function (data) {
		var fd = new FormData();
		angular.forEach(data, function (value, key) {
			fd.append(key, value);
		});
		return fd;
	};
})

// Notifies controller that a file has been selected:
.directive('fileUpload', function () {
	return {
		scope: true, //create a new scope
		link: function (scope, el, attrs) {
			el.bind('change', function (event) {
				var files = event.target.files;
				//iterate files since 'multiple' may be specified on the element
				for (var i = 0; i < files.length; i++) {
					//emit event upward
					scope.$emit("fileSelected", {
						file: files[i]
					});
				}
			});
		}
	};
})

.controller('FileUploadController', function (dataSvc, $scope, $rootScope, $http, config, formDataObject, $timeout, $q, $window) {

	console.log("fileuploadcontroller", $scope);

	$scope.fileToUpload = "";
	$scope.textToUpload = "";
	$scope.titleToUpload = "";
	$scope.youtubeLinkToUpload = "";
	$scope.displayAs = "fullscreen";
	$scope.episode = $('#CONTAINER > div').scope().episode;
	$scope.scenes = $('#CONTAINER > div').scope().scenes;

	// TODO detect existing SxS item in this scene and warn they'll be overwritten?


	//listen for the file selected event
	$scope.$on("fileSelected", function (event, args) {
		console.log("fileSelected", event, args);
		$scope.$apply(function () {
			//add the file object to the scope's files collection
			$scope.fileToUpload = args.file;
		});
	});

	$scope.hideModal = function () {
		$rootScope.$emit("SxS.hide");
	};

	$scope.floatMessage = function (message, variant) {
		$rootScope.$emit("SxS.message", message, variant);
	};


	$scope.handleLink = function () {
		var getYTId = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
		var curScene = $('.thisisthetoolbar').scope().curScene;

		if ($scope.youtubeLinkToUpload === "") {
			alert("For now, you must choose a video file to upload. (In real life this will be optional)");
			return;
		}

		var ytId = $scope.youtubeLinkToUpload.match(getYTId)[1];
		// First delete SxS items in this scene
		$scope.deleteSxSItems(curScene);

		$scope.floatMessage("Your link is now being added to the episode.", "progress");
		$rootScope.$emit("SxS.hide");


		var eventData = {};
		if ($scope.displayAs === 'fullscreen') {
			eventData = {
				"event": {
					"type": "Link",
					"start_time": $scope.curScene.startTime,
					"description": $scope.textToUpload,
					"title": $scope.titleToUpload,
					"keywords": ["SxS"],
					"style_id": [null],
					"url": 'https://www.youtube.com/embed/' + ytId,

					"end_time": ($scope.curScene.startTime + 2),
					"stop": true,
					"layout_id": ["528d17eeba4f65e57800001e"], // windowFg
					"template_id": "5339deddba4f65a45e00000b" // upload-demo.html
				}
			};
		} else {
			eventData = {
				"event": {
					"type": "Link",
					"start_time": $scope.curScene.startTime,
					"description": $scope.textToUpload,
					"title": $scope.titleToUpload,
					"keywords": ["SxS"],
					"style_id": [null],
					"url": 'https://www.youtube.com/embed/' + ytId,

					"end_time": ($scope.curScene.startTime + 20),
					"stop": false,
					"layout_id": ["528d17edba4f65e578000017"], // inline
					"template_id": "533d72752442bdbd81000001" // upload-demo-inline.html
				}
			};
		}
		$http({
			method: 'POST',
			url: config.apiDataBaseUrl + '/v2/episodes/' + $scope.episode._id + '/events/',
			data: eventData
		}).success(function (data, status, headers) {
			console.log("Created event:", data, status, headers);
			$scope.floatMessage("All done! In a real episode we would be able to show the new item to you immediately; for now you'll need to reload the browser window.", "reload");


		}).error(function (data, status, headers) {
			console.log("Failed to create event", data, status, headers);
			$scope.floatMessage("Error: failed to create event, sorry!");
		});


	};

	$scope.handleUpload = function () {

		var curScene = $('.thisisthetoolbar').scope().curScene;

		if ($scope.fileToUpload === "") {
			alert("For now, you must choose a video file to upload. (In real life this will be optional)");
			return;
		}

		// First delete SxS items in this scene
		$scope.deleteSxSItems(curScene);

		$scope.floatMessage("Your video is now being uploaded.", "progress");
		$rootScope.$emit("SxS.hide");

		$http({
			method: 'POST',
			url: config.apiDataBaseUrl + '/v1/containers/' + $scope.episode.containerId + '/assets',
			headers: {
				'Content-Type': undefined
			},
			data: {
				"asset[attachment]": $scope.fileToUpload
			},
			transformRequest: formDataObject
		}).
		success(function (data) {
			console.log("Created asset", data);
			// assetid is data.file._id

			var eventData = {};
			if ($scope.displayAs === 'fullscreen') {
				eventData = {
					"event": {
						"type": "Upload",
						"asset_id": data.file._id,
						"start_time": $scope.curScene.startTime,
						"description": $scope.textToUpload,
						"title": $scope.titleToUpload,
						"keywords": ["SxS"],
						"style_id": [null],

						"end_time": ($scope.curScene.startTime + 2),
						"stop": true,
						"layout_id": ["528d17eeba4f65e57800001e"], // windowFg
						"template_id": "5339deddba4f65a45e00000b" // upload-demo.html
					}
				};
			} else {
				eventData = {
					"event": {
						"type": "Upload",
						"asset_id": data.file._id,
						"start_time": $scope.curScene.startTime,
						"description": $scope.textToUpload,
						"title": $scope.titleToUpload,
						"keywords": ["SxS"],
						"style_id": [null],

						"end_time": ($scope.curScene.startTime + 20),
						"stop": false,
						"layout_id": ["528d17edba4f65e578000017"], // inline
						"template_id": "533d72752442bdbd81000001" // upload-demo-inline.html
					}
				};
			}

			$http({
				method: 'POST',
				url: config.apiDataBaseUrl + '/v2/episodes/' + $scope.episode._id + '/events/',
				data: eventData
			}).success(function (data, status, headers) {
				console.log("Created event:", data, status, headers);

				// TODO: check if it's an image or a video here; only do the transcode poll for videos


				// Update floater with "transcoding" message
				$scope.floatMessage("Upload complete! Now transcoding...", "progress");

				// start polling server to see when the event has an alternate_urls array
				$scope.pollEvent(data);


			}).error(function (data, status, headers) {
				console.log("Failed to create event", data, status, headers);
				$scope.floatMessage("Error: failed to create event, sorry!");
			});
		}).
		error(function (data, status, headers) {
			console.log("asset creation failed", data, status, headers);
			$scope.floatMessage("Error: failed to create asset, sorry!");
		});

	};

	$scope.resetDemo = function () {
		var curScene = $('.thisisthetoolbar').scope().curScene;
		if (confirm("This will delete ALL instructor assets and events from this episode. Are you sure?")) {
			$scope.floatMessage("Please wait, deleting items. The episode will reload automatically when this is complete.", "progress");
			$timeout(function () {
				$window.location.reload();
			}, 7000);
			angular.forEach($scope.scenes, function (scene) {
				$scope.deleteSxSItems(scene);
			});
		}
	};

	$scope.deleteSxSItems = function (scene) {
		angular.forEach(scene.items, function (item) {
			if (item.keywords && item.keywords[0] === "SxS") {
				// delete this item and its associated asset
				var asset = dataSvc.getAssetById(item.assetId);

				_quickDelete(config.apiDataBaseUrl + '/v2/episodes/' + $scope.episode._id + '/events/' + item._id)
					.then(function () {
						if (asset) {
							_quickDelete(config.apiDataBaseUrl + '/v1/containers/' + asset.container_id + '/assets/' + asset._id);
						}
					});
			}
		});

	};

	var _quickDelete = function (endpoint) {
		var defer = $q.defer();

		$http({
			method: 'DELETE',
			url: endpoint,
			headers: {
				'Content-Type': 'application/json'
			}
		}).
		success(function (data, status, headers) {
			console.log("delete succeeded: ", data);
			defer.resolve();
		}).
		error(function (data, status, headers) {
			console.log("ERROR, delete failed: ", data, status, headers);
		});

		return defer.promise;

	};

	$scope.pollEvent = function (eventData) {
		// TODO: this uselessly waits for one timeout tick even on asset::image items.
		$timeout(function () {

			$http({
				method: 'GET',
				url: config.apiDataBaseUrl + '/v1/containers/' + $scope.episode.containerId + '/assets/' + eventData.asset_id
			}).success(function (assetData) {

				console.log("poll", assetData);
				if (assetData.alternate_urls) {
					$scope.floatMessage("All done! In a real episode we would be able to show the new item to you immediately; for now you'll need to reload the browser window.", "reload");

					// TODO: inject the new event into the episode data...  this is why I am rewriting modelFactory
					// because doing this here will be difficult-ish
					console.log("Got new event:", eventData, assetData);
				} else {
					if (assetData._type === "Asset::Video") {
						$scope.pollEvent(eventData);
					} else {
						$scope.floatMessage("All done! In a real episode we would be able to show the new item to you immediately; for now you'll need to reload the browser window.", "reload");
					}
				}
			}).error(function (data) {
				$scope.floatMessage("Error: polling the asset for transcode failed, for some reason. That was unexpected. Sorry!");
			});
		}, 3000);

	};
});
