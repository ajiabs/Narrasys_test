'use strict';

//TODO: explore view needs to stash and remove showCurrent from scene layout if present

// Controller for ittToolbar
angular.module('com.inthetelling.player')
.controller('ToolbarController', function ($scope, $timeout, $rootScope, videojs) {

	/* Handler for toolbar buttons to change scene templates. */
	$scope.setSceneTemplate = function(newTemplate) {
		console.log("setSceneTemplate " + newTemplate);
		
		$scope.currentSceneTemplate = newTemplate;
			// set all scenes to use newTemplate
		for (var i=0; i<$scope.scenes.length; i++) {
			var thisScene = $scope.scenes[i];
			if (newTemplate) {
				if (thisScene.origTemplateUrl === undefined) {
					thisScene.origTemplateUrl = thisScene.templateUrl;   // so we can revert to it later
				}
				thisScene.templateUrl = "templates/scene-"+newTemplate+".html"; // hardcoded for now
			} else {
				if (thisScene.origTemplateUrl) { // if this is undefined, we've never left directed view so don't need to do anything here
					thisScene.templateUrl = thisScene.origTemplateUrl;
				}
			}
		}
		
		// TODO: set button states immediately since scene redraw takes a while; need to give users feedback that it's working
		
		// Need timeout because videoMagnet needs to run after DOM update; so don't wind up trying to test against a display:none node
		$timeout(function() {
			$rootScope.$emit('toolbar.changedSceneTemplate');
		}, 0);

	};
	
	/* detect which view we're in */
	/* this is a bizarre syntax but seems to be how it's supposed to work... */
	$scope.currentSceneTemplateIs = function(compare) {
		return $scope.currentSceneTemplate === compare;
	};

	// Nav and Search:
	$scope.show = {
		navigationPanel: false,
		searchPanel: false,
		searchPanelInternals: false // 
	};

	$scope.showNavigationPanel = function() {
		videojs.player.pause();
		videojs.player.controls(false); // TODO: do this on iPad only
		$scope.show.navigationPanel = true;
	};
	
	$scope.showSearchPanel = function() {
		videojs.player.pause();
		videojs.player.controls(false); // TODO: do this on iPad only
		$scope.show.searchPanel = true;
		// Wait a tick before building the search panel internals. (Possibly unnecessary, but just in case...)
		$timeout(function() {
			$scope.show.searchPanelInternals = true;
		},0);
	};
	
	$scope.hidePanels = function() {
		// (Same trigger to dismiss either panel; fine since only one can be visible at a time anyway)
		$scope.show.navigationPanel = false;
		$scope.show.searchPanel = false;
		videojs.player.controls(true); // TODO: do this on iPad only

		// For now, don't set searchPanelInternals to false here; once it's built leave it in place to maintain state.
		// TODO if this causes memory problems on old devices we can change this, but let's wait and see if that happens first
	};

});
