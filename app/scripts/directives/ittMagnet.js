'use strict';

// This never worked the way it was supposed to, involved a bizarre number of events being passed around for a fairly simple action,
// and was killing performance.

// I'm putting it to bed.  Instead of having to put watchers and broadcasters on every single magnet all the time,
// we'll keep a singleton active magnet in (for now) rootscope and let the magnetized elements use that as their target.

angular.module('com.inthetelling.player')
	.directive('ittMagnet', function ($window, $timeout, $rootScope) {
		return {
			restrict: 'A',
			replace: true,
			scope: true,
			link: function (scope, element, attrs, controller) {

			}
		};
	});
