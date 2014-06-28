'use strict';

// Minor jquery dependency ($.inArray)

angular.module('com.inthetelling.player')
	.directive('ittScene', function($timeout, modelSvc) {
		return {
			restrict: 'A',
			replace: false,
			scope: {
				scene: '=ittScene',
				episode: '=episode'
			},
			template: '<span ng-include="scene.templateUrl">Loading Item...</span>',
			controller: 'SceneController',
			link: function(scope, element, attrs) {
				console.log('ittScene', scope, element, attrs);

				// apply isContent, then splitTransmedia or splitRequired to scene.items
				// PERFORMANCE TODO: maybe handle mainContentItems() and altContentItems() in modelSvc.resolveEpisodeEvents instead?
				// Items have much more of a performance hit than scenes, though; there's only ever one scene active at a time.


				scope.precalculateSceneValues();


				var twiddleScene = function() {
					element.find('.matchVideoHeight:visible').each(function() {
						$(this).css("height", element.find('.videoMagnet img').height());
					});
					element.find('.stretchToViewport:visible').each(function() {
						$(this).css("min-height", (angular.element(window).height() - $(this).offset().top));
					});
				};
				$timeout(twiddleScene);
				scope.unwatch = scope.$watch(function() {
					return {
						winWidth: modelSvc.appState.windowWidth,
						winHeight: modelSvc.appState.windowHeight
					};
				}, twiddleScene, true);

				// cleanup watchers on destroy
				scope.$on('$destroy', function() {
					scope.unwatch();
				});


			},

		};
	});
