'use strict';

// Video.js Wrapper Directive
// - can only declare one of these for an episode
// - should never be reparented or removed from the dom (use ittMagnet directives instead)
angular.module('com.inthetelling.player')
	.directive('ittVideo', function (cuePointScheduler, videojs, $timeout, config, $rootScope) {
		return {
			restrict: 'A',
			replace: false,
			templateUrl: "templates/video.html",
			link: function (scope, element, attrs) {
				// console.log("ITT-VIDEO LINKING FUNCTION: [scope:", scope, "]");

				// Create the DOM node contents required by videojs.  
				// (Injecting this manually because including it in the template causes lots of bogus warnings 
				// and a vjs error that I don't want to track down)

				element.find('.video').html(function () {
					var node = '<video id="' + config.videoJSElementId + '" class="video-js vjs-story-skin" poster="' + scope.episode.coverUrl + '">';
					// For now, youtube overrides others if present!
					if (scope.episode.videos.youtube) {
						node += '<source type="video/youtube" src="' + scope.episode.videos.youtube + '" />';
					} else {
						node += '<source type="video/mp4" src="' + scope.episode.videos.mpeg4 + '" />';
						node += '<source type="video/webm" src="' + scope.episode.videos.webm + '" />';
					}
					node += ' </video>';
					return node;
				});

				// Register videojs as the provider for the cuePointScheduler service.
				// We are only using videoJSElementId as a UID here for convenience. cuePointScheduler has no DOM awareness.
				var setPlayhead = cuePointScheduler.registerProvider(config.videoJSElementId, config.cuePointScanInterval);

				// Initialize videojs via the videojs service
				// (This is NOT calling videojs directly; extra layer of indirection through services/video.js!)  (TODO: why?)
				videojs.init(scope.episode.videos, function (player) {

					// register a listener on the instantiated player to inform the cuePointScheduler
					// service whenever the playhead position changes.
					player.on("timeupdate", function () {
						//console.log("$$ timeupdate &&", player.currentTime());
						setPlayhead(player.currentTime());
					});

					//TODO is it a Bad Thing that I'm doing these inside the player init scope?  

					// Watch the current scene, so we can update the next scene / prev scene buttons

					var curSceneWatcher = scope.$watch(function () {
						// step through episode.scenes, return the last one whose start time is before the current time
						var now = player.currentTime();
						for (var i = 0; i < scope.scenes.length; i++) {
							if (scope.scenes[i].startTime > now) {
								return scope.scenes[i - 1]; //break loop on first match
							}
						}
						return scope.scenes[scope.scenes.length - 1]; // no match means we are in the last scene
					}, function (newVal, oldVal) {
						scope.curScene = newVal;
					});

					// Wait until we know the player duration, then set the scene markers (and kill the $watch)
					// TODO if we can get the video duration in the json we'll be able to init this directly
					var durationWatcher = scope.$watch(function () {
						return player.duration();
					}, function (newVal, oldVal) {
						if (newVal !== 0) {
							// We now know the video duration, so can position the markers:
							durationWatcher(); // removes the watcher
							//Feed data into videojs.markers plugin:
							var markerData = {
								setting: {},
								marker_breaks: [],
								marker_text: []
							};
							for (var i = 0; i < scope.scenes.length; i++) {
								markerData.marker_breaks.push(scope.scenes[i].startTime);
								markerData.marker_text.push(scope.scenes[i].title);
							}
							player.markers(markerData); // sets up the plugin
							player.trigger("loadedmetadata"); //signals the plugin to do its thing (the event doesn't fire reliably on its own)
						}
					});
					/* Done setting scene markers. */

					// Now move our custom controls into the vjs control bar.  (Waiting for all other init first, to be safe)
					element.find('.injectedvideocontrols').appendTo(element.find('.vjs-control-bar'));
				});

				scope.gotoTime = function (t) {
					videojs.player.currentTime(t + 0.001); // fudge: add a bit to ensure that we're inside the next scene's range
				};
				
				/* 
				TODO REFACTOR  Ultimately I think the player needs to be refactored into a service.
				Having to broadcast events from here to toolbar controller via $rootScope feels like three kinds of wrong. 
				*/
				scope.toggleSceneMenu = function() {
					// send message for the toolbar controller to respond to.
					console.log("sending toggleSceneMenu message");
					$rootScope.$emit("toolbar.toggleSceneMenu");
				};
				scope.startFSView = function() {
					console.log("sending startFSView message");
					// send message for the toolbar controller to respond to.
					$rootScope.$emit("toolbar.startFSView");
				};
			}
		};
	});
