'use strict';

angular.module('com.inthetelling.story')
	.controller('EpisodeListController', function ($scope, config, dataSvc, authSvc) {

		$scope.loading = true;
		dataSvc.getAllContainers().then(function (data) {

			$scope.containers = data;
			$scope.loading = false;

			$scope.userHasRole = function (role) {
				return authSvc.userHasRole(role);
			};

			$scope.loginTo = function (epId) {
				console.log("EPID: ", epId);
				localStorage.removeItem(config.localStorageKey);
				window.open(config.apiDataBaseUrl + "/oauth2?episode=" + epId);

			};

			$scope.addEpisode = function (session) {
				console.log("Add episode ", session);

				var newEpisodeContainer = {
					"customer_id": session.customer_id,
					"parent_id": session._id,
					"name": {
						en: session.newEpisodeTitle
					}
				};

				dataSvc.createContainer(newEpisodeContainer).then(function (container) {
					console.log("Created container:", container);
					dataSvc.createEpisode().then(function (episode) {
						console.log("Created episode: ", episode);
						// add both to $scope.containers
						container.episodes = [episode._id];
						session.children.push(container);
						// reset form for next
						session.newEpisodeTitle = undefined;
						session.addingEpisode = undefined;

					});

				});
			};

			$scope.deleteContainer = function (c) {
				// TODO
				// confirm with user, then delete episode, then delete container

				// Unsafe, just for testing convenience fow now so I don't clutter database

				// Eventually should block this if there are events in the episode, or child containers,
				// make sure they delete the epsiode first, etc
				console.log("TODO deleteContainer", c);
			};
		});
	});
