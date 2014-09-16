'use strict';

//TODO Some of this could be split into separate controllers (though that may not confer any advantage other than keeping this file small...)

angular.module('com.inthetelling.story')
	.controller('PlayerController', function ($scope, $location, $rootScope, $routeParams, $timeout, $interval, appState, dataSvc, modelSvc, timelineSvc, analyticsSvc, errorSvc) {
		// console.log("playerController", $scope);

		$scope.viewMode = function (newMode) {
			appState.viewMode = newMode;
			analyticsSvc.captureEpisodeActivity("modeChange", {
				"mode": newMode
			});

			//Autoscroll only in explore mode for now
			if (newMode === 'review') {
				// console.log("enable autoscroll");
				appState.autoscroll = true;
				appState.autoscrollBlocked = false;
				$timeout(startScrollWatcher); // timeout is for edge case where user loads review mode first, before handleAutoscroll is defined below...
			} else {
				// console.log("disable autoscroll");
				appState.autoscroll = false;
			}
			$timeout(function () {
				$(window).trigger('resize'); // possible fix for unreproducible-by-me layout issue in review mode
			});
		};

		if ($routeParams.viewMode) {
			$timeout(function () {
				$scope.viewMode($routeParams.viewMode);
			});
		}

		if ($routeParams.t) {
			timelineSvc.seek($routeParams.t, "URLParameter");
		}

		// if ($routeParams.producer) {
		// 	appState.producer = true;
		// }

		/* LOAD EPISODE - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

		// console.log("playerController init");
		appState.init();
		errorSvc.init();
		appState.episodeId = $routeParams.epId;
		modelSvc.addLandingScreen(appState.episodeId);
		dataSvc.getEpisode(appState.episodeId);

		// Watch for the first load of the episode data; init the master asset and page title when found
		var episodeWatcher = $scope.$watch(function () {
			return modelSvc.episodes[appState.episodeId].title;
		}, function (a) {
			if (a) {
				document.title = "STORY: " + a;
				episodeWatcher(); // stop watching;
			}
		});

		// Watch for the first load of the episode items; update the timeline when found
		$scope.loading = true;
		var eventsWatcher = $scope.$watch(function () {
			return modelSvc.episodes[appState.episodeId].items;
		}, function (a) {
			if (a) {
				modelSvc.addEndingScreen(appState.episodeId);
				timelineSvc.init(appState.episodeId);
				$scope.loading = false;
				eventsWatcher(); // stop watching
			}
		});

		$scope.episode = modelSvc.episode(appState.episodeId);
		$scope.appState = appState;
		$scope.show = appState.show; // yes, slightly redundant, but makes templates a bit easier to read
		$scope.now = new Date();
		$scope.currentdate = new Date();
		/* END LOAD EPISODE - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

		/* BEGIN TOOLBAR HIDE/REVEAL- - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
		// TODO put this in own controller

		// Bottom toolbar starts out hidden.  5s after using a control or leaving the pane, fade out controls.
		//   If mouse re-enters pane, keep the controls visible. 

		appState.videoControlsActive = false;
		var keepControls;
		var controlTimer;

		var videoControlsWatcher = $scope.$watch(function () {
			return appState.videoControlsActive;
		}, function (isActive) {
			if (isActive) {
				controlTimer = $timeout(function () {
					if (!keepControls) {
						appState.videoControlsActive = false;
					}
				}, 5000);
			}
		});

		$scope.showControls = function () {
			// console.log("showControls");
			$timeout.cancel(controlTimer);
			appState.videoControlsActive = true;
			if (appState.isTouchDevice) {
				$scope.allowControlsExit(); // otherwise it sticks permanently on touchscreens. TODO find a better way
			}
		};

		$scope.keepControls = function () {
			// console.log("keepControls");
			keepControls = true;
		};

		$scope.allowControlsExit = function () {
			// console.log("allowControlsExit");
			keepControls = false;
			$timeout.cancel(controlTimer);
			controlTimer = $timeout(function () {
				if (!appState.show.navPanel) {
					appState.videoControlsActive = false;
				}
			}, 5000);
		};

		/* END TOOLBAR HIDE/REVEAL- - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

		// Misc toolbars too small to rate their own controllers
		$scope.toggleSearchPanel = function () {
			appState.show.searchPanel = !appState.show.searchPanel;
		};
		$scope.toggleNavPanel = function () {
			// console.log("toggleNavPanel");
			timelineSvc.pause();
			appState.show.navPanel = !appState.show.navPanel;
		};

		$scope.seek = function (t) {
			$scope.enableAutoscroll();
			timelineSvc.seek(t, "sceneMenu");
			appState.show.navPanel = false;
		};

		$scope.pause = function () {
			timelineSvc.pause();
		};

		// show the help pane, only if localStorage is settable and there isn't one already.
		// (If localStorage is blocked, default to not showing the overlay to avoid annoying them with repeats.)

		var localStorageAllowed = true;
		try {
			localStorage.setItem("iCanHazStorage", 1);
		} catch (e) {
			localStorageAllowed = false;
		}
		if (localStorageAllowed) {
			localStorage.removeItem("iCanHazStorage");
		}

		// Intercepts the first play of the video and decides whether to show the help panel beforehand:
		$rootScope.$on("video.firstPlay", function () {
			if (localStorageAllowed && !(localStorage.getItem("noMoreHelp"))) {
				appState.show.helpPanel = true;
			} else {
				timelineSvc.play();
			}
		});

		$scope.hidePanels = function () {
			appState.show.helpPanel = false;
			appState.show.navPanel = false;
			appState.show.searchPanel = false;
		};

		$scope.noMoreHelp = function () {
			appState.show.helpPanel = false;
			localStorage.setItem("noMoreHelp", "1");
			timelineSvc.play();
		};

		$scope.play = function () {
			timelineSvc.play();
		};

		// - - - - - - - - -  - - - - - - - - - - - - - - -
		// Autoscroll
		// Some jQuery dependencies here (namespaced bindings, animated scroll)

		// appState.autoscroll = we are in a mode which wants autoscroll
		// appState.autoscrollBlocked = user has disabled autoscroll (by scrolling manually)
		// appState.autoscrollTarget = position to which autoscroll wants to aim
		// (Those are in appState instead of $scope becuase in future we'll want scenes to be able to autoscroll too)

		// isn't it weird how we read the scrollTop from (window), but have to animate it on (body,html)?

		// NOTE: When we had the #CONTAINER position:fixed hack for fullscreen safari, this needed to be configurable to point to
		// #CONTAINER instead of window.  Have removed that, but leaving this here in case we bring it back:
		var autoscrollableNode = $(window);
		var animatableScrollNode = $('html,body');
		var autoscrollTimer;

		var startScrollWatcher = function () {
			// console.log("startScrollWatcher");
			autoscrollTimer = $interval(handleAutoscroll, 400);
			autoscrollableNode.bind("scroll", function () {
				// User-initiated scrolling should block autoscroll.
				// console.log("user scrolled");
				animatableScrollNode.stop();
				appState.autoscrollBlocked = true;
				stopScrollWatcher();
			});
		};

		var stopScrollWatcher = function () {
			// console.log("stopScrollWatcher");
			autoscrollableNode.unbind("scroll");
			$interval.cancel(autoscrollTimer);
		};

		$scope.enableAutoscroll = function () {
			// console.log("Enabling autoscroll");
			if (appState.autoscrollBlocked) {
				appState.autoscrollBlocked = false;
				startScrollWatcher();
			}
		};

		var handleAutoscroll = function () {
			// console.log("handleAutoscroll");
			// if autoscroll is allowed and not blocked by user activity,
			// find the topmost visible current item and scroll to put it in the viewport.
			// WARNING this may break if item is inside scrollable elements other than #CONTAINER
			if (appState.autoscrollBlocked || !appState.autoscroll) {
				return;
			}

			if ($scope.autoscrollTarget) {
				// console.log("handleAutoscroll triggering a scroll");
				stopScrollWatcher();
				animatableScrollNode.animate({
					"scrollTop": $scope.autoscrollTarget
				}, 1500);
				// Don't use jQuery's animation callback; this would get called twice because animatableScrollNode is two nodes...
				$timeout(function () {
					startScrollWatcher();
				}, 1750); // allow extra time; iPad was still capturing the tail end of the animated scroll
			}
		};

		var findAutoscrollTarget = function () {
			if (!appState.autoscroll) {
				return;
			}
			// returns the scroll position of the topmost current item, if there is one, and it is not already in view.
			var top = Infinity;
			$scope.curScroll = autoscrollableNode.scrollTop();

			angular.forEach($('.content .item.isCurrent:visible'), function (item) {
				var t = item.getBoundingClientRect().top + $scope.curScroll;
				if (t < top) {
					top = t;
				}
			});

			if (top === Infinity) {
				// no current item found
				$scope.autoscrollTarget = false;
				return;
			}

			var slop = $(window).height() / 5;
			if (top > $scope.curScroll + slop && top < ($scope.curScroll + slop + slop + slop + slop)) {
				// topmost item is already inside the viewport
				$scope.autoscrollTarget = false;
				return;
			}

			if (top < slop && $scope.curScroll < slop) {
				// too close to top of window to bother
				$scope.autoscrollTarget = false;
				return;
			}

			$scope.autoscrollTarget = top - slop;
		};

		// keep this updated as the user scrolls the window
		var autoscrollTargetTimer = $interval(findAutoscrollTarget, 403);

		startScrollWatcher();

		// - - - - - - - - -  - - - - - - - - - - - - - - -

		$rootScope.$on("userKeypress.ESC", function () {
			// dismiss ALL THE THINGS
			appState.show.searchPanel = false;
			appState.show.helpPanel = false;
			appState.show.navPanel = false;
			appState.itemDetail = false;
		});

		$scope.$on('$destroy', function () {
			console.log("destroying playerController");
			videoControlsWatcher();
			stopScrollWatcher();
			$interval.cancel(autoscrollTargetTimer);
		});

		// TEMPORARY: Producer code below this line
		// If this turns out to be any good move it into a producer directive.
		// will likely want other components to be able to read which layer we're editing -- timeline, at least
		// $scope.editLayer = function(layer) {
		// 	console.log("TODO: whichever of fgLayer, contentLayer, and bgLayer this isn't: ", layer);
		// 	$scope.editLayer.scene = false;
		// 	$scope.editLayer.bgLayer = false;
		// 	$scope.editLayer.contentLayer = false;
		// 	$scope.editLayer.fgLayer = false;
		// 	if (layer !== '') {
		// 		$scope.editLayer[layer] = true;
		// 	}
		// };

	});
