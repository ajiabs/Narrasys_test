// @npUpgrade-inputFields-true
// attach to any directive to make its first input/textarea autofocus

export class Autofocus implements ng.IDirective {
  restrict: string = 'A';
  static Name = 'npAutofocus';
  static $inject = ['$timeout'];
  constructor() {
    //
  }

  static factory(): ng.IDirectiveFactory {
    const directiveInstance = () => new Autofocus();
    directiveInstance.$inject = Autofocus.$inject;
    return directiveInstance;
  }

  link(scope: ng.IScope, element: JQuery, attrs: ng.IAttributes): void {
    this.$timeout(() => { // give any child directives time to render themselves...
      if (element[0].tagName === 'TEXTAREA' || element[0].tagName === 'INPUT') {
        element[0].focus();
      } else {
        element.find('input,textarea')[0].focus();
      }
    });
  }
}


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
