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
    attrs.$observe('componentName', (v) => {
      if (v != null) {
        console.log('fuck', template);
        elm.replaceWith(this.$compile(template)(scope));
      }
    });
  }
}
