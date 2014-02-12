'use strict';

// This never worked the way it was supposed to, involved a bizarre number of events being passed around for a fairly simple action,
// and was killing performance.

// I'm putting it to bed.

angular.module('com.inthetelling.player')
	.directive('ittMagnet', function ($window, $timeout, $rootScope) {
		return {
			restrict: 'A',
			replace: true,
			scope: true,
			link: function (scope, element, attrs, controller) {
/*
				// 'activate' a dom instance of the itt-magnet directive by broadcasting an event from the root scope
				// with a reference to the itt-magnet's dom element. The itt-magnetized directive listens for these events
				// and utilizes the dom element to reposition itself appropriately.
				var activate = function () {
// 					console.log("ittMagnet.activate()", scope);
					// Need timeout because this needs to run after DOM update; so we don't wind up trying to test against a display:none node
					$timeout(function () {
						$rootScope.$emit('magnet.activated', element);
					}, 0);
				};

				if (scope.scene) {
					// call the activate method if the parent scene is active
					var activateIfSceneIsActive = function () {
						if (scope.scene && scope.scene.isActive) {
							activate();
						}
					};

//TODO  This may be redundant, but I'm leaving it in for now
// watch this directive's parent scene and if its state changes to active then activate the video magnet
					scope.$watch('scene.isActive', function (newValue, oldValue) {
						if (newValue && newValue !== oldValue) {
							activate();
						}
					});

					// for triggering video magnets from outside the scene. Only the magnet in the active scene should respond.
					var unsubscribe = $rootScope.$on('toolbar.changedSceneTemplate', activateIfSceneIsActive);
					angular.element($window).bind('resize', activateIfSceneIsActive);

					// cleanup routine on destroy
					scope.$on('$destroy', function () {
						unsubscribe();
						angular.element($window).unbind('resize', activateIfSceneIsActive);
					});
				} else {
					// If the scope isn't a scene, just fire immediately and only once:
//					console.log("Activating magnet which is not in a scene scope:", scope);
					$timeout(activate,0);
					
// 					TODO find a way to make just one magnet active at a time
// 					angular.element($window).bind('resize',function() {
// 						
// 					});
					
				}
*/
			}
		};
	});
