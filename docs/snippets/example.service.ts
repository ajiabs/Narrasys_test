

export interface IExampleService {
  doSomething(): ng.IPromise<any>;
}

export class ExampleService {
  static Name = 'exampleService'; // tslint:disable-line
  constructor(private $http: ng.IHttpService) {

  }

  doSomething() {
    return this.$http.get('https://swapi.co/api/people/1');
  }
}
