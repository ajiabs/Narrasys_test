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
		modal.result.then(function(){
			// if the modal closes 'successfully'
			videojs.player.play();
		}, function() {
			// if the modal is 'dismissed'
			videojs.player.play();
		});
	};

	// Method to show the search panel
	svc.createSearchPanelOverlay = function(episodeScope) {
		console.log("createSearchPanelOverlay()");
		videojs.player.pause();
		var modal = $modal.open({
			keyboard: true,
			backdrop: true,
			templateUrl: 'templates/overlays/searchPanel.html',
			windowClass: 'sidePanel searchPanel',
			scope: episodeScope,
			controller: 'SearchPanelController'
		});
		modal.result.then(function(){
			// if the modal closes 'successfully'
			videojs.player.play();
		}, function() {
			// if the modal is 'dismissed'
			videojs.player.play();
		});
	};

	// Method to show the search panel
	svc.createNavigationPanelOverlay = function(episodeScope) {
		console.log("createNavigationPanelOverlay()");
		videojs.player.pause();
		var modal = $modal.open({
			keyboard: true,
			backdrop: true,
			templateUrl: 'templates/overlays/navigationPanel.html',
			windowClass: 'sidePanel navigationPanel',
			scope: episodeScope,
			controller: 'NavigationPanelController'
		});
		modal.result.then(function(){
			// if the modal closes 'successfully'
			videojs.player.play();
		}, function() {
			// if the modal is 'dismissed'
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
				templateUrl: 'templates/overlays/init.html'
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