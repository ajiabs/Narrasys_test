'use strict';

angular.module('com.inthetelling.story')
	.directive('ittUser', function ($q, appState, authSvc, dataSvc, awsSvc, modelSvc, imageResize) {
		return {
			restrict: 'A',
			replace: true,
			scope: {

			},
			templateUrl: 'templates/user.html',

			link: function (scope, element, attrs) {

				scope.inPlayer = attrs.inPlayer;
				scope.appState = appState;

				scope.loading = true;
				scope.logout = authSvc.logout;

				authSvc.authenticate().then(function () {
					scope.loading = false;
					scope.user = appState.user;
					scope.userHasRole = authSvc.userHasRole;

					if (!scope.inPlayer && !scope.userHasRole('guest')) {
						scope.getMyNarratives();
					}
				});

				// TODO refactor: this is very similar to ittItemEditor's uploadAsset
				scope.uploadStatus = [];
				scope.toggleUploadAvatar = function () {
					scope.showUploadField = !scope.showUploadField;
				};

				scope.uploadAvatar = function (files) {
					//Start the upload status out at 0 so that the
					//progress bar renders correctly at first
					scope.uploadStatus[0] = {
						"bytesSent": 0,
						"bytesTotal": 1
					};

					var resizeWithService = function(img) {
						return imageResize.resizeImg(img, 60, 60)
						.then(function(canvas) {
							return canvas;
						});
					};

					var formatAvatarFile = function(canvas) {
						return $q(function(resolve) {
							var dataUrl  = imageResize.processAvatar(canvas);
							var file     = imageResize.createFileFromDataURL(dataUrl, files[0].name);
							resolve(file);
						});
					};

					var postToAWS = function(file) {
						awsSvc.uploadUserFiles(appState.user._id, [file])[0]
							.then(function(data) {
								scope.showUploadField = false;
								modelSvc.cache("asset", data.file);
								if (appState.user.avatar_id) {
									// TODO delete the user's previous avatar asset now that we have a new one
									// (but first confirm that events the user has already created aren't storing the old avatar_id directly.... which would be a bug)
								}
								appState.user.avatar_id = data.file._id;
								scope.updateUser();
								delete scope.uploads;
							});
					};

					//promise chain
					imageResize.readFileToImg(files[0])
					.then(resizeWithService)
					.then(formatAvatarFile)
					.then(postToAWS)
					.catch(function(e) {
						console.log('something failed resizing / uploading the image', e);
					});
				};

				scope.updateUser = function () {
					authSvc.updateUser(appState.user).then(function () {
						scope.user = appState.user;
					});
				};
				scope.getMyNarratives = function () {
					dataSvc.getUserNarratives(scope.user._id).then(function (data) {
						// console.log("purchase", data);

						scope.myPurchases = data;

						angular.forEach(scope.myPurchases, function (purchase) {
							purchase.daysUntilExpiration = Math.floor((new Date(purchase.expiration_date) - new Date()) / 86400000);

							// get the narrative data for each purchase (this copes with multiple purchases of the same narrative)
							dataSvc.getNarrativeOverview(purchase.narrative_id).then(function (nData) {
								angular.forEach(scope.myPurchases, function (pur) {
									if (pur.narrative_id === nData._id) {
										pur.narrativeData = nData;
									}
								});
							});
						});

					});
				};

			}
		};
	});
