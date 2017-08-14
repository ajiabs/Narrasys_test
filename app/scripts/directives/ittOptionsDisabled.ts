/**
 * Created by githop on 8/9/16.
 */

//from: http://stackoverflow.com/a/16203547
export class OptionsDisabled implements ng.IDirective {
  restrict: string = 'EA';
  priority: number = 0;
  require: string = 'ngModel';
  static Name = 'npOptionsDisabled'; // tslint:disable-line
  static $inject = ['$parse'];
  constructor(private $parse) {
    //
  }

  static factory(): ng.IDirectiveFactory {
    // tldr angular.directive() does not work with constructors, it expects a factory that returns a DDO
    // this little trick is from: https://stackoverflow.com/a/29223535
    const directiveInstance = ($parse) => new OptionsDisabled($parse);
    directiveInstance.$inject = OptionsDisabled.$inject;
    return directiveInstance;
  }

  link(scope: ng.IScope, elm, attrs) {
    const expElements = attrs[OptionsDisabled.Name].match(/^\s*(.+)\s+for\s+(.+)\s+in\s+(.+)?\s*/);
    const attrToWatch = expElements[3];
    const fnDisableIfTrue = this.$parse(expElements[1]);

    scope.$watch(attrToWatch, (nv) => {
      if (nv) {
        OptionsDisabled._disableOptions(scope, expElements[2], elm, nv, fnDisableIfTrue);
      }
    });

    scope.$watch(attrs.ngModel, (nv) => {
      const disOptions = this.$parse(attrToWatch)(scope);
      if (nv) {
        OptionsDisabled._disableOptions(scope, expElements[2], elm, disOptions, fnDisableIfTrue);
      }
    });
  }

  private static _disableOptions(scope, attr, element, data, fnDisableIfTrue) {
    const options = element.find('option');
    let pos = 0, index = 0, locals;
    const len = options.length;
    for (; pos < len; pos++) {
      const elm = angular.element(options[pos]);

      if (elm.val() != '') { //tslint:disable-line
        locals = {};
        locals[attr] = data[index];
        elm.attr('disabled', fnDisableIfTrue(scope, locals));
        index++;
      }
    }
  }

}

// ittOptionsDisabled.$inject = ['$parse'];

// export default function ittOptionsDisabled($parse) {
//   return {
//     restrict: 'EA',
//     priority: 0,
//     require: 'ngModel',
//     link: link
//   };
//
//   function _disableOptions(scope, attr, element, data, fnDisableIfTrue) {
//     var options = element.find('option');
//     var pos = 0, index = 0, len = options.length, locals;
//     for (; pos < len; pos++) {
//       var elm = angular.element(options[pos]);
//
//       if (elm.val() != '') { //jshint ignore:line
//         locals = {};
//         locals[attr] = data[index];
//         elm.attr('disabled', fnDisableIfTrue(scope, locals));
//         index++;
//       }
//     }
//   }
//
//   function link(scope, elm, attrs) {
//     var expElements = attrs.ittOptionsDisabled.match(/^\s*(.+)\s+for\s+(.+)\s+in\s+(.+)?\s*/);
//     var attrToWatch = expElements[3];
//     var fnDisableIfTrue = $parse(expElements[1]);
//
//     scope.$watch(attrToWatch, function (nv) {
//       if (nv) {
//         _disableOptions(scope, expElements[2], elm, nv, fnDisableIfTrue);
//       }
//     }, true);
//
//     scope.$watch(attrs.ngModel, function (nv) {
//       var disOptions = $parse(attrToWatch)(scope);
//       if (nv) {
//         _disableOptions(scope, expElements[2], elm, disOptions, fnDisableIfTrue);
//       }
//     });
//   }
// }
