'use strict';

//TODO Some of this could be split into separate controllers (though that may not confer any advantage other than keeping this file small...)

angular.module('com.inthetelling.story')
	.controller('PlayerController', function (config, $scope, $location, $rootScope, $routeParams, $timeout, $interval, appState, dataSvc, modelSvc, timelineSvc, analyticsSvc, errorSvc, authSvc) {
		// console.log("playerController", $scope);

		$scope.viewMode = function (newMode) {
			appState.viewMode = newMode;
			analyticsSvc.captureEpisodeActivity("modeChange", {
				"mode": newMode
			});

			appState.producerEditLayer = 0;

			if (newMode === 'review') {
				// magnet animation looks too choppy when loading review mode; skip it:
				$timeout(function () {
					$rootScope.$emit('magnet.jumpToMagnet');
				}, 1);

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

		$scope.changeProducerEditLayer = function (newLayer) {
			appState.producerEditLayer = appState.producerEditLayer + newLayer;
			// I'm sure there's a fancier way to do this but
			if (appState.producerEditLayer === 2) {
				appState.producerEditLayer = 1;
			}
			if (appState.producerEditLayer === -2) {
				appState.producerEditLayer = -1;
			}
		};

		$scope.toggleProducerPreview = function () {
			appState.product = (appState.product === 'producer') ? 'player' : 'producer';
		};

		/* LOAD EPISODE - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

		errorSvc.init();

		if ($routeParams.epId) { // if this is missing we're in a narrative, which will init appstate and episodeID for us
			appState.init();
			appState.episodeId = $routeParams.epId;
		} else {
			$scope.narrativeId = $routeParams.narrativeId;
		}

		$scope.loading = true;
		modelSvc.addLandingScreen(appState.episodeId);

		// You're right, Matt, this was a mess.

		// Wait until we have both the master asset and the episode's items; update the timeline and current language when found
		// keeping these triggers separate for now in case we can do anything useful with one or the other before we have both,
		// but for now I'm too wary of race conditions to try
		var amIFinished = 0; // poor man's curry :)
		$scope.finishLoading = function () {
			// console.log("finishLoading", amIFinished);
			if (amIFinished < 1) {
				amIFinished++;
			} else {
				amIFinished = 0;
				appState.lang = ($routeParams.lang) ? $routeParams.lang.toLowerCase() : modelSvc.episodes[appState.episodeId].defaultLanguage;
				modelSvc.setLanguageStrings();
				document.title = modelSvc.episodes[appState.episodeId].display_title; // TODO: update this on language change

				// modelSvc.resolveEpisodeEvents(appState.episodeId); // this may be redundant
				modelSvc.addEndingScreen(appState.episodeId); // needs master asset to exist (so depends on getEpisodeAssets)
				timelineSvc.init(appState.episodeId);
				$scope.loading = false;
			}
		};

		var watcher1 = $rootScope.$on("dataSvc.getEpisodeEvents.done", function () {
			$scope.finishLoading();
		});
		var watcher2 = $rootScope.$on("dataSvc.getEpisodeAssets.done", function () {
			$scope.finishLoading();
		});

		dataSvc.getEpisode(appState.episodeId, appState.episodeSegmentId);

		// keep non-admins from seeing the producer interface
		if (appState.productLoadedAs === 'producer') {
			var rolesWatcher = $scope.$watch(function () {
				return appState.user;
			}, function (x) {
				if (Object.keys(x).length) {
					rolesWatcher();
					if (!authSvc.userHasRole('admin')) {
						appState.product = 'player';
						appState.productLoadedAs = 'player';
					}
				}
			});
		}

		$scope.appState = appState;
		$scope.show = appState.show; // yes, slightly redundant, but makes templates a bit easier to read
		$scope.now = new Date();
		$scope.apiDataBaseUrl = config.apiDataBaseUrl;

		/* END LOAD EPISODE - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

		/* BEGIN TOOLBAR HIDE/REVEAL- - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
		// TODO put this in own controller

		// Bottom toolbar starts out hidden.  5s after using a control or leaving the pane, fade out controls.
		//   If mouse re-enters pane, keep the controls visible. 

		appState.videoControlsActive = false;
		var controlTimer;
		var keepControls;

		var videoControlsWatcher = $scope.$watch(function () {
			return appState.videoControlsActive;
		}, function (isActive) {
			if (isActive) {
				$timeout.cancel(controlTimer);
				controlTimer = $timeout(function () {
					if (!keepControls) { // <-- this is why we're not just calling allowControlsExit here
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
		var watcher3 = $rootScope.$on("video.firstPlay", function () {
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

		var watcher4 = $rootScope.$on("userKeypress.ESC", $scope.hidePanels);

		$scope.$on('$destroy', function () {
			videoControlsWatcher();
			watcher1();
			watcher2();
			watcher3();
			watcher4();
		});
	});
