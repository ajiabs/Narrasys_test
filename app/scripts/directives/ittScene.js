'use strict';

// Scene Directive
angular.module('com.inthetelling.player')
.directive('ittScene', function ($filter) {
	return {
		restrict: 'A',
		replace: true,
		template: '<div ng-include="scene.templateUrl">Loading Scene...</div>',
		scope: {
			scene: '=ittScene'
		},
		link: function ($scope, element) {
			console.log("scene: ",element);
			
			// TODO (possibly):  We could avoid having to manually loop through these arrays here by putting this in the item
			// link function instead and having it set classes directly on the item parent()... That would be technically bad practice
			// but more efficient, and probably safe (since the items don't ever change parents)
			
			// but for now I'm trying to be good :)
			
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
		}
	};
});
