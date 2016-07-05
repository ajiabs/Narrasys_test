'use strict';

/*
 The "add" buttons for instructors to choose what type of content they want to add to the episode.

 TODO make this smarter about when it shows buttons; for example instead of matching against appState.time,
 look for current scene.id matching "internal".  Dim buttons instead of hiding them completely.

 */
sxsAddContent.$inject = ['appState'];
export default function sxsAddContent(appState) {
	return {
		restrict: 'A',
		replace: true,
		scope: {},
		//template: '<div ng-include="item.templateUrl"></div>',
		templateUrl: 'templates/producer/addcontent.html',
		controller: 'EditController',
		link: function (scope) {

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
}
