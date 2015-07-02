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

			$rootScope.$on('userKeypress.ESC', scope.hideToolbars);
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
				console.log("SHOWPANE ", x, y);
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
				console.log("Adding tab", tab);
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
				console.log("Selecting tab", selectedTab);
			};
		},
		controllerAs: 'tabset',
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

.directive('ittTopPane', function ($rootScope) {
	return {
		restrict: 'EA',
		transclude: true,
		scope: {
			label: '@'
		},
		templateUrl: 'templates/v2/ui/top-pane.html',
		link: function (scope, element) {
			console.log("ittTopPane", scope);

			scope.pane = {
				active: false
			};

			$rootScope.$on('showPane', function (emit, label, evt) {
				if (label === scope.label) {
					scope.pointer = {
						x: evt.clientX,
						y: evt.clientY
					};

					console.log(element.width(), angular.element(window).width());

					scope.showPane();
				}
				$rootScope.$on('userKeypress.ESC', scope.hidePane);
			});

			scope.hidePane = function () {
				console.log("ATTEMPTING TO HIDE PANE");
				scope.pane.active = false;
				$rootScope.$emit('unlockToolbars');
			};
			scope.showPane = function () {
				console.log("SCOPING PANE");
				scope.pane.active = true;
				element.removeClass('hidden');
				$rootScope.$emit('lockToolbars');
			};

		}
	};
});
