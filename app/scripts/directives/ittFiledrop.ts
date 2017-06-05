/**
 * Created by githop on 6/5/17.
 */

const TEMPLATE = `
<div>

  <div></div>

</div>
`;

class FiledropController implements ng.IComponentController {
  static $inject = [];
  constructor(){

  }
}


export class Filedrop implements ng.IComponentOptions {
  static Name: string = 'ittFiledrop';
  bindings: any = {

  };
  template: string = TEMPLATE;
  controller: ng.IComponentController = FiledropController;
}
