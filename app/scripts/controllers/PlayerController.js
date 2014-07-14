'use strict';

//TODO Some of this could be split into separate controllers (though that may not confer any advantage other than keeping this file small...)

angular.module('com.inthetelling.player')
	.controller('PlayerController', function($scope, $rootScope, $routeParams, $timeout, $interval, appState, dataSvc, modelSvc, timelineSvc, analyticsSvc) {
		// console.log("playerController", $scope);

		$scope.viewMode = function(newMode) {
			appState.viewMode = newMode;
			analyticsSvc.captureEpisodeActivity("modeChange", {
				"mode": newMode
			});

			//Autoscroll only in explore mode for now
			if (newMode === 'review') {
				// console.log("unblocking autoscroll");
				appState.autoscroll = true;
				appState.autoscrollBlocked = false;
				$timeout(handleAutoscroll); // timeout is for edge case where user loads review mode first, before handleAutoscroll is defined below...
			} else {
				appState.autoscroll = false;
			}
		};

		if ($routeParams.viewMode) {
			$scope.viewMode($routeParams.viewMode);
		}

		if ($routeParams.t) {
			timelineSvc.seek($routeParams.t, "URLParameter");
		}

		// if ($routeParams.producer) {
		// 	appState.producer = true;
		// }


		/* LOAD EPISODE - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

		appState.episodeId = $routeParams.epId;
		modelSvc.addLandingScreen(appState.episodeId);
		dataSvc.getEpisode(appState.episodeId);

		// Watch for the first load of the episode data; init the master asset and page title when found
		var episodeWatcher = $scope.$watch(function() {
			return modelSvc.episodes[appState.episodeId].title;
		}, function(a, b) {
			if (a !== b) {
				document.title = "STORY: " + a;
				episodeWatcher(); // stop watching;
			}
		});

		// Watch for the first load of the episode items; update the timeline when found
		$scope.loading = true;
		var eventsWatcher = $scope.$watch(function() {
			return modelSvc.episodes[appState.episodeId].items;
		}, function(a, b) {
			if (a) {
				timelineSvc.init(appState.episodeId);
				$scope.loading = false;
				eventsWatcher(); // stop watching
			}
		});

		$scope.episode = modelSvc.episode(appState.episodeId);
		$scope.appState = appState;
		$scope.show = appState.show; // yes, slightly redundant, but makes templates a bit easier to read
		$scope.now = new Date();

		/* END LOAD EPISODE - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

		// TODO put this in own controller (or service?)

		// Bottom toolbar starts out hidden.  5s after using a control or leaving the pane, fade out controls.
		//   If mouse re-enters pane, keep the controls visible. 
		// TODO: fade toolbars when tap outside, or when hit esc key
		// TODO: never fades on touchscreen... fix that

		appState.videoControlsActive = false;
		var keepControls;
		var controlTimer;

		$scope.$watch(function() {
			return appState.videoControlsActive;
		}, function(isActive, wasActive) {
			if (isActive) {
				controlTimer = $timeout(function() {
					if (!keepControls) {
						appState.videoControlsActive = false;
					}
				}, 5000);
			}
		});

		$scope.showControls = function() {
			// console.log("showControls");
			$timeout.cancel(controlTimer);
			appState.videoControlsActive = true;
			if (appState.isTouchDevice) {
				$scope.allowControlsExit(); // otherwise it sticks permanently on touchscreens. TODO find a better way
			}
		};

		$scope.keepControls = function() {
			// console.log("keepControls");
			keepControls = true;
		};

		$scope.allowControlsExit = function() {
			// console.log("allowControlsExit");
			keepControls = false;
			$timeout.cancel(controlTimer);
			controlTimer = $timeout(function() {
				if (!appState.show.navPanel) {
					appState.videoControlsActive = false;
				}
			}, 5000);
		};

		// - - - - - - - - -  - - - - - - - - - - - - - - -


		// Misc toolbars too small to rate their own controllers
		$scope.toggleSearchPanel = function() {
			appState.show.searchPanel = !appState.show.searchPanel;
		};
		$scope.toggleNavPanel = function() {
			// console.log("toggleNavPanel");
			timelineSvc.pause();
			appState.show.navPanel = !appState.show.navPanel;
		};
		$scope.seek = function(t) {
			timelineSvc.seek(t, "sceneMenu");
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
		$rootScope.$on("video.firstPlay", function() {
			if (localStorageAllowed && !(localStorage.getItem("noMoreHelp"))) {
				appState.show.helpPanel = true;
			} else {
				timelineSvc.play();
			}
		});


		$scope.hidePanels = function() {
			appState.show.helpPanel = false;
			appState.show.navPanel = false;
			appState.show.searchPanel = false;
		};

		$scope.noMoreHelp = function() {
			appState.show.helpPanel = false;
			localStorage.setItem("noMoreHelp", "1");
			timelineSvc.play();
		};

		// - - - - - - - - -  - - - - - - - - - - - - - - -
		// Autoscroll
		// Some jQuery dependencies here (namespaced bindings, animated scroll)

		// appstate.autoscroll = we are in a mode which wants autoscroll
		// appstate.autoscrollBlocked = user has disabled autoscroll (by scrolling manually)
		// (Those are in modelSvc instead of $scope becuase in future we'll want scenes to be able to autoscroll too)

		// isn't it weird how we read the scrollTop from (window), but have to animate it on (body,html)?

		// NOTE: When we had the #CONTAINER position:fixed hack for fullscreen safari, this needed to be configurable to point to
		// #CONTAINER instead of window.  Have removed that, but leaving this here in case we bring it back:
		var autoscrollableNode = $(window);
		var animatableScrollNode = $('html,body');

		var startScrollWatcher = function() {
			// console.log("startScrollWatcher");
			autoscrollTimer = $interval(handleAutoscroll, 400);
			autoscrollableNode.bind("scroll", function() {
				// User-initiated scrolling should block autoscroll.
				// console.log("user scrolled");
				animatableScrollNode.stop();
				stopScrollWatcher();
				appState.autoscrollBlocked = true;
			});
			// handleAutoscroll();
		};
		var autoscrollTimer;

		var stopScrollWatcher = function() {
			// console.log("stopScrollWatcher");
			autoscrollableNode.unbind("scroll");
			$interval.cancel(autoscrollTimer);

		};

		$scope.enableAutoscroll = function() {
			// console.log("Enabling autoscroll");
			if (appState.autoscrollBlocked) {
				appState.autoscrollBlocked = false;
				startScrollWatcher();
			}
		};

		// TODO this is a relatively expensive $watch.  Could greatly increase its $interval if we
		// support directly triggering it from timeline on seek()... 
		var handleAutoscroll = function() {
			// if autoscroll is true and autoscrollBlocked is false,
			// find the topmost visible current item and scroll to put it in the viewport.
			// WARNING this may break if item is inside scrollable elements other than #CONTAINER
			if (appState.autoscrollBlocked || !appState.autoscroll) {
				return;
			}

			// find topmost visible current items:
			var top = Infinity;
			var curScroll = autoscrollableNode.scrollTop();
			angular.forEach($('.content .item.isCurrent:visible'), function(item) {
				var t = item.getBoundingClientRect().top + curScroll;
				if (t < top) {
					top = t;
				}
			});
			if (top === Infinity) {
				return;
			}

			// There's a visible current item; is it within the viewport?
			var slop = $(window).height() / 5;
			if (top > curScroll + slop && top < (curScroll + slop + slop + slop)) {
				return;
			}

			if (top < slop && curScroll < slop) {
				return; // too close to top of window to bother
			}

			// Okay, we got past all those returns; it must be time to scroll
			// console.log("handleAutoscroll triggering a scroll");
			stopScrollWatcher();
			animatableScrollNode.animate({
				"scrollTop": top - slop
			}, 1500);

			// Don't use jQuery's animation callback; this would get called twice because animatableScrollNode is two nodes...
			$timeout(function() {
				startScrollWatcher();
			}, 1750); // allow extra time; iPad was still capturing the tail end of the animated scroll

		};

		startScrollWatcher();


		// - - - - - - - - -  - - - - - - - - - - - - - - -

		$rootScope.$on("userKeypress.ESC", function() {
			// dismiss ALL THE THINGS
			appState.show.searchPanel = false;
			appState.show.helpPanel = false;
			appState.show.navPanel = false;
			appState.itemDetail = false;
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
