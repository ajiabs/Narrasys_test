'use strict';

angular.module('com.inthetelling.player')
	.directive('ittTimeline', function(modelSvc, timelineSvc) {
		return {
			restrict: 'A',
			replace: true,
			templateUrl: "templates/timeline.html",
			controller: "TimelineController",
			link: function(scope, element, attrs) {
//				console.log('ittTimeline', scope, element, attrs);

				scope.appState = modelSvc.appState;



			},

		};
	});
