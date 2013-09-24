'use strict';

// Declare the player.directives module
angular.module('player.directives', [])

// Scene Directive
.directive('scene', [function() {
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
.directive('item', [function() {
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
		replace: false,
		templateUrl: 'partials/video.html',
		scope: true,
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
		}//,
		//controller: function($scope, $element, $attrs, $transclude) {
		//}
	};
}])

// This directive is basically an placeholder which can be removed/replaced
// or reparented within the dom. When present in the dom the ittVideo directive
// will automatically change its size and position to overlay the magnet directive
.directive('ittVideoMagnet', ['timelineSvc', function(timelineSvc) {
	return {
		restrict: 'A',
		replace: false,
		scope: true,
		link: function(scope, iElement, iAttrs, controller) {
			
		}
	};
}]);