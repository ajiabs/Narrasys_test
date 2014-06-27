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

				// Precalculate each fg, bg, and content pane on scene creation for performance.  
				// NOTE this means producer will need to redraw the scene if
				// edits to a content item would move it to a different pane; it's not calculated on the fly anymore:

				scope.contentItems = $filter("isContent")(scope.scene.items);
				scope.mainFgItems = $filter("itemLayout")(scope.scene.items, "mainFg");
				scope.mainBgItems = $filter("itemLayout")(scope.scene.items, "mainBg");
				scope.altFgItems = $filter("itemLayout")(scope.scene.items, "altFg");
				scope.altBgItems = $filter("itemLayout")(scope.scene.items, "altBg");


				// Main content pane:
				if ($.inArray("splitRequired", scope.scene.layouts) > -1) {
					scope.mainContentItems = $filter("transcriptandoptional")(scope.contentItems);
				} else if ($.inArray("splitOptional", scope.scene.layouts) > -1) {
					scope.mainContentItems = $filter("transcriptandrequired")(scope.contentItems);
				} else {
					scope.mainContentItems = $filter("annotation")(scope.contentItems);
				}

				// alt content pane is inverse of main:
				if ($.inArray("splitRequired", scope.scene.layouts) > -1) {
					scope.altContentItems = $filter("required")(scope.contentItems);
				} else if ($.inArray("splitOptional", scope.scene.layouts) > -1) {
					scope.altContentItems = $filter("optional")(scope.contentItems);
				} else {
					scope.altContentItems = $filter("transmedia")(scope.contentItems);
				}


				// (TODO: add pane classes to control sidebars/margins, and for showTimeline


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
