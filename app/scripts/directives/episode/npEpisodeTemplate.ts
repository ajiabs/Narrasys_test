const TEMPLATE = `

`;

interface IEpisodeTemplateBindings extends ng.IComponentController {

}

class EpisodeTemplateController implements IEpisodeTemplateBindings {
  static $inject = [];

  constructor() {
    //
  }

  $onInit() {
    //
  }
}


export class EpisodeTemplate implements ng.IComponentOptions {
  bindings: any = {};
  template: string = TEMPLATE;
  controller = EpisodeTemplateController;
  static Name: string = 'npEpisodeTemplate'; // tslint:disable-line
}
