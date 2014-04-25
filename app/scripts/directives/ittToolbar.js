'use strict';


// This is turning into the player chrome rather than just the toolbar. TODO name change or refactor you be the judge

angular.module('com.inthetelling.player')
	.directive('ittToolbar', function($timeout, $rootScope, videojs, $window, $location) {
		return {
			restrict: 'A',
			replace: true,
			scope: true,
			templateUrl: 'templates/toolbar/toolbar.html',
			link: function(scope, element, attrs, controller) {
				// scope is a child scope that inherits from EpisodeController scope
				// thus anything that is added to this scope here is private to the directive,
				// but everything on parent scope is still accessible.

				// Nav and Search:
				scope.show = {
					navigationPanel: false,
					searchPanel: false,
					searchPanelInternals: false,
					introPanel: true,
					playerPanel: false,
					helpPanel: false
				};

				// Initial magnet should be the one in the landing page
				$timeout(function() {
					$rootScope.$emit('magnet.changeMagnet', element.find('.videoContainer'));
				}, 0);

				// ipad crashes on window resize events inside an iframe.  So don't do that.
				if ($rootScope.isFramed && ($rootScope.isIPad || $rootScope.isIPhone)) {
					scope.$watch(function() {
						return $rootScope.windowWidth;
					}, function() {
						$rootScope.$emit('magnet.repositionImmediately');
					});
				} else {
					angular.element($window).bind('resize', function() {
						$rootScope.$emit('magnet.repositionImmediately');
					});
				}


				// Quick cookie functions for help overlay
				var createCookie = function(name, value, days) {
					var expires = "";
					if (days) {
						var date = new Date();
						date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
						expires = "; expires=" + date.toGMTString();
					}
					document.cookie = name + "=" + value + expires + "; path=/";
				};

				var readCookie = function(name) {
					var cookies = document.cookie.split('; ');
					for (var i = 0; i < cookies.length; i++) {
						if (cookies[i].indexOf(name + "=") === 0) {
							return cookies[i].substring(name.length + 1);
						}
					}
					return false;
				};

				// show the help pane, only if cookies are settable and there isn't one already.
				// (If cookies are blocked, default to not showing the overlay to avoid annoying them with repeats.)
				createCookie("canSetCookie", true,1);
				if (readCookie("canSetCookie")) {
					document.cookie = 'canSetCookie=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
					if (!readCookie("noMoreHelp")) {
						scope.show.helpPanel = true;
						// pause the video for the help panel:
						var unwatch = scope.$watch(function() {
							return scope.show.playerPanel;
						}, function(isvis) {
							console.log("plyaerpanel cahnged", isvis);
							if (isvis) {
								videojs.player.pause();
								unwatch();
							}
						});
					}
				}

				scope.noMoreHelp = function() {
					scope.show.helpPanel = false;
					createCookie("noMoreHelp", "1", 3650);
					videojs.player.play();
				};


				/* Handler for toolbar buttons to change scene templates. */
				scope.setSceneTemplate = function(newTemplate) {
					// console.log("setSceneTemplate " + newTemplate);

					scope.currentSceneTemplate = newTemplate;

					// for autoscroll:
					scope.autoscrollEnabled = (newTemplate === 'explore');
					scope.exploreMode = scope.autoscrollEnabled;

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
				scope.currentSceneTemplateIs = function(compare) {
					return scope.currentSceneTemplate === compare;
				};

				scope.mainframeescape = function() {
					videojs.player.pause();
					window.open($location.absUrl()).focus();
				};

				scope.showNavigationPanel = function() {
					videojs.player.pause();
					videojs.player.controls(false); // TODO: do this on iPad only
					scope.show.navigationPanel = true;
				};

				scope.showSearchPanel = function() {
					videojs.player.pause();
					videojs.player.controls(false); // TODO: do this on iPad only

					scope.show.searchPanel = true;
					if (scope.currentSceneTemplateIs('explore')) {
						scope.enableAutoscroll();
					}

					// Wait a tick before building the search panel internals. (Possibly unnecessary, but just in case...)
					$timeout(function() {
						scope.show.searchPanelInternals = true;
					}, 0);
				};

				scope.toggleSearchPanel = function() {
					if (scope.show.searchPanel) {
						scope.hidePanels();
					} else {
						scope.showSearchPanel();
						document.getElementById('searchtext').focus(); // TODO BUG not working in Safari
					}
				};

				scope.showSceneMenu = function() {
					if (scope.show.navigationPanel) {
						scope.hidePanels();
					} else {
						scope.showNavigationPanel();
					}
				};

				// triggers vjs footer controls to appear
				scope.showVideoControls = function() {
					if (videojs.player) { // in case video hasn't inited yet
						videojs.player.userActive(true);
					}
				};

				scope.toggleCaptions = function() {
					scope.hideCaptions = !scope.hideCaptions;
					for (var i = 0; i < scope.scenes.length; i++) {
						scope.scenes[i].hideCaptions = scope.hideCaptions;
					}
				};

				scope.hidePanels = function() {
					// (Same trigger to dismiss either panel; fine since only one can be visible at a time anyway)
					scope.show.navigationPanel = false;
					scope.show.searchPanel = false;
					scope.show.helpPanel = false;
					scope.searchText = '';
					videojs.player.controls(true); // TODO: do this on iPad only
					// For now, don't set searchPanelInternals to false here; once it's built leave it in place to maintain state.
					// TODO if this causes memory problems on old devices we can change this, but I think rendering time is more our bottleneck than low memory conditions.
				};

				scope.gotoTime = function(t) {
					videojs.player.currentTime(t);
				};



				// When user first clicks video, show the toolbar chrome and hide the landing screen
				scope.firstPlayWatcher = $rootScope.$on('toolbar.videoFirstPlay', function() {
					// Move our custom controls into the vjs control bar.  TODO fix jquery hackage
					$('.injectedvideocontrols').appendTo($('.vjs-control-bar')).show();

					// default to 'explore' mode on small screens:
					if (angular.element(window).width() < 481) {
						scope.setSceneTemplate('explore');
					}


					// Hide the intro; show the regular controls
					scope.show.introPanel = false;
					scope.show.playerPanel = true;
					$rootScope.$emit('toolbar.changedSceneTemplate'); // force twiddleScene

					scope.firstPlayWatcher(); // stop listening for this event

					// For next/prev scene buttons:
					scope.curSceneWatcher = scope.$watch(function() {
						// step through episode.scenes, return the last one whose start time is before the current time
						var now = videojs.player.currentTime();
						for (var i = 0; i < scope.scenes.length; i++) {
							if (scope.scenes[i].startTime > now) {
								return scope.scenes[i - 1]; //break loop on first match
							}
						}
						return scope.scenes[scope.scenes.length - 1]; // no match means we are in the last scene
					}, function(newVal, oldVal) {
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

				// Autoscroll handler.  Items in explore mode will emit item.autoscroll events on enter.
				// when we get one, autoscroll to the topmost current item unless scrolling is disabled.
				scope.captureScrollEvents = true;
				$rootScope.$on('item.autoscroll', function() {
					if (!scope.captureScrollEvents || !scope.autoscrollEnabled) {
						return;
					}

					var top = Infinity;
					// There will always be at least one currentItem, since this is triggered by item enter.
					angular.forEach($('.content .item.currentItem'), function(item) {
						var t = $(item).offset().top;
						if (t < top) {
							top = t;
						}
					});
					var offset = 45 + $('.videoContainer:visible').height(); /* TOOLBAR HEIGHT */
					if (top < Infinity) {
						scope.captureScrollEvents = false;
						$("body,html").stop().animate({
							"scrollTop": top - offset
						}, 1000, "swing", function() {
							$timeout(function() {
								scope.captureScrollEvents = true;
							}, 50); // allow extra time; iPad was still capturing the tail end of the animated scroll
						});
					}
				});

				angular.element($window).bind("scroll", function() {
					if (scope.captureScrollEvents && scope.autoscrollEnabled) {
						scope.autoscrollEnabled = false;
					}
				});
				scope.enableAutoscroll = function() {
					scope.autoscrollEnabled = true;
					$rootScope.$emit('item.autoscroll');
				};


			},
			controller: "ToolbarController"
		};
	});
