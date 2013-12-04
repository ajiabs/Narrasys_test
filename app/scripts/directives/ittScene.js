'use strict';

// Scene Directive
angular.module('com.inthetelling.player')
.directive('ittScene', function ($filter, $rootScope) {
	return {
		restrict: 'A',
		replace: true,
		template: '<div ng-include="scene.templateUrl">Loading Scene...</div>',
		scope: {
			scene: '=ittScene'
		},
		link: function ($scope) {
			// console.log("scene: ", $scope);
			
			// TODO: move this into modelFactory, just so we have all the precalc stuff in the same place?
			// For each possible content pane, we're going to set variables for whether extra left or right margin will be needed
			// there are three possible panes in a given scene (panes) which will be identified in the template by scene.sidebars.(paneNames[x])
			$scope.scene.sidebars = {};
			var panes = ["content", $scope.scene.mainPaneContents, $scope.scene.altPaneContents];
			var paneNames = ["content","mainPane","altPane"];
			for (var i=0; i<panes.length; i++) {
				var contentlist = $filter('layout')($scope.scene.items,panes[i]);
				for (var j=0; j < contentlist.length; j++) {
					var layout = contentlist[j].layout;
					if (layout === "sidebarL" || layout === "burstL" || layout === "burst") {
						$scope.scene.sidebars[paneNames[i]+"Left"] = true; // this pane needs a left margin
					}
					if (layout === "sidebarR" || layout === "burstR" || layout === "burst") {
						$scope.scene.sidebars[paneNames[i]+"Right"] = true; // this pane needs a right margin
					}
				}
			}
		
			// Set heights of elements within the scene based on viewport or video size.
			// TODO: don't use jQuery here if possible?
			// TODO: limit effects to this scene: I can't seem to get a handle on the element node from here...?
			$scope.twiddleHeights = function() {
				$('.matchVideoHeight:visible').height($('.videoContainer:visible').height());
				$('.stretchToViewportBottom:visible').each(function() {
					$(this).css("min-height",($(window).height() - this.offsetTop - 60));
				});
				// TODO: add stretchToSceneBottom as well (would be useful in explore template for example)
			}
			
			angular.element(window).bind('resize', $scope.twiddleHeights);
			$rootScope.$on('toolbar.changedSceneTemplate', $scope.twiddleHeights);
			$scope.$watch('scene.isActive', $scope.twiddleHeights);
		}
	};
});
