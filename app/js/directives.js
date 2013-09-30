'use strict';

// Declare the player.directives module
angular.module('com.inthetelling.player.directives', [])

// Scene Directive
.directive('ittScene', [function() {
	return {
		restrict: 'A',
		replace: false,
		template: '<div ng-include="scene.templateUrl">Loading Scene...</div>',
		link: function(scope, iElement, iAttrs, controller) {
			console.log("ITT-SCENE LINKING FUNCTION: [scope:", scope, "]");
		},
		scope: {
			scene: '=ittScene'
		}
	};
}])

// Transmedia Directive
.directive('ittItem', [function() {
	return {
		restrict: 'A',
		replace: false,
		template: '<div ng-include="item.templateUrl">Loading Item...</div>',
		link: function(scope, iElement, iAttrs, controller) {
			console.log("ITT-ITEM LINKING FUNCTION: [scope:", scope, "]");
		},
		scope: {
			item: '=ittItem'
		}
	};
}])

// Video.js Wrapper Directive
// - can only declare one of these for an episode
// - should never be reparented or removed from the dom (use ittVideoMagnet directives instead)
.directive('ittVideo', ['timelineSvc', '$timeout', function(timelineSvc, $timeout) {
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
			var setPlayhead = timelineSvc.registerProvider('ittVideo', 10);

			// Initialize the videojs player and register a listener on it to inform the timeline
			// service wheneve the playhead position changes. We perform this here rather than the
			// controller because linking happens after the template has been applid and the DOM is updated
			// TODO: Need to inject or scope a reference to videojs instead of the global, for testability
			videojs("vjs", {
				"controls": true
			}, function() {
				var player = this;
				player.on("timeupdate", function() {
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
}])

// This directive is basically an placeholder which can be removed/replaced
// or reparented within the dom. When present in the dom the ittVideo directive
// will automatically change its size and position to overlay the magnet directive.
// multiple magnets may be used in the dom. A magnet will 'attract' the video directive
// when it goes from being hidden to visible in the dom (whether by insertion or display/hidden
// of self or parent node).
.directive('ittVideoMagnet', ['timelineSvc', '$rootScope', function(timelineSvc, $rootScope) {
	return {
		restrict: 'A',
		replace: true,
		scope: true,
		link: function(scope, iElement, iAttrs, controller) {
			console.log("ITT-VIDEO-MAGNET LINKING FUNCTION: [scope:", scope, "]");
			// 'activate' a dom instance of the itt-video-magnet directive by broadcasting an event from the root scope
			// with a reference to the itt-video-magnet's dom element. The itt-video directive listens for these events
			// and utilizes the dom element to reposition itself appropriately.
			scope.activate = function() {
				console.log("ittVideoMagnet.activate()!");
				$rootScope.$broadcast('videoMagnet', iElement);
			};
			// watch this elements visisbility and if it becomes visible in the dom then automatically activate it
			scope.$watch(function() {
				return iElement.is(':visible');
			}, function() {
				if (iElement.is(':visible')) {
					scope.activate();
				}
			});
			// if this element is visible now at time of rendering then activate it
			//if (iElement.is(':visible')) {
			//	scope.activate();
			//}
		}
	};
}]);