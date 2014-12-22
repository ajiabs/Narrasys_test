'use strict';
angular.module('com.inthetelling.story')
	.directive('ittContainer', function (modelSvc, recursionHelper, dataSvc) {
		return {
			restrict: 'A',
			replace: false,
			scope: {
				container: '=ittContainer',
				depth: "=depth"
			},
			templateUrl: "templates/container.html",

			compile: function (element) {
				// Use the compile function from the recursionHelper,
				// And return the linking function(s) which it returns
				return recursionHelper.compile(element, function (scope) {
					scope.containers = modelSvc.containers;

					scope.containerTypes = ["Customer", "Course", "Session", "Episode"];

					scope.toggleChildren = function () {
						if (scope.container.children) {

							console.log("have already loaded kids");
							scope.container.showChildren = !scope.container.showChildren;

						} else {
							dataSvc.getSingleContainer(scope.container._id).then(function (id) {
								console.log("newly loaded", modelSvc.containers[id]);
								scope.container = modelSvc.containers[id];
								scope.container.showChildren = true;
							});

						}
					};

				});
			}
		};

	});
