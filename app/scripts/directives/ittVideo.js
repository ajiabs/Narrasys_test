'use strict';

// Video.js Wrapper Directive
// - can only declare one of these for an episode
// - should never be reparented or removed from the dom (use ittMagnet directives instead)
angular.module('com.inthetelling.player')
	.directive('ittVideo', function (cuePointScheduler, videojs, $timeout, config) {
		return {
			restrict: 'A',
			replace: false,
			templateUrl: "templates/video.html",
			link: function (scope, element, attrs) {
				// console.log("ITT-VIDEO LINKING FUNCTION: [scope:", scope, "]");

				// Create the DOM node contents required by videojs.  (Injecting this manually because including it in the template causes lots of bogus warnings and a vjs error that I don't want to track down)
				// For now, youtube overrides others if present!
				element.find('.video').html(function () {
					var node = '<video id="' + config.videoJSElementId + '" class="video-js vjs-default-skin" poster="' + scope.episode.coverUrl + '">';
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
				// (This is NOT calling videojs directly; extra layer of indirection through services/video.js!)
				videojs.init(scope.episode.videos, function (player) {
					// register a listener on the instantiated player to inform the cuePointScheduler
					// service whenever the playhead position changes.
					player.on("timeupdate", function () {
						//console.log("$$ timeupdate &&", player.currentTime());
						setPlayhead(player.currentTime());
					});
					
					
					// move our custom controls into the vjs control bar
					element.find('.injectedvideocontrols').appendTo(element.find('.vjs-control-bar'));
				});
				
				
				scope.testme = function() {
					console.log("testme worked");
				}
			}
		};
	});
