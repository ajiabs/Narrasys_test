'use strict';

// Scene Directive
angular.module('com.inthetelling.player')
.directive('ittScene', function ($filter, $rootScope, $timeout) {
	return {
		restrict: 'A',
		replace: false,
		template: '<div ng-include="scene.templateUrl">Loading Scene...</div>',
		scope: {
			scene: '=ittScene'
		},
		link: function ($scope, element) {
			// console.log("scene: ", $scope);
			
			// TODO: move this into modelFactory, just so we have all the precalc stuff in the same place?
			// For each possible content pane, we're going to set variables for whether extra left or right margin will be needed
			// there are three possible panes in a given scene (panes) which will be identified in the template by scene.sidebars.(paneNames[x])
			$scope.scene.sidebars = {};
			var panes = [$scope.scene.mainPaneContents, $scope.scene.altPaneContents];
			var paneNames = ["mainPane","altPane"];
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


			// Make cosmetic adjustments within the scene based on viewport or video size.
			// TODO: don't use jQuery here if possible?
			// TODO: (probably overoptimizing): have this function return immediately if the scene is not visible. (How do we check that without using jQuery?)
			//       (can't use isActive, as sometimes inactive scenes are still visible)
			var twiddleSceneLayout = function() {
				$timeout(function() { // wait for any DOM updates first
					console.log("twiddleSceneLayout");
					element.find('.matchVideoHeight:visible').height(element.find('.videoContainer').height()); // TODO check if this works with multiple .matchVideoHeight elements in the scene
					element.find('.stretchToViewportBottom:visible').each(function() {
						$(this).css("min-height",($(window).height() - this.offsetTop - 60));
					});
					// TODO: add support for .stretchToSceneBottom as well (would be useful in explore template for example)
	
					// check each content pane and control whether it should allow or disallow sidebars (after DOM updates).  Breakpoint is currently 450px
					// TODO (someday maybe): for some medium range of sizes, allow margin bursts but not full sidebars
					// TODO: move this to contenPane directive
					var paneNames = ["mainPane","altPane"];
					var paneClassNames = [".contentMain:visible",".contentAlt:visible"];
					for (var i=0; i<paneNames.length; i++) {
						var pane = element.find(paneClassNames[i]);
						if (pane.width() && pane.width() < 450) {
							$scope.scene.sidebars[paneNames[i]+"None"] = true;
						} else {
							$scope.scene.sidebars[paneNames[i]+"None"] = false;
						}
					}
				},0);
			};
			
			angular.element(window).bind('resize', twiddleSceneLayout);
			$rootScope.$on('toolbar.changedSceneTemplate', twiddleSceneLayout);
			$scope.$watch('scene.isActive', twiddleSceneLayout);
			twiddleSceneLayout(); // only needed for first scene draw
		}
	};
});
