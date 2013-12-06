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
			
			console.log("ittContentPane",iAttrs);
			
			// TODO / NOTE   Not sure if attributes is the best way to communicate from one template to another?  Works fine but maybe there's a smarter way
			
			scope.contentLayout = iAttrs.content;
			
			// if this attribute is set to anything truthy it forces the pane to use showCurrent even if the scene isn't
			scope.forceCurrent = iAttrs.forceCurrent;
		},

	};
});
