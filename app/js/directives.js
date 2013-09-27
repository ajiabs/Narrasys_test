'use strict';

// Declare the player.directives module
angular.module('player.directives', [])

// Scene Directive
.directive('ittScene', [function() {
	return {
		restrict: 'A',
		replace: false,
		template: '<div ng-include="scene.templateUrl">Loading Scene...</div>',
		link: function(scope, iElement, iAttrs, controller) {
			console.log("SCENE SCOPE:", scope);
		},
		scope: {
			scene: '='
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
			console.log("ITEM SCOPE:", scope);
		},
		scope: {
			item: '='
		}
	};
}])

// Video.js Wrapper Directive
// - can only declare one of these for an episode
// - should never be reparented or removed from the dom (use ittVideoMagnet directives instead)
.directive('ittVideo', ['timelineSvc', function(timelineSvc) {
	return {
		restrict: 'A',
		replace: true,
		templateUrl: 'partials/video.html',
		link: function(scope, iElement, iAttrs, controller) {
			console.log("VIDEO SCOPE:", scope);
			// Register this video directive as the provider for the timeline service
			var setPlayhead = timelineSvc.registerProvider('directive.video', 10);
			// Initialize the videojs player and register a listener on it to inform the timeline
			// service wheneve the playhead position changes. We perform this here rather than the
			// controller because linking happens after the template has been applid and the DOM is updated
			// TODO: Need to inject or scope a reference to videojs instead of the global, for testability
			videojs("vjs", {}, function() {
				var player = this;
				player.on("timeupdate", function() {
					setPlayhead(player.currentTime());
				});
			});
			// listen for videoMagnet events and resize/reposition ourselves if we recieve one
			scope.$on('videoMagnet', function(vmElement) {
				// TODO: Animate?
				iElement.offset(vmElement.offset());
				iElement.width(vmElement.width());
				iElement.height(vmElement.height());
			});
		}
	};
}])

// This directive is basically an placeholder which can be removed/replaced
// or reparented within the dom. When present in the dom the ittVideo directive
// will automatically change its size and position to overlay the magnet directive.
// multiple magnets may be used in the dom. A magnet will 'attract' the video directive
// when it goes from being hidden to visible in the dom (whether by insertion or display/hidden
// of self or parent node.
.directive('ittVideoMagnet', ['timelineSvc', '$rootScope', function(timelineSvc, $rootScope) {
	return {
		restrict: 'A',
		replace: true,
		scope: true,
		link: function(scope, iElement, iAttrs, controller) {
			// 'activate' a dom instance of the itt-video-magnet directive by broadcasting an event from the root scope
			// with a reference to the itt-video-magnet's dom element. The itt-video directive listens for these events
			// and utilizes the dom element to reposition itself appropriately.
			scope.activate = function() {
				$rootScope.$broadcast('videoMagnet', iElement);
			};
			// watch this elements visisbility and if it becomes visible in the dom then automatically activate it
			scope.$watch(function() {
				return iElement.is(':visible');
			}, scope.activate);
			// if this element is visible now at time of rendering then activate it
			if (iElement.is(':visible')) {
				scope.activate();
			}
		}
	};
}]);