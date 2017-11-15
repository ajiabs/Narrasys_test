export class DynamicEventTemplate implements ng.IDirective {
  restrict: string = 'A';
  static Name = 'npDynamicEventTemplate'; // tslint:disable-line
  static $inject = ['$compile'];
  constructor(private $compile: ng.ICompileService) {
    //
  }

  static factory(): ng.IDirectiveFactory {
    const directiveInstance = (dynamicTemplateService) => new DynamicEventTemplate(dynamicTemplateService);
    directiveInstance.$inject = DynamicEventTemplate.$inject;
    return directiveInstance;
  }

  link(scope: ng.IScope, elm: JQuery, attrs: any): void {
    const template = `<span np-${attrs.componentName}-template></span>`;
    elm.append(this.$compile(template)(scope));
  }
}
