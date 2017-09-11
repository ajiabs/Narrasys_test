const TEMPLATE = `
<div ng-class="episode.styleCss">

  <div class="fill" ng-class="episode.templateData.fillClass" ng-if="episode.templateData.fillClass != null">
    <div ng-if="episode.templateData.fillClass === 'gwsb-seal'" class="fill"></div>
  </div>

  <span ng-include="'templates/episode/components/reviewmode.html'"></span>
  <span ng-include="'templates/episode/components/watchmode.html'"></span>
  <span ng-repeat="scene in episode.scenes | isCurrent"
        ng-include="'templates/episode/components/discovermode.html'"></span>
  <span ng-include="'templates/episode/components/video.html'"></span>
  <span ng-include="'templates/episode/components/windowfg.html'"></span>
  
  <np-episode-footer templateData="episode.templateData"></np-episode-footer>
  
</div>

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
  bindings: any = {
    episode: '<'
  };
  template: string = TEMPLATE;
  controller = EpisodeTemplateController;
  static Name: string = 'npEpisodeTemplate'; // tslint:disable-line
}
