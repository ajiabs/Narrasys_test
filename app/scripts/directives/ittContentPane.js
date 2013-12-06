'use strict';

angular.module('com.inthetelling.player')
.directive('ittContentPane', function () {
	return {
		restrict: 'A',
		replace: false,
		scope: true,
		templateUrl: 'templates/contentpane.html',
		link: function(scope, iElement, iAttrs) {
			// scope is a child scope that inherits from EpisodeController scope
			// thus anything that is added to this scope here is private to the directive,
			// but everything on parent scope is still accessible.
			
			// TODO / NOTE   Not sure if attributes is the best way to communicate from the template to the directive?  Works fine but maybe there's a smarter way
			/* Recognized attributes (all optional):
					- data-pane ("main" or "alt", defaults to "main")
					- data-no-sidebars (bool)
					- data-show-current (bool)
					- data-content (any value recognized by the "layout" filter). Defaults to "content". TODO: would it be better to remove the layout filter and instead filter the items here inside the directive?
					- data-force-item-template (See item directive; this just passes it through)
			*/

			// which content to include in pane:
			scope.contentLayout = iAttrs.content || "content";

			// Whether to show only current items or all items:
			scope.showCurrent = (scope.scene.showCurrent || iAttrs.showCurrent);
			
			// Whether to force a particular item template:
			scope.forceItemTemplate = iAttrs.forceItemTemplate;

			// Sidebars:
			scope.pane = iAttrs.pane || "main";
			if (iAttrs.noSidebars) {
				// scene template specifically requests no sidebar
				scope.noSidebars = true;
			} else {
				// Sidebars appear if scene directive requests them for this pane. (TODO move that functionality here instead)
				scope.noSidebars = (scope.pane === "main") ? scope.scene.sidebars.mainPaneNone 
				                                           : scope.scene.sidebars.altPaneNone;
				if (!scope.noSidebars) {
					scope.hasLeftSidebar = (scope.pane === "main") ? scope.scene.sidebars.mainPaneLeft
					                                               : scope.scene.sidebars.altPaneLeft;
					scope.hasRightSidebar = (scope.pane === "main") ? scope.scene.sidebars.mainPaneRight 
					                                                : scope.scene.sidebars.altPaneRight;
				}
			}

		}

	};
});

