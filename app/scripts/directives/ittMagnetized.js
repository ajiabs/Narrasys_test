'use strict';

// TODO: remove dependence on jQuery? (lots of it here)

angular.module('com.inthetelling.player')
	.directive('ittMagnetized', function($rootScope, $timeout, appState) {
		return {
			restrict: 'A',
			replace: true,
			scope: true,
			link: function(scope, element) {
				var aspectRatio = 16 / 9;

				var watchMagnet = function(magnet) {
					// console.log("Changing magnet to ", magnet);
					if (scope.unwatch) {
						scope.unwatch();
					}
					scope.magnet = $(magnet);

					// Magnetized needs to respond when the magnet moves or the window resizes.
					// Can't bind to window size directly (iOS crashes in iframe); we track it in $rootScope instead
					scope.unwatch = scope.$watch(function() {
						return {
							top: scope.magnet.offset().top - element.offset().top,
							left: scope.magnet.offset().left - element.offset().left,
							width: scope.magnet.width() - element.width(),
							winWidth: appState.windowWidth,
							winHeight: appState.windowHeight
						};
					}, moveToMagnet, true);
				};

				var moveToMagnet = function() {
					$timeout(function() { // needs the timeout, otherwise endless digest loop
						element.css("position", (scope.magnet.css("position") === "fixed") ? "fixed" : "absolute");

						var diffT = scope.magnet.offset().top - element.offset().top;
						var diffL = scope.magnet.offset().left - element.offset().left;
						var diffW = scope.magnet.width() - element.width();

						if (Math.abs(diffT) > 1 || Math.abs(diffL) > 1) {
							element.offset({
								top: element.offset().top + (diffT / 4),
								left: element.offset().left + (diffL / 4)
							});
						} else {
							element.offset(scope.magnet.offset());
						}

						if (Math.abs(diffW) > 4) {
							element.width(element.width() + (diffW / 4));
						} else {
							element.width(scope.magnet.width());
						}
						element.height(scope.magnet.width() / aspectRatio);

						
					});
				};

				$rootScope.$on('magnet.changeMagnet', function(evt, magnet) {
					watchMagnet(magnet);
				});


				// cleanup watchers on destroy
				scope.$on('$destroy', function() {
					scope.unwatch();
				});
			}
		};
	});
