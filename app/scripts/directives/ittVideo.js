'use strict';

// Video.js Wrapper Directive
// - can only declare one of these for an episode
// - should never be reparented or removed from the dom (use ittMagnet directives instead)
angular.module('com.inthetelling.player')
	.directive('ittVideo', function (cuePointScheduler, videojs, $timeout, config, $rootScope) {
		return {
			restrict: 'A',
			replace: false,
			template: '<div class="video">This will be the video</div>',
			link: function (scope, element, attrs) {
				console.log("ITT-VIDEO LINKING FUNCTION: [scope:", scope, "]");

				// Create the DOM node contents required by videojs.  
				// (Injecting this manually because including it in the template causes lots of bogus warnings 
				// and a vjs error that I don't want to track down)

				element.find('.video').html(function () {
					var node = '<video id="' + config.videoJSElementId + '" class="video-js vjs-story-skin" poster="' + scope.episode.coverUrl + '">';
					// For now, youtube overrides others if present.
					// Except for iDevices, for which the youtube plugin is buggy. TODO fix the plugin. For now divert to mp4 version
//					if (scope.episode.videos.youtube && !($rootScope.isIPad || $rootScope.isIPhone)) {
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
				scope.setPlayhead = cuePointScheduler.registerProvider(config.videoJSElementId, config.cuePointScanInterval);

				// Initialize videojs via the videojs service
				// (This is NOT calling videojs directly; extra layer of indirection through services/video.js!)  (TODO: why?)
				videojs.init(scope.episode.videos, function (player) {
					console.log("videojs init");
				
					// Catch the first play. VJS's "firstplay" event is buggy, we'll just use 'play' and catch duplicates.
					// (would just wipe the event instead, but vjs doesn't support namespaced events either...)
					player.on("play",function() {
//						console.log("player play");
						if (!player.hasPlayed) {
							player.hasPlayed= true;
							$rootScope.$emit("toolbar.videoFirstPlay");

							// register a listener on the instantiated player to inform the cuePointScheduler
							// service whenever the playhead position changes.
							player.on("timeupdate", function () {
								//console.log("$$ timeupdate &&", player.currentTime());
								scope.setPlayhead(player.currentTime());
							});
						}
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
								if (scope.scenes[i].title) {
									markerData.marker_breaks.push(scope.scenes[i].startTime);
									markerData.marker_text.push(scope.scenes[i].title);
								}
							}

							player.markers(markerData); // sets up the plugin
							player.trigger("loadedmetadata"); //signals the plugin to do its thing (the event doesn't fire reliably on its own)
						}
					});
					/* Done setting scene markers. */
				});

			}
		};
	});
