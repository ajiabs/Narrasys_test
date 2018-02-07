import { ExampleDirective, ExampleDirectiveB } from './example.directive';
import { Example, ExampleB } from './example.component';
import { ExampleService } from './example.service';

const exampleModule = angular.module('exampleModule', []);

const directives = [
  ExampleDirective,
  ExampleDirectiveB
];

const components = [
  Example,
  ExampleB
];

const services = [
  ExampleService
];

// One of the opinionated conventions I have setup in the code base is
// requiring that all classes (for components, directives, services) have
// a static property called 'Name' which is the string value that is used
// to register the class with the framework.

directives.forEach((directive) => {
  exampleModule.directive(directive.Name, directive.factory());
});

components.forEach((component) => {
  exampleModule.component(component.Name, new component());
});

services.forEach((service) => {
  exampleModule.service(service.Name, service);
});
