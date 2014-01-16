'use strict';

angular.module('com.inthetelling.player')
	.directive('ittToolbar', function () {
		return {
			restrict: 'A',
			replace: true,
			scope: true,
			templateUrl: 'templates/toolbar/toolbar.html',
			link: function (scope, iElement, iAttrs, controller) {
				// scope is a child scope that inherits from EpisodeController scope
				// thus anything that is added to this scope here is private to the directive,
				// but everything on parent scope is still accessible.
			},
			controller: "ToolbarController"
		};
	});
