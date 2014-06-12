'use strict';

// Minor jquery dependency (inArray)

angular.module('com.inthetelling.player')
	.directive('ittScene', function($timeout, $filter, modelSvc) {
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

				/*
splitRequired:   
main = transcript+optional   / alt=required-transcript

splitOptional:
main=transcript+required / alt=optional-transcript

splitTransmedia (default):
main=annotation, alt=not annotation
*/

				// some scene templates let you specify this for one or more columns; others do it automatically (that will be in the template)
				if ($.inArray("showCurrent", scope.scene.layouts) > -1) {
					scope.showCurrent = true;
				}

				scope.contentItems = $filter("isContent")(scope.scene.items);
				scope.mainContentItems = function() {
					if ($.inArray("splitRequired", scope.scene.layouts) > -1) {
						return $filter("transcriptandoptional")(scope.contentItems);
					} else if ($.inArray("splitOptional", scope.scene.layouts) > -1) {
						return $filter("transcriptandrequired")(scope.contentItems);
					} else {
						return $filter("annotation")(scope.contentItems);
					}
				};

				scope.altContentItems = function() {
					var ret = scope.contentItems;
					// Inverse of main, but also needs to take into account showList or showCurrent:
					if ($.inArray("showCurrent", scope.scene.layouts) > -1) {
						ret = $filter("isCurrent")(scope.contentItems);
					}
					if ($.inArray("splitRequired", scope.scene.layouts) > -1) {
						ret = $filter("required")(ret);
					} else if ($.inArray("splitOptional", scope.scene.layouts) > -1) {
						ret = $filter("optional")(ret);
					} else {
						ret = $filter("transmedia")(ret);
					}
					return ret;
				};

				// (also add pane classes to control sidebars/margins, and for showTimeline?


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
