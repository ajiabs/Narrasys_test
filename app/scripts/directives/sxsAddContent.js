'use strict';

/*
 The "add" buttons for instructors to choose what type of content they want to add to the episode.

 TODO make this smarter about when it shows buttons; for example instead of matching against appState.time,
 look for current scene.id matching "internal".  Dim buttons instead of hiding them completely.

 */

angular.module('com.inthetelling.story')
  .directive('sxsAddContent', sxsAddContent);

sxsAddContent.$inject = ['appState', 'playbackService'];

function sxsAddContent(appState, playbackService) {
  return {
    restrict: 'A',
    replace: true,
    scope: {},
    templateUrl: 'templates/producer/addcontent.html',
    controller: 'EditController',
    link: function (scope) {

      scope.appState = appState;
      scope.playbackService = playbackService;

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
