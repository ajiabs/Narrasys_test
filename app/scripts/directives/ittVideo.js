'use strict';

// Video.js Wrapper Directive
// - can only declare one of these for an episode
// - should never be reparented or removed from the dom (use ittVideoMagnet directives instead)
angular.module('com.inthetelling.player')
.directive('ittVideo', function (queuePointScheduler, videojs, $timeout, config) {
	return {
		restrict: 'A',
		replace: false,
		link: function(scope, iElement, iAttrs, controller) {
			//console.log("ITT-VIDEO LINKING FUNCTION: [scope:", scope, "]");

			// Create the DOM node contents required by videojs
			iElement.html(function() {
				var node = '<video id="' + config.videoJSElementId + '" class="video-js vjs-default-skin" autoplay preload poster="' + scope.episode.coverUrl + '" controls width="100%" height="100%">';
				node += '<source type="video/mp4" src="' + scope.episode.videos.mpeg4 + '" />';
				node += '<source type="video/webm" src="' + scope.episode.videos.webm + '" />';
				node += '</video>';
				return node;
			});

			// Register videojs as the provider for the queuePointScheduler service.
			// We are only using videoJSElementId as a UID here for convenience. queuePointScheduler has no DOM awareness.
			var setPlayhead = queuePointScheduler.registerProvider(config.videoJSElementId, config.queuePointScanInterval);

			// Initialize videojs via the videojs service, passing it the videoJSElementId we just used to build the videojs DOM node
			videojs.init(config.videoJSElementId, function(player) {
				// register a listener on the instantiated player to inform the queuePointScheduler
				// service whenever the playhead position changes.
				player.on("timeupdate", function() {
					//console.log("$$ timeupdate &&", player.currentTime());
					setPlayhead(player.currentTime());
				});
			});

			// listen for videoMagnet events and resize/reposition ourselves if we recieve one
			scope.$on('videoMagnet', function(evt, el) {
				// TODO: Animate?
				//console.log("videoMagnet.on()!", evt, el);
				if (el.parent().css("position") === "fixed") {
					// if videoContainer is position:fixed, video should be too
					iElement.css("position","fixed");
					iElement.offset(el.offset());
					iElement.width(el.width());
					iElement.height(el.height());
				} else {
					iElement.css("position","absolute");
					iElement.offset(el.offset());
					iElement.width(el.width());
					iElement.height(el.height());
				}
			});
		}
	};
});
