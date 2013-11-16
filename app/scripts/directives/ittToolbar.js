'use strict';

angular.module('com.inthetelling.player')
.directive('ittToolbar', function () {
	return {
		restrict: 'A',
		replace: true,
		scope: true,
		templateUrl: 'templates/toolbar/toolbar.html',
		link: function(scope, iElement, iAttrs, controller) {
			// scope is a child scope that inherits from EpisodeController scope
			// thus anything that is added to this scope here is private to the directive,
			// but everything on parent scope is still accessible.
		},
		/* TODO: Abstract this into an explicit controller class rather than inline? */
		controller: function($scope, $timeout, $rootScope) {
			
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
		//				thisScene.origLayout = thisScene.layout;
						}
						thisScene.templateUrl = "templates/scene-"+newTemplate+".html"; // hardcoded for now
		//			newTemplate === "video" 
		//				? thisScene.layout = "layoutVideo"
		//				: thisScene.layout = "layoutExplore"
		//			;
					} else {
						if (thisScene.origTemplateUrl) { // if this is undefined, we've never left directed view so don't need to do anything here
							thisScene.templateUrl = thisScene.origTemplateUrl;
		// 					thisScene.layout = thisScene.origLayout;
						}
					}
				}
				
				// Need timeout because videoMagnet needs to run after DOM update; so don't wind up trying to test against a display:none node
				$timeout(function() {
					$rootScope.$broadcast('triggerCurrentlyActiveVideoMagnet');
				}, 0);

			};
			
			/* detect which view we're in */
			/* this is a bizarre syntax but seems to be how it's supposed to work... */
			$scope.currentSceneTemplateIs = function(compare) {
				return $scope.currentSceneTemplate === compare;
			};
			
		}
	};
});
