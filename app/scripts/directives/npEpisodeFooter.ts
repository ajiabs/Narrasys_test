const TEMPLATE = `
<div ng-if="$ctrl.appState.viewMode != 'watch'" ng-class="$ctrl.brandingDivClass">

  <div ng-if="$ctrl.templateData.pro" class="branding--content">
    <np-copyright org="np" class="professional__copyright"></np-copyright>
      <a class="progessional__logo">
        <img ng-src="{{$ctrl.templateData.logos[0].src}}"/>
      </a>
  </div>
  
  <div ng-if="!$ctrl.templateData.pro">
    <a
      ng-repeat="logoImg in $ctrl.templateData.logos"
      ng-if="logImg.src"
      ng-class="logoImg.cssClass"
      ng-href="logoImg."
      target="_blank"
      rel="noopener noreferrer">
        <img ng-src="" alt=""/>
    </a>
    <np-copyright org="itt"></np-copyright>
  </div>
</div>
<div ng-if="$ctrl.templateData.bannerLogo != null" ng-class="$ctrl.templateData.bannerLogo.cssClass">
  <img
    ng-if="$ctrl.templateData.bannerLogo.src"
    ng-src="{{$ctrl.templateData.bannerLogo.src}}"
    alt="{{ctrl.templateData.bannerLogo.alt}}"/>
</div>
`;

interface IEpisodeFooterBindings extends ng.IComponentController {
  templateData: any;
}

class EpisodeFooterController implements IEpisodeFooterBindings {
  templateData: any;
  static $inject = ['appState'];
  constructor(public appState) {
    //
  }

  $onInit() {
    //
  }
}


export class EpisodeFooter implements ng.IComponentOptions {
  bindings: any = {
    templateData: '<'
  };
  template: string = TEMPLATE;
  controller = EpisodeFooterController;
  static Name: string = 'npEpisodeFooter'; // tslint:disable-line
}
