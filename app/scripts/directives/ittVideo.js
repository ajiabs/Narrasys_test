'use strict';

// Video.js Wrapper Directive
// - can only declare one of these for an episode
// - should never be reparented or removed from the dom (use ittVideoMagnet directives instead)
angular.module('com.inthetelling.player')
.directive('ittVideo', function (queuePointScheduler, $timeout) {
	return {
		restrict: 'A',
		replace: false,
		link: function(scope, iElement, iAttrs, controller) {
			console.log("ITT-VIDEO LINKING FUNCTION: [scope:", scope, "]");

			// Create the DOM node contents
			iElement.html(function() {
				var node = '<video id="vjs" class="video-js vjs-default-skin" autoplay preload poster="' + scope.episode.coverUrl + '" width="100%" height="100%">';
				node += '<source type="video/mp4" src="' + scope.episode.videos.mpeg4 + '" />';
				node += '<source type="video/webm" src="' + scope.episode.videos.webm + '" />';
				node += '</video>';
				return node;
			});

			// Register this video directive as the provider for the timeline service
			var setPlayhead = queuePointScheduler.registerProvider('ittVideo', 10);

			// Initialize the videojs player and register a listener on it to inform the timeline
			// service wheneve the playhead position changes. We perform this here rather than the
			// controller because linking happens after the template has been applid and the DOM is updated
			// TODO: Need to inject or scope a reference to videojs instead of the global, for testability
			videojs("vjs", {
				"controls": true
			}, function() {
				var player = this;
				player.on("timeupdate", function() {
					console.log("$$ timeupdate &&", player.currentTime());
					setPlayhead(player.currentTime());
				});
			});

			// listen for videoMagnet events and resize/reposition ourselves if we recieve one
			scope.$on('videoMagnet', function(evt, el) {
				// TODO: Animate?
				console.log("videoMagent.on()!", evt, el);
				iElement.offset(el.offset());
				iElement.width(el.width());
				iElement.height(el.height());
			});
		}
	};
});
