'use strict';

angular.module('com.inthetelling.player')
.directive('ittContentPane', function ($filter) {
	return {
		restrict: 'A',
		replace: false,
		scope: true,
		templateUrl: 'templates/contentpane.html',
		link: function(scope, element, attrs) {
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

			scope.pane = attrs.pane || "main";

			// which content to include in pane:
			scope.contentLayout = attrs.content || "content";
			scope.itemlist = $filter('layout')(scope.scene.items,scope.contentLayout);

			// Whether to show only current items or all items:
			scope.showCurrent = (scope.scene.showCurrent || attrs.showCurrent);
			
			// Whether to force a particular item template:
			scope.forceItemTemplate = attrs.forceItemTemplate;

			// Sidebars:
			var checkForSidebars = function() {
				console.log("contentpane checkForSidebars");
				if (attrs.noSidebars) {
					scope.noSidebars = true;
					return;
				}
				// scan through the items to see if sidebars are needed in this content pane:
				for (var i=0; i<scope.itemlist.length; i++) {
					var layout = scope.itemlist[i].layout;
					if (layout === "burst") {
						scope.hasLeftSidebar = true;
						scope.hasRightSidebar = true;
					} else if (layout === "sidebarL" || layout === "burstL") {
						scope.hasLeftSidebar = true;
					} else if (layout === "sidebarR" || layout === "burstR") {
						scope.hasRightSidebar = true;
					}
				}
			};
			checkForSidebars();  // This may be redundant, as the $watch seems to fire immediately anyway, but it feels unsafe to leave it out

			// Responsive pane width:
			scope.$watch(function () {
				return element.width();
			}, function (newValue, oldValue) {
				if (newValue > 0 && newValue < 450) {
					scope.noSidebars = true;
					scope.hasLeftSidebar = false;
					scope.hasRightSidebar = false;
				} else {
					checkForSidebars();
				}
			}, true);
		}
	};
});
