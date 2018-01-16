// @npUpgrade-inputFields-true
/**
 * Created by githop on 7/1/16.
 */


export class DynamicModel implements ng.IDirective {
  restrict: string = 'A';
  terminal = true;
  priority = 100000;
  static Name = 'npDynamicModel';
  static $inject = ['$compile', '$parse'];

  constructor(private $compile: ng.ICompileService, private $parse: ng.IParseService) {
    //
  }

  static factory(): ng.IDirectiveFactory {
    const directiveInstance = ($compile, $parse) => new DynamicModel($compile, $parse);
    directiveInstance.$inject = DynamicModel.$inject;
    return directiveInstance;
  }

  link(scope: ng.IScope, elm: JQuery): void {
    const name = this.$parse(elm.attr('np-dynamic-model'))(scope);
    elm.removeAttr('np-dynamic-model');
    elm.attr('ng-model', name);
    this.$compile(elm)(scope);
  }
}

ittDynamicModel.$inject = ['$compile', '$parse'];

//http://stackoverflow.com/a/32096328
export default function ittDynamicModel($compile, $parse) {
  return {
    restrict: 'A',
    terminal: true,
    priority: 100000,
    link: function (scope, elem) {
      var name = $parse(elem.attr('itt-dynamic-model'))(scope);
      elem.removeAttr('itt-dynamic-model');
      elem.attr('ng-model', name);
      $compile(elem)(scope);
    }
  };
}

