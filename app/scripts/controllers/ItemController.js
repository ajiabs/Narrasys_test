'use strict';

// Controller for ittItem
angular.module('com.inthetelling.player')
	.controller('ItemController', function ($scope, videojs, modalMgr) {

		// convenience method to set video time
		$scope.gotoItem = function () {
			videojs.player.currentTime($scope.item.startTime);
		};


				$scope.pause = function() {
					videojs.player.pause();
				};

				$scope.showModal = function() {
					videojs.player.pause();
					modalMgr.createItemDetailOverlay($scope);
				};

	});
