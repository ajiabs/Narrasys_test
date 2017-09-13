import { ITemplateData } from './episode/templateMap';

const TEMPLATE = `
<div ng-if="$ctrl.appState.viewMode != 'watch'" ng-class="$ctrl.brandingDivClass">

  <div ng-if="$ctrl.templateData.pro" class="branding--content">
    <np-copyright org="np" class="professional__copyright"></np-copyright>
      <a class="professional__logo">
        <img ng-src="{{$ctrl.templateData.logos[0].src}}"/>
      </a>
  </div>
  
  <a
    ng-if="!$ctrl.templateData.pro"
    ng-repeat="logoImg in $ctrl.templateData.logos"
    ng-class="logoImg.cssClass"
    ng-href="logoImg.link"
    target="_blank"
    rel="noopener noreferrer">
      <img ng-src="{{logoImg.src}}" alt="{{logoImg.alt}}"/>
  </a>
  <np-copyright ng-if="!$ctrl.templateData.pro" class="copyright" org="itt"></np-copyright>
</div>
<div ng-if="$ctrl.templateData.bannerLogo != null" ng-class="$ctrl.templateData.bannerLogo.cssClass">
  <img
    ng-if="$ctrl.templateData.bannerLogo.src"
    ng-src="{{$ctrl.templateData.bannerLogo.src}}"
    alt="{{ctrl.templateData.bannerLogo.alt}}"/>
</div>
`;

interface IEpisodeFooterBindings extends ng.IComponentController {
  templateData: ITemplateData;
}

class EpisodeFooterController implements IEpisodeFooterBindings {
  templateData: ITemplateData;
  brandingDivClass: string;
  static $inject = ['appState'];
  constructor(public appState) {
    //
  }

  $onChanges(changesObj) {
    const legacyFooterClass = 'branding footer';
    const proFooterClass = 'professional__branding';
    if (!changesObj.templateData.isFirstChange()) {
      if (this.templateData.pro) {
        this.brandingDivClass = proFooterClass;

        if (this.templateData.cssClass === 'professional unbranded') {
          this.brandingDivClass = `${legacyFooterClass} ${proFooterClass}`;
        }

      } else {
        this.brandingDivClass = legacyFooterClass;
      }

      console.log('ok class?', this.brandingDivClass, this.templateData);
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
