// @npUpgrade-player-false
// Was a 'panel' in the old three-modes style.  New layout combined search with review mode, still uses this.
// Maybe rename it after we finally migrate completely away from the three-modes layout.

ittSearchPanel.$inject = ['appState'];

export default function ittSearchPanel(appState) {
  return {
    restrict: 'A',
    replace: true,
    scope: true,
    templateUrl: 'templates/searchpanel.html',
    controller: 'SearchPanelController',
    link: function (scope) {

      scope.appState = appState;

      // $timeout(function () {
      // console.log("ittSearchPanel", scope);
      scope.indexEvents();
      // });
    }
  };
}
