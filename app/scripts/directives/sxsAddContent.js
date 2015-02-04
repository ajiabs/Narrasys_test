'use strict';

/* The "add" buttons for instructors to choose what type of content they want to add to the episode */

angular.module('com.inthetelling.story')
	.directive('sxsAddContent', function (appState) {
		return {
			restrict: 'A',
			replace: true,
			scope: {},
			//template: '<div ng-include="item.templateUrl"></div>',
			templateUrl: 'templates/producer/addcontent.html',
			controller: 'EditController',
			link: function (scope) {
				/* 
				TODO: hide buttons for items that can't be added at this timepoint 
				(any time that matches a stop video item) 
				*/

				scope.appState = appState;

				scope.expand = function () {
					scope.expanded = true;
					angular.element(document).one('mouseup.addcontent', function () {
						scope.collapse();
					});
				};

				scope.collapse = function () {
					scope.expanded = false;
				};

			}

		};
	});
