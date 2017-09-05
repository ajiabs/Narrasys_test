const TEMPLATE = `
<div ng-if="$ctrl.appState.viewMode != 'watch'" ng-class="$ctrl.brandingDivClass">
  <span ng-switch on="$ctrl.footerType">
    <span ng-switch-when="professional">
      <div class="branding--content">
        <np-copyright org="np" class="professional__copyright"></np-copyright>
        <a class="progessional__logo">
          <img ng-src="{{}}"/>
        </a>
      </div>
    </span>
    <span ng-switch-when="legacy">
      <a ng-if=""
        ng-repeat=""
        ng-class="" ng-href="" target="_blank" rel="noopener noreferrer">
        <img ng-src="" alt=""/>
      </a>
      
      <np-copyright org="itt"></np-copyright>
    </span>
  </span>
</div>
<div ng-class="$ctrl.bannerClass">
  <img ng-if="" ng-src="{{}}" alt="{{}}"/>
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
