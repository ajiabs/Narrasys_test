'use strict';


// This is turning into the player chrome rather than just the toolbar. TODO name change or refactor you be the judge

angular.module('com.inthetelling.player')
	.directive('ittToolbar', function ($timeout, $rootScope, videojs, $window, $location) {
		return {
			restrict: 'A',
			replace: true,
			scope: true,
			templateUrl: 'templates/toolbar/toolbar.html',
			link: function (scope, element, attrs, controller) {
				// scope is a child scope that inherits from EpisodeController scope
				// thus anything that is added to this scope here is private to the directive,
				// but everything on parent scope is still accessible.

				// Nav and Search:
				scope.show = {
					navigationPanel: false,
					searchPanel: false,
					searchPanelInternals: false,
					introPanel: true,
					playerPanel: false
				};

				// Initial magnet should be the one in the landing page
				$timeout(function () {
					$rootScope.$emit('magnet.changeMagnet', element.find('.videoContainer'));
				}, 0);

				// ipad crashes on window resize events inside an iframe.  So don't do that.
				if ($rootScope.isFramed && ($rootScope.isIPad || $rootScope.isIPhone)) {
					scope.$watch(function () {
						return $rootScope.windowWidth;
					}, function () {
						$rootScope.$emit('magnet.repositionImmediately');
					});
				} else {
					angular.element($window).bind('resize', function () {
						$rootScope.$emit('magnet.repositionImmediately');
					});
				}

				/* Handler for toolbar buttons to change scene templates. */
				scope.setSceneTemplate = function (newTemplate) {
					// console.log("setSceneTemplate " + newTemplate);

					scope.currentSceneTemplate = newTemplate;
					// set all scenes to use newTemplate
					for (var i = 0; i < scope.scenes.length; i++) {
						var thisScene = scope.scenes[i];
						if (newTemplate) {
							if (thisScene.origTemplateUrl === undefined) {
								thisScene.origTemplateUrl = thisScene.templateUrl; // so we can revert to it later
							}
							thisScene.templateUrl = "templates/scene-" + newTemplate + ".html"; // hardcoded for now
						} else {
							if (thisScene.origTemplateUrl) { // if this is undefined, we've never left directed view so don't need to do anything here
								thisScene.templateUrl = thisScene.origTemplateUrl;
							}
						}
					}
					// TODO: set button states immediately since scene redraw takes a while; need to give users feedback that it's working
					$rootScope.$emit('toolbar.changedSceneTemplate');
				};

				/* detect which view we're in */
				/* this is a bizarre syntax but seems to be how it's supposed to work... */
				scope.currentSceneTemplateIs = function (compare) {
					return scope.currentSceneTemplate === compare;
				};

				scope.mainframeescape = function () {
					videojs.player.pause();
					window.open($location.absUrl()).focus();
				};

				scope.showNavigationPanel = function () {
					videojs.player.pause();
					videojs.player.controls(false); // TODO: do this on iPad only
					scope.show.navigationPanel = true;
				};

				scope.showSearchPanel = function () {
					videojs.player.pause();
					videojs.player.controls(false); // TODO: do this on iPad only

					scope.show.searchPanel = true;
					// Wait a tick before building the search panel internals. (Possibly unnecessary, but just in case...)
					$timeout(function () {
						scope.show.searchPanelInternals = true;
					}, 0);
				};

				scope.showSxSForm = function () {
					$("body,html").stop().animate({
						"scrollTop": 0
					}, 500);
					videojs.player.pause();
					videojs.player.controls(false);
					scope.show.sxsPanel = true;
				};

				scope.toggleSearchPanel = function () {
					if (scope.show.searchPanel) {
						scope.hidePanels();
					} else {
						scope.showSearchPanel();
						document.getElementById('searchtext').focus(); // TODO BUG not working in Safari
					}
				};

				scope.showSceneMenu = function () {
					if (scope.show.navigationPanel) {
						scope.hidePanels();
					} else {
						scope.showNavigationPanel();
					}
				};

				// triggers vjs footer controls to appear
				scope.showVideoControls = function () {
					if (videojs.player) { // in case video hasn't inited yet
						videojs.player.userActive(true);
					}
				};

				scope.toggleCaptions = function () {
					scope.hideCaptions = !scope.hideCaptions;
					for (var i = 0; i < scope.scenes.length; i++) {
						scope.scenes[i].hideCaptions = scope.hideCaptions;
					}
				};

				$rootScope.$on("SxS.hide", function () {
					scope.hidePanels();
				});

				$rootScope.$on("SxS.message", function (event, message, variant) {
					console.log("got message", message);
					scope.floaterMessage = message;
					scope.floaterVariant = variant;
				});

				scope.hideFloater = function () {
					scope.floaterMessage = false;
				};

				scope.forceWindowReload = function () {
					$window.location.reload();
				};

				scope.hidePanels = function () {
					// (Same trigger to dismiss either panel; fine since only one can be visible at a time anyway)
					scope.show.navigationPanel = false;
					scope.show.searchPanel = false;
					scope.show.sxsPanel = false;
					scope.searchText = '';
					videojs.player.controls(true); // TODO: do this on iPad only
					// For now, don't set searchPanelInternals to false here; once it's built leave it in place to maintain state.
					// TODO if this causes memory problems on old devices we can change this, but I think rendering time is more our bottleneck than low memory conditions.
				};

				scope.gotoTime = function (t) {
					videojs.player.currentTime(t + 0.001); // fudge: add a bit to ensure that we're inside the next scene's range
				};

				// When user first clicks video, show the toolbar chrome and hide the landing screen
				scope.firstPlayWatcher = $rootScope.$on('toolbar.videoFirstPlay', function () {
					// Move our custom controls into the vjs control bar.  TODO fix jquery hackage
					$('.injectedvideocontrols').appendTo($('.vjs-control-bar')).show();

					// default to 'explore' mode on small screens:
					if (angular.element(window).width() < 481) {
						scope.setSceneTemplate('explore');
					}


					// Hide the intro; show the regular controls
					scope.show.introPanel = false;
					scope.show.playerPanel = true;
					$rootScope.$emit('toolbar.changedSceneTemplate'); // force twiddleSceneLayout

					scope.firstPlayWatcher(); // stop listening for this event

					// For next/prev scene buttons:
					scope.curSceneWatcher = scope.$watch(function () {
						// step through episode.scenes, return the last one whose start time is before the current time
						var now = videojs.player.currentTime();
						for (var i = 0; i < scope.scenes.length; i++) {
							if (scope.scenes[i].startTime > now) {
								return scope.scenes[i - 1]; //break loop on first match
							}
						}
						return scope.scenes[scope.scenes.length - 1]; // no match means we are in the last scene
					}, function (newVal, oldVal) {
						scope.curScene = newVal;
					});

				});


				// HACK HACK such an ungodly HACK.
				// iDevices combined with the youtube player need some special handling as far as event timing goes; normally the firstPlayWatcher
				// fires immediately when the user hits "play", but on iDevices there's a potentially long delay while the video starts buffering after first
				// user interaction. Ugly. So we're watching for a different event that on the iPad fires earlier than the 'play' event,
				// and use it to trigger the videoFirstPlay event instead.
				/*
				scope.firstPlayWatcherForIDevicesWhenWeAreUsingYoutube = scope.$watch(
					function () {
						if (videojs.player) {
							return videojs.player.durationchanged;
						}
					},
					function (durationchanged) {
						if (durationchanged) {
							$rootScope.$emit('toolbar.videoFirstPlay');
							scope.firstPlayWatcherForIDevicesWhenWeAreUsingYoutube(); // stop watching
						}
					}
				);
				*/

			},
			controller: "ToolbarController"
		};
	});
