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

.directive('ittTopPane', function ($rootScope, $timeout) {
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
					// TODO watch evt.currentTarget.offsetLeft and update position
					if (evt) {
						$timeout(function () {
							scope.reposition({
								x: evt.clientX,
								y: evt.clientY
							});
						});
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
			};
			scope.showPane = function () {
				console.log("SCOPING PANE");
				scope.pane.active = true;
				$rootScope.$emit('lockToolbars');
			};

			scope.reposition = function (pointer) {
				// For now, this is for top panels only. TODO extend to bottom as well?

				// oh FFS no I am not going to  create separate pane directives and a controller just to get access to a couple of goddamn dom nodes
				scope.paneNode = element.find('.pane'); // JQUERY DEPENDENCY
				scope.pointerNode = element.find('.pointer');
				console.log("REPOSITIONING: ", element, scope.paneNode);

				if (pointer && scope.paneNode && scope.paneNode.width() > 0) {
					var paneWidth = scope.paneNode.width();
					if (paneWidth > pointer.x) {
						console.log("Positioning pane on left");
						scope.paneNode.css({
							left: 0,
							right: 'auto'
						});
					} else if (paneWidth > (window.innerWidth - pointer.x)) {
						console.log("Positioning pane on right");
						scope.paneNode.css({
							left: 'auto',
							right: 0
						});
					} else {
						console.log("Centering pane");
						scope.paneNode.css({
							'left': (pointer.x - (paneWidth / 2)) + 'px',
							'right': 'auto'
						});
					}

					console.log("TTTTT", scope.paneNode, scope.paneNode.offsetTop);
					var pointerPos = {
						left: pointer.x,
						top: (scope.paneNode.offset().top - 24)
					};
					if (pointerPos.left < 50) {
						pointerPos.left = 50;
					}
					if (pointerPos.left > window.innerWidth - 50) {
						pointerPos.left = window.innerWidth - 50;
					}

					scope.pointerNode.css(pointerPos);

				}

			};

		}
	};
})

;
