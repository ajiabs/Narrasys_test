'use strict';

//TODO Some of this could be split into separate controllers (though that may not confer any advantage other than keeping this file small...)

angular.module('com.inthetelling.player')
	.controller('PlayerController', function($scope, $rootScope, $routeParams, $timeout, $interval, dataSvc, modelSvc, timelineSvc, analyticsSvc) {
		console.log("playerController", $scope);

		$scope.viewMode = function(newMode) {
			modelSvc.appState.viewMode = newMode;
			analyticsSvc.captureEpisodeActivity("modeChange", {
				"mode": newMode
			});

			//Autoscroll only in explore mode for now
			if (newMode === 'review') {
				modelSvc.appState.autoscroll = true;
				handleAutoscroll();
			} else {
				modelSvc.appState.autoscroll = false;
			}
		};

		if ($routeParams.viewMode) {
			$scope.viewMode($routeParams.viewMode);
		}

		if ($routeParams.t) {
			timelineSvc.seek($routeParams.t, "URLParameter");
		}

		// TEMPORARY
		if ($routeParams.producer) {
			modelSvc.appState.producer = true;
		}


		/* LOAD EPISODE - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

		modelSvc.appState.episodeId = $routeParams.epId;
		modelSvc.addLandingScreen(modelSvc.appState.episodeId);
		dataSvc.getEpisode(modelSvc.appState.episodeId);

		// Watch for the first load of the episode data; init the master asset and page title when found
		var episodeWatcher = $scope.$watch(function() {
			return modelSvc.episodes[modelSvc.appState.episodeId].title;
		}, function(a, b) {
			if (a !== b) {
				document.title = "STORY: " + a;
				episodeWatcher(); // stop watching;
			}
		});

		// Watch for the first load of the episode items; update the timeline when found
		$scope.loading = true;
		var eventsWatcher = $scope.$watch(function() {
			return modelSvc.episodes[modelSvc.appState.episodeId].items;
		}, function(a, b) {
			if (a) {
				timelineSvc.init(modelSvc.appState.episodeId);
				$scope.loading = false;
				eventsWatcher(); // stop watching
			}
		});

		$scope.episode = modelSvc.episode(modelSvc.appState.episodeId);
		$scope.appState = modelSvc.appState;
		$scope.show = modelSvc.appState.show; // yes, slightly redundant, but makes templates a bit easier to read
		$scope.now = new Date();

		/* END LOAD EPISODE - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

		// Hide toolbars

		// TODO put this in own controller - - - - - - -
		/* Bottom toolbar starts out visible.  5s after using a control or leaving the pane, fade out controls.
		   If mouse re-enters pane, keep the controls visible. */
		// TODO: fade toolbars when tap outside, or when hit esc key
		// TODO: never fades on touchscreen... fix that

		modelSvc.appState.videoControlsActive = true;

		modelSvc.appState.videoControlsActive = false;
		var keepControls;
		var controlTimer;
		$scope.$watch(function() {
			return modelSvc.appState.videoControlsActive;
		}, function(isActive, wasActive) {
			if (isActive) {
				controlTimer = $timeout(function() {
					if (!keepControls) {
						modelSvc.appState.videoControlsActive = false;
					}
				}, 3000);
			}
		});

		$scope.showControls = function() {
			// console.log("showControls");
			$timeout.cancel(controlTimer);
			modelSvc.appState.videoControlsActive = true;
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
				modelSvc.appState.videoControlsActive = false;
			}, 3000);
		};

		// - - - - - - - - -  - - - - - - - - - - - - - - -


		// Misc toolbars too small to rate their own controllers
		$scope.toggleSearchPanel = function() {
			modelSvc.appState.show.searchPanel = !modelSvc.appState.show.searchPanel;
			if (modelSvc.appState.show.searchPanel) {
				$scope.$broadcast('search.indexEvents');
			}
		};
		$scope.toggleNavPanel = function() {
			modelSvc.appState.show.navPanel = !modelSvc.appState.show.navPanel;
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
			if (!(localStorage.getItem("noMoreHelp"))) {
				// show the help panel only when the timeline is past the landing screen:
				var helpWatcher = $scope.$watch(function() {
					return modelSvc.appState.time;
				}, function(newVal) {
					if (newVal > 0) {
						helpWatcher();
						$timeout(function() {
							timelineSvc.pause();
							modelSvc.appState.show.helpPanel = true;
						});
					}
				});
			}
		}

		$scope.hidePanels = function() {
			modelSvc.appState.show.helpPanel = false;
			modelSvc.appState.show.navPanel = false;
			modelSvc.appState.show.searchPanel = false;
		};

		$scope.noMoreHelp = function() {
			modelSvc.appState.show.helpPanel = false;
			localStorage.setItem("noMoreHelp", "1");
			timelineSvc.play();
		};

		// - - - - - - - - -  - - - - - - - - - - - - - - -
		// Autoscroll
		// Some jQuery dependencies here (namespaced bindings, animated scroll)

		// appstate.autoscroll = we are in a mode which wants autoscroll
		// appstate.autoscrollBlocked = user has disabled autoscroll (by scrolling manually)
		// Those are in modelSvc instead of $scope becuase in future we'll want scenes to be able to autoscroll too

		var bindScrollWatcher = function() {
			// THis watches for manual scrolling of the window, which cancels autoscroll:
			angular.element('#CONTAINER').bind("scroll.autoscroll", function() {
				unbindScrollWatcher();
				modelSvc.appState.autoscrollBlocked = true;
			});
		};
		var unbindScrollWatcher = function() {
			angular.element('#CONTAINER').unbind("scroll.autoscroll");
		};
		$scope.enableAutoscroll = function() {
			modelSvc.appState.autoscrollBlocked = false;
			bindScrollWatcher();
			handleAutoscroll();
		};
		var handleAutoscroll = function() {
			// if autoscroll is true and autoscrollBlocked is false,
			// find the topmost visible current item and scroll #CONTAINER to make it visible.
			// WARNING this may break if item is inside scrollable elements other than #CONTAINER
			if (modelSvc.appState.autoscroll && !modelSvc.appState.autoscrollBlocked) {
				var top = Infinity;
				var curScroll = $('#CONTAINER').scrollTop();
				angular.forEach($('.content .item.isCurrent:visible'), function(item) {
					var t = item.getBoundingClientRect().top + curScroll;
					if (t < top) {
						top = t;
					}
				});
				unbindScrollWatcher(); // don't want scrollwatcher competing with this animation
				var scrollOffset = 45 + ($(window).height() / 5); // put item top at TOOLBAR HEIGHT plus 20% of viewport
				$('#CONTAINER').stop().animate({
					"scrollTop": top - scrollOffset
				}, 1000, "swing", function() {
					$timeout(bindScrollWatcher, 100); // allow extra time; iPad was still capturing the tail end of the animated scroll
				});
			}
		};

		bindScrollWatcher();
		$interval(handleAutoscroll, 2000);


		// - - - - - - - - -  - - - - - - - - - - - - - - -

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
