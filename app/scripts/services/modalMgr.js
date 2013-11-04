'use strict';

/*
	Service to handle route management
	This service uses the modal class of the angular-bootstrap library for modal management
	http://angular-ui.github.io/bootstrap/
*/
angular.module('com.inthetelling.player')
.factory('modalMgr', function($modal, videojs, _) {

	// hold on to a reference of the init overlay so the consumer can
	// create/destroy it asynchronously without needing to keep its own reference
	var initOverlay;

	var svc = {};

	// Method to show the overlay for item detail view
	// itemScope: the scope of the ittItem directive we are creating this overlay for
	svc.createItemDetailOverlay = function(itemScope) {
		console.log("createItemDetailOverlay:", itemScope.item);
		videojs.player.pause();
		var modal = $modal.open({
			keyboard: true,
			backdrop: true,
			templateUrl: itemScope.item.itemDetailTemplateUrl,
			scope: itemScope,
			controller: function ($scope, $modalInstance) {
				$scope.close = function() {
					$modalInstance.close();
				};
			}
		});
		// The $modal.open() method returns an object which contains an angular promise called result.
		// We pass two methods to the then() method of the promise because the first method will be triggered if the modal
		// closes 'successfully' and the second if it is dismissed (eg: clicking the backdrop or escape key). In this
		// case we don't care how the modal is closed, we just want to resume playback.
		modal.result.then(function(){
			videojs.player.play();
		}, function() {
			videojs.player.play();
		});
	};
	
	// Method to show the global initialization overlay
	// Does not require a scope or a model
	svc.createInitOverlay = function() {
		console.log("createInitOverlay");
		if (!initOverlay) {
			initOverlay = $modal.open({
				keyboard: false,
				backdrop: 'static',
				templateUrl: 'views/overlays/init.html',
				controller: function ($scope, $modalInstance) {
					$scope.close = $modalInstance.close;
				}
			});
		}
	};

	// Method to hide the initialization overlay
	svc.destroyInitOverlay = function() {
		console.log("destroyInitOverlay");
		if (initOverlay) {
			initOverlay.close();
			initOverlay = null;
		}
	};

	return svc;

});