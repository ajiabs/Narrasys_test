// @npUpgrade-inputFields-true
/**
 * Created by githop on 7/1/16.
 */

export class DynamicModel implements ng.IDirective {
  restrict: string = 'A';
  terminal = true;
  priority = 100000;
  static Name = 'npDynamicModel'; //tslint:disable-line
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

