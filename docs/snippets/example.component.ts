// this can be copied and used when ever you need a base template for an angularJS
// component

import { IExampleService } from './example.service';

const TEMPLATE = ``;

interface IExampleBindings extends ng.IComponentController {

}

class ExampleController implements IExampleBindings {
  static $inject = [];

  constructor() {
    //
  }

  $onInit() {
    //
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class Example implements ng.IComponentOptions {
  bindings: IComponentBindings = {};
  template: string = TEMPLATE;
  controller = ExampleController;
  static Name: string = 'npExample'; // tslint:disable-line
}

// here is a more invovled example
const TEMPLATEB = `
<div>Hi {{$ctrl.name}}

<button ng-click="$ctrl.callApi()">Call API</button>
</div>
`;

interface IExampleBBindings extends ng.IComponentController {
  name: string;
}

class ExampleBController implements IExampleBBindings {
  name: string;
  static $inject = ['exampleService'];

  constructor(private exampleService: IExampleService) {
    //
  }

  $onInit() {
    //
  }

  callApi() {
    this.exampleService.doSomething()
      .then((resp) => {
        // do something with the response
      });
  }
}

export class ExampleB implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    name: '<'
  };
  template: string = TEMPLATEB;
  controller = ExampleBController;
  static Name: string = 'npExampleB'; // tslint:disable-line
}


