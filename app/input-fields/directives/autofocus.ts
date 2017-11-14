// @npUpgrade-inputFields-false
// attach to any directive to make its first input/textarea autofocus
autofocus.$inject = ['$timeout'];

export default function autofocus($timeout) {
  return {
    link: function (scope, element) {
      $timeout(function () { // give any child directives time to render themselves...
        if (element[0].tagName === 'TEXTAREA' || element[0].tagName === 'INPUT') {
          element[0].focus();
        } else {
          element.find('input,textarea')[0].focus();
        }
      });
    }
  };
}
