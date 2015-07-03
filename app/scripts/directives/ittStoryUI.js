'use strict';

angular.module('com.inthetelling.story')

.directive('ittStoryUi', function ($rootScope, $timeout) {
	return {
		scope: {},
		templateUrl: 'templates/v2/ui/story-ui.html',
		link: function (scope, element) {
			console.log("itt-story-ui", scope, element);

			/* TOOLBAR hide/reveal */
			scope.hideToolbars = function () {
				if (scope.toolbarLocks > 0) {
					return;
				}
				console.log("Hiding toolbar");
				element.addClass('hiddenToolbars');
			};

			scope.showToolbars = function () {
				console.log("Showing toolbar");
				element.removeClass('hiddenToolbars');
				$timeout.cancel(scope.hideToolbarTimer);
				scope.hideToolbarTimer = $timeout(scope.hideToolbars, 3000);
			};

			scope.captureTouchEvent = function () {
				scope.showToolbars();
			};

			scope.lockToolbars = function () {
				console.log("lockToolbars");
				scope.toolbarLocks = (scope.toolbarLocks) ? scope.toolbarLocks + 1 : 1;
				$timeout.cancel(scope.hideToolbarTimer);
			};

			scope.unlockToolbars = function () {
				console.log("unlockToolbars");
				scope.toolbarLocks = (scope.toolbarLocks) ? scope.toolbarLocks - 1 : 0;
				$timeout.cancel(scope.hideToolbarTimer);
				scope.hideToolbarTimer = $timeout(scope.hideToolbars, 3000);
			};

			$rootScope.$on('userKeypress.ESC', function () {
				console.log("stoyUI got ESC");
				scope.hideToolbars();
			});
			$rootScope.$on('userKeypress.SPACE', scope.showToolbars);
			$rootScope.$on('lockToolbars', scope.lockToolbars);
			$rootScope.$on('unlockToolbars', scope.unlockToolbars);
			scope.showToolbars();

			/* END TOOLBAR hide/reveal */

		}
	};
})

.directive('ittTopToolbar', function ($rootScope) {
	return {
		templateUrl: 'templates/v2/ui/toolbar-top.html',
		link: function (scope, element) {
			console.log("itt-top-toolbar", scope, element);

			scope.showPane = function (x, y) {
				// console.log("SHOWPANE ", x, y);
				$rootScope.$emit("showPane", x, y);
			};

		}
	};
})

.directive('ittBottomToolbar', function () {
	return {
		templateUrl: 'templates/v2/ui/toolbar-bottom.html',
		link: function (scope, element) {
			console.log("itt-bottom-toolbar", scope, element);

		}
	};
})

.directive('tabset', function () {
	return {
		restrict: 'E',
		transclude: true,
		scope: true,
		controller: function () {
			var self = this;
			self.tabs = [];
			self.addTab = function (tab) {
				// console.log("Adding tab", tab);
				self.tabs.push(tab);
				if (tab.active || self.tabs.length === 1) {
					self.chooseTab(tab);
				}
			};
			self.chooseTab = function (selectedTab) {
				angular.forEach(self.tabs, function (tab) {
					if (tab.active && tab !== selectedTab) {
						tab.active = false;
					}
				});
				selectedTab.active = true;
				// console.log("Selecting tab", selectedTab);
			};
		},
		controllerAs: 'tabset', // why is this necessary here but not in ittPane? fuck if I know...
		templateUrl: 'templates/v2/ui/tabset.html',
		link: function () {}
	};
})

.directive('tab', function () {
	return {
		restrict: 'E',
		transclude: true,
		template: '<div class="tab" ng-show="active" role="tabpanel" ng-transclude></div>',
		require: '^tabset',
		scope: {
			heading: '@',
			icon: '@',
			active: '@'
		},
		link: function (scope, elem, attr, tabsetController) {
			scope.active = scope.active || false;
			tabsetController.addTab(scope);
		}
	};
})

/* TODO

understand why the controller in tabset doesn't let you attach values to $scope, only to self, and needs controllerAs even though it never tries to use it,
yet the same controller in ittTopPane needs $scope to store values but not controllerAs?!

*/

.directive('ittTopPane', function ($rootScope, $timeout, $interval) {
	return {
		restrict: 'EA',
		transclude: true,
		scope: {
			label: '@', // internal ID used to identify the pane to be launched
			background: '@' // adds background color and decoration
		},
		// controllerAs: 'ittTopPane',  // Why doesn't this one need this?  tabset does...
		controller: function ($scope) {
			var self = this;
			self.registerPane = function (el) {
				console.log("registerPane", el);
				$scope.paneNode = el;
			};
			self.registerPanePointer = function (el) {
				console.log("registerPanePointer", el);
				$scope.pointerNode = el;
			};
		},
		templateUrl: 'templates/v2/ui/top-pane.html',
		link: function (scope) {
			console.log("ittTopPane", scope);
			scope.pane = {
				active: false
			};

			// external trigger to show pane, capture the click event in evt so we have its position:
			$rootScope.$on('showPane', function (emit, label, evt) {
				if (label === scope.label) {
					if (evt) {
						scope.pointerTarget = evt.target;
					}
					scope.showPane();
				}
			});
			$rootScope.$on('userKeypress.ESC', function () {
				scope.hidePane();
				scope.$digest();
			});
			scope.hidePane = function () {
				scope.pane.active = false;
				$rootScope.$emit('unlockToolbars');
				$interval.cancel(scope.repositioner);
			};
			scope.showPane = function () {
				scope.pane.active = true;
				$rootScope.$emit('lockToolbars');
				scope.repositioner = $interval(scope.reposition, 47); // WARN fast loop; slow me down if need be
			};

			scope.reposition = function () {
				if (!scope.pointerTarget || !scope.paneNode) {
					return; // wait until ready
				}

				// NOTE for now only x matters; leaving in stubs for y for later
				var pointAt = {
					x: scope.pointerTarget.offsetLeft + (angular.element(scope.pointerTarget).width() / 2), // center of element width
					// y: scope.pointerTarget.offsetTop + (angular.element(scope.pointerTarget).height()) // bottom of element NOTE will need to subtract the height when pointing from above...
				};
				var paneSize = {
					x: scope.paneNode.width(),
					// y: scope.paneNode.height()
				};
				var windowSize = {
					x: window.innerWidth,
					// y: window.innerHeight
				};

				if (paneSize.x > pointAt.x) {
					// console.log("Positioning pane on left");
					scope.paneNode.css({
						left: 0,
						right: 'auto'
					});
				} else if (paneSize.x > (windowSize.x - pointAt.x)) {
					// console.log("Positioning pane on right");
					scope.paneNode.css({
						left: 'auto',
						right: 0
					});
				} else {
					// console.log("Centering pane");
					scope.paneNode.css({
						'left': Math.floor(pointAt.x - (paneSize.x / 2)) + 'px',
						'right': 'auto'
					});
				}

				var pointerPosition = {
					left: Math.floor(pointAt.x),
					top: Math.floor((scope.paneNode.offset().top - 24))
				};
				if (pointerPosition.left < 50) {
					pointerPosition.left = 50;
				}
				if (pointerPosition.left > windowSize.x - 50) {
					pointerPosition.left = windowSize.x - 50;
				}
				scope.pointerNode.css(pointerPosition);
			};
		}
	};
})

.directive('ittPane', function () {
	return {
		require: '^ittTopPane',
		link: function (scope, element, attr, parentController) {
			parentController.registerPane(element);
		}
	};
})

.directive('ittPanePointer', function () {
	return {
		require: '^ittTopPane',
		link: function (scope, element, attr, parentController) {
			parentController.registerPanePointer(element);
		}
	};
})

;
