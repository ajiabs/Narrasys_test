'use strict';

//TODO Some of this could be split into separate controllers (though that may not confer any advantage other than keeping this file small...)

angular.module('com.inthetelling.story')
	.controller('PlayerController', function ($scope, $location, $rootScope, $routeParams, $timeout, $interval, appState, dataSvc, modelSvc, timelineSvc, analyticsSvc, errorSvc, authSvc) {
		// console.log("playerController", $scope);

		// $scope.tmp = function () {
		// 	dataSvc.POST('/v1/templates/', {
		// 		"url": "templates/scene/pip.html",
		// 		"name": "Picture In Picture",
		// 		"event_types": ["Scene"],
		// 		"applies_to_episodes": false
		// 	});
		// };

		$scope.viewMode = function (newMode) {
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

		/* LOAD EPISODE - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

		// console.log("playerController init");
		appState.init();
		errorSvc.init();
		appState.episodeId = $routeParams.epId;
		modelSvc.addLandingScreen(appState.episodeId);
		dataSvc.getEpisode(appState.episodeId);

		// Watch for the first load of the episode data; init page title and crossnav when found

		// TODO: update this on language change
		var episodeWatcher = $scope.$watch(function () {
			return modelSvc.episodes[appState.episodeId].display_title;
		}, function (a) {
			if (a) {
				document.title = "STORY: " + a;
				initCrossnav();
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

		/* BEGIN CROSS-EPISODE NAVIGATION */
		/* This probably belongs in modelSvc. sigh */

		var initCrossnav = function () {
			if ($scope.episode.navigation_depth > 0) {
				$scope.episode.parents = [];
				// add 1 to the depth, because we're going to skip the episode container later
				getParent($scope.episode.navigation_depth + 1, $scope.episode.container_id);
			}

		};
		var getParent = function (depth, container_id) {
			if (modelSvc.containers[container_id]) {
				setParent(depth, container_id);
			} else {
				var parentWatcher = $scope.$watch(function () {
					return modelSvc.containers[container_id];
				}, function (a) {
					if (a) {
						parentWatcher(); // stop watching
						setParent(depth, container_id);
					}
				});
			}
		};

		var setParent = function (depth, container_id) {
			if (depth <= $scope.episode.navigation_depth) { // skip the episode container
				$scope.episode.parents[depth - 1] = modelSvc.containers[container_id];
			}

			if (depth === $scope.episode.navigation_depth) {
				// as long as we're here, get the next and previous episodes (only within the session.
				// This won't let us find e.g. the previous episode from S4E1; 
				// we're not guaranteed to have loaded data for other sessions...  TODO fancy tree traversal)
				console.log("Siblings will be here: ", modelSvc.containers[container_id]);
				$scope.crossEpisodePath = appState.crossEpisodePath;
				for (var i = 0; i < modelSvc.containers[container_id].children.length; i++) {
					var c = modelSvc.containers[container_id].children[i];
					if (c.episodes[0] === appState.episodeId) {

						if (i > 0) {
							// embed directly from container cache, do not use an entry in children[] (they don't get derived!)
							$scope.episode.previousEpisodeContainer = modelSvc.containers[modelSvc.containers[container_id].children[i - 1]._id];
						}
						if (i < modelSvc.containers[container_id].children.length - 1) {
							$scope.episode.nextEpisodeContainer = modelSvc.containers[modelSvc.containers[container_id].children[i + 1]._id];
						}
					}

				}

			}
			// iterate
			if (depth > 1) {
				getParent(depth - 1, modelSvc.containers[container_id].parent_id);
			}
		};

		/* END CROSS-EPISODE NAVIGATION */

		/* BEGIN TOOLBAR HIDE/REVEAL- - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
		// TODO put this in own controller

		// Bottom toolbar starts out hidden.  5s after using a control or leaving the pane, fade out controls.
		//   If mouse re-enters pane, keep the controls visible. 

		appState.videoControlsActive = false;
		var controlTimer;

		var videoControlsWatcher = $scope.$watch(function () {
			return appState.videoControlsActive;
		}, function (isActive) {
			if (isActive) {
				controlTimer = $timeout(function () {
					if (!appState.videoControlsLocked) {
						appState.videoControlsActive = false;
					}
				}, 5000);
			}
		});
		$scope.$on('$destroy', function () {
			videoControlsWatcher();
		});

		$scope.showControls = function () {
			// console.log("showControls");
			$timeout.cancel(controlTimer);
			appState.videoControlsActive = true;
			if (appState.isTouchDevice) {
				$scope.allowControlsExit(); // otherwise it sticks permanently on touchscreens. TODO find a better way
			}
		};

		// $scope.keepControls = function () {
		// 	console.log("keepControls");
		// 	appState.videoControlsLocked = true;
		// };

		$scope.allowControlsExit = function () {
			// console.log("allowControlsExit. Locked state is ", appState.videoControlsLocked);
			// appState.videoControlsLocked = false;
			$timeout.cancel(controlTimer);
			controlTimer = $timeout(function () {
				if (!appState.videoControlsLocked) {
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
			// dismiss ALL THE THINGS
			appState.show.searchPanel = false;
			appState.show.helpPanel = false;
			appState.show.navPanel = false;
			appState.show.profilePanel = false;
			appState.itemDetail = false;
			$rootScope.$emit("player.dismissAllPanels");
		};

		$scope.noMoreHelp = function () {
			appState.show.helpPanel = false;
			localStorage.setItem("noMoreHelp", "1");
			timelineSvc.play();
		};

		$scope.play = function () {
			timelineSvc.play();
		};

		$scope.userHasRole = function (role) {
			return authSvc.userHasRole(role);
		};

		$scope.logout = function () {
			return authSvc.logout();
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

		var startScrollWatcher = function () {
			// console.log("startScrollWatcher");
			autoscrollTimer = $interval(handleAutoscroll, 400);
			autoscrollableNode.bind("scroll", function () {
				// User-initiated scrolling should block autoscroll.
				// console.log("user scrolled");
				animatableScrollNode.stop();
				stopScrollWatcher();
				appState.autoscrollBlocked = true;
			});
			// handleAutoscroll();
		};
		var autoscrollTimer;

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

		// TODO this is a relatively expensive watch.  Could greatly increase its $interval if we
		// support directly triggering it from timeline on seek()... 
		var handleAutoscroll = function () {
			// if autoscroll is true and autoscrollBlocked is false,
			// find the topmost visible current item and scroll to put it in the viewport.
			// WARNING this may break if item is inside scrollable elements other than #CONTAINER
			if (appState.autoscrollBlocked || !appState.autoscroll) {
				return;
			}

			// find topmost visible current items:
			var top = Infinity;
			var curScroll = autoscrollableNode.scrollTop();
			angular.forEach($('.content .item.isCurrent:visible'), function (item) {
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
			$timeout(function () {
				startScrollWatcher();
			}, 1750); // allow extra time; iPad was still capturing the tail end of the animated scroll

		};

		startScrollWatcher();

		// - - - - - - - - -  - - - - - - - - - - - - - - -

		$rootScope.$on("userKeypress.ESC", $scope.hidePanels);

	});
