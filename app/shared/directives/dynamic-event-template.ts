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
    const compiled = this.$compile(template)(scope);
    elm.append(compiled);
  }
}

export class DynamicEditorTemplate implements ng.IDirective {
  restrict: string = 'A';
  static Name = 'npDynamicEditorTemplate'; // tslint:disable-line
  static $inject = ['$compile'];
  constructor(private $compile: ng.ICompileService) {
    //
  }

  static factory(): ng.IDirectiveFactory {
    const directiveInstance = ($compile) => new DynamicEditorTemplate($compile);
    directiveInstance.$inject = DynamicEditorTemplate.$inject;
    return directiveInstance;
  }

  link(scope: ng.IScope, elm: JQuery, attrs: any): void {
    // hard coded for test
    const template =
      `<span np-${attrs.componentName}-template item="$ctrl.item" on-update="${attrs.onUpdate}"></span>`;
    const compiled = this.$compile(template)(scope);
    elm.append(compiled);
  }
}
