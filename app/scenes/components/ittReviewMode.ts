/* it appears this is prototype code and not in use anywhere. */
// Force scenes to render scenes sequentially instead of all in one ng-repeat, because it looks faster that way.

// (why don't all ng-repeats do this?  More to the point, why don't all of OUR ng-repeats do this?)

// NOTE this is only used in the "review mode", not in the new combined search/review

ittReviewMode.$inject = ['$timeout', 'appState'];

export default function ittReviewMode($timeout, appState) {
  return {
    restrict: 'A',
    replace: false,
    scope: {
      allScenes: '=ittReviewMode'
    },
    templateUrl: 'templates/episode/components/reviewmode-scenes.html',
    link: function (scope) {
      // console.log('ittReviewMode', scope);

      // scope.scenes is what is being displayed right now. scope.allScenes is a reference to the original episode data,
      // which is handy if the episode data hasn't loaded before this gets invoked.
      scope.appState = appState;

      scope.scenes = [];

      var delay = 100; // would be better if there were a way to directly determine whether the prev scene has finished rendering, but this will do for now
      var cur = 0;
      scope.isLoading = true;

      // Was just rendering one scene at a time, but with a lot scenes that can be a different kind of slow.
      // So we'll ramp up gradually rendering more and more each iteration:
      var fib = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, Infinity];

      scope.addOne = function () {
        cur++;
        if (scope.allScenes) {
          scope.scenes = scope.allScenes.slice(0, fib[cur]);
          // console.log("scope.scenes length is ",scope.scenes.length);
          if (cur < scope.allScenes.length) {
            $timeout(scope.addOne, delay);
          } else {
            scope.isLoading = false;
            scope.scenes = scope.allScenes; // swap in the original data reference once we think we're done loading, so in case users start adding new scenes later we're not stuck with a partial slice
            // console.log("stopping");
          }
        } else {
          // No scenes loaded yet, so wait for them and try again.  (TODO see if this still works ok if users are editing or adding scenes while in review mode)
          var loadWatcher = scope.$watch(function () {
            return scope.allScenes;
          }, function () {
            if (scope.allScenes) {
              loadWatcher();
              scope.addOne();
            }
          });
        }
      };
      $timeout(scope.addOne, delay);
    }
  };
}
