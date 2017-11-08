import { IEpisodeTemplate } from '../../../models';
const TEMPLATE = `
<div ng-if="$ctrl.appState.viewMode != 'watch'" ng-class="$ctrl.brandingDivClass">

  <div ng-if="$ctrl.proTemplate" class="branding--content">
    <np-copyright org="np" class="professional__copyright"></np-copyright>  
    <div class="professional__logo"></div>
  </div>
  
  <a
    ng-if="!$ctrl.proTemplate"
    ng-repeat="logoImg in $ctrl.logos"
    ng-class="logoImg.css_class"
    ng-href="{{logoImg.url}}"
    target="_blank"
    rel="noopener noreferrer">
      <img ng-src="{{logoImg.src}}" alt="{{logoImg.alt_text}}"/>
  </a>
  <np-copyright ng-if="!$ctrl.proTemplate" class="copyright" org="np"></np-copyright>
</div>

<div ng-if="$ctrl.bannerLogo != null" ng-class="$ctrl.bannerLogo.css_class">
  <img
    ng-if="$ctrl.bannerLogo.src"
    ng-src="{{$ctrl.bannerLogo.src}}"
    alt="{{ctrl.bannerLogo.alt_text}}"/>
</div>
`;

interface IEpisodeFooterBindings extends ng.IComponentController {
  templateData: IEpisodeTemplate;
}

class EpisodeFooterController implements IEpisodeFooterBindings {
  templateData: IEpisodeTemplate;
  brandingDivClass: string;
  static $inject = ['appState'];
  constructor(public appState) {
    //
  }

  get proTemplate() {
    if (this.templateData) {
      return this.templateData.pro_episode_template;
    }
  }

  get bannerLogo() {
    if (this.templateData && this.templateData.css_configuration != null) {
      return this.templateData.css_configuration.legacy_banner_logo;
    }
  }

  get logos() {
    if (this.templateData && this.templateData.css_configuration != null) {
      return this.templateData.css_configuration.legacy_logos;
    }
  }

  $onChanges(changesObj) {
    const legacyFooterClass = 'branding footer';
    const proFooterClass = 'professional__branding';
    if (!changesObj.templateData.isFirstChange()) {
      if (this.templateData.pro_episode_template) {
        this.brandingDivClass = proFooterClass;
      } else {
        this.brandingDivClass = legacyFooterClass;
      }
    }
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
