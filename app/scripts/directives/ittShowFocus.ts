ittShowFocus.$inject = ['$timeout'];

export default function ittShowFocus($timeout) {
  return function (scope, element, attrs) {
    scope.$watch(attrs.ittShowFocus,
      function (newValue) {
        $timeout(function () {
          /* jshint -W030 */
          newValue && element.filter(':visible')
            .first()
            .focus();
          /* jshint +W030 */
        });
      }, true);

  };
}
