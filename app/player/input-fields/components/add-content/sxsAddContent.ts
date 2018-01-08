// @npUpgrade-inputFields-false
/*
 The "add" buttons for instructors to choose what type of content they want to add to the episode.

 TODO make this smarter about when it shows buttons; for example instead of matching against appState.time,
 look for current scene.id matching "internal".  Dim buttons instead of hiding them completely.

 */

import addcontentHtml from './addcontent.html';
sxsAddContent.$inject = ['appState', 'playbackService'];

export default function sxsAddContent(appState, playbackService) {
  return {
    restrict: 'A',
    replace: true,
    template: addcontentHtml,
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
