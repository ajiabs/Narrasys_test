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
	
				},0);
			};
			$scope.$watch(function() {return element.width()}, twiddleSceneLayout);
			$rootScope.$on('toolbar.changedSceneTemplate', twiddleSceneLayout);
			$scope.$watch('scene.isActive', twiddleSceneLayout);

		}
	};
});
