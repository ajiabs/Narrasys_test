'use strict';

// Controller for ittItem
angular.module('com.inthetelling.player')
.controller('ItemController', function ($scope, $element, modalMgr, videojs) {

	// pass through method to modal.createItemDetailOverlay() for templates
	$scope.launchDetailView = function(x) {
		$scope.item.injectedSource=$scope.item.source; // gives URL to iframes
		// If pane width > 400 show the iframe inline; otherwise pop a modal
		if ($element.closest('.content').width() > 400) {
			$scope.item.showInlineDetail = !$scope.item.showInlineDetail;
		} else {
			modalMgr.createItemDetailOverlay($scope);
		}
	};
	
	// convenience method to set video time
	$scope.gotoCuePoint = function(t) {
		videojs.player.currentTime(t);
	};

});
