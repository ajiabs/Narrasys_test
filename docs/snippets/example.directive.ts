
// this is a Class that, when called via the static factory method,
// will return a instance of the directive that can be registered with
// and AngularJS module.
// The Class itself has all of the properties of the Directive Definition Object.

import { IExampleService } from './example.service';

export class ExampleDirective implements ng.IDirective {
  restrict: string = 'A';
  static Name = 'npExampleDirective'; //tslint:disable-line
  static $inject = [];

  constructor() {
    //
  }

  static factory(): ng.IDirectiveFactory {
    const directiveInstance = () => new ExampleDirective();
    directiveInstance.$inject = ExampleDirective.$inject;
    return directiveInstance;
  }

  link(scope: ng.IScope, elm: JQuery, attrs: ng.IAttributes): void {
    //
  }
}

// Here is an Angular Directive with an input and a controller.
// If we were to add a template to this directive, it would
// be a component, as in AngularJS 1.5, the .component() method
// is just a short hand way to create a directive with sensible defaults that
// will be easy to upgrade to Angular.
export class ExampleDirectiveB implements ng.IDirective {
  restrict: string = 'A';
  scope: {
    name: '<'
  };
  controller = class ExampleDirectiveBController {
    name: string;
    static $inject = [];
    constructor() {
      // if you do not need to use the link function and the directive has a controller,
      // dependencies can be injected directly into the controller. (not done in this example)
    }
    $onInit() {
      console.log('hello!', this.name);
    }
  };
  bindToController = true;
  controllerAs: '$ctrl';
  static Name = 'npExampleDirective'; //tslint:disable-line
  static $inject = ['exampleService'];

  constructor(private exampleService: IExampleService) {
    //
  }

  static factory(): ng.IDirectiveFactory {
    const directiveInstance = (exampleService: IExampleService) => new ExampleDirectiveB(exampleService);
    directiveInstance.$inject = ExampleDirective.$inject;
    return directiveInstance;
  }

  link(scope: ng.IScope, elm: JQuery, attrs: ng.IAttributes): void {
    // if you need to access a dependency in the link function, it must be added to the
    // static $inject array of the Directive class NOT the directives controller.
    //
    this.exampleService.doSomething();
  }
}
