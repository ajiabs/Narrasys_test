'use strict';

angular.module('com.inthetelling.player')
	.directive('ittScene', function () {
		return {
			restrict: 'A',
			replace: true,
			scope: {
				scene: '=ittScene'
			},
			templateUrl: 'templates/scene/scene.html',
			//template: '<div ng-include="scene.templateUrl">Loading Item...</div>',
			controller: 'SceneController',
			link: function (scope, element, attrs) {
				console.log('ittScene', scope, element, attrs);

				// TEMPORARY
				if (scope.scene.templateUrl.match(/landingscreen/)) {
					scope.landingscreen = true;
				}

			},

		};
	});
