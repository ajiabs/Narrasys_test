/**
 * Created by githop on 5/26/17.
 */
/**
 * Created by githop on 5/18/17.
 */

const TEMPLTE = `
<span class="itt-socialshare">

  <span ng-if="!$ctrl.expanded">
    <a class="button button-facebook" ng-click="$ctrl.onShare('facebook')"></a>
    <a class="button button-linkedin" ng-click="$ctrl.onShare('linkedin')"></a>
    <a class="button button-share" ng-click="$ctrl.toggleExpanded()"></a>
  </span>
  
  <div class="socialshare__row" ng-if="$ctrl.expanded">
    <button class="socialshare__exit"
      ng-click="$ctrl.toggleExpanded()">
        <i class="fa fa-times-circle"></i>
    </button>
    <div class="socialshare__row--expanded"">
      <div>
        <!--share button row-->
        <p>Share episode</p>
        <a ng-repeat="provider in $ctrl.providers"
           class="button"
           ng-click="$ctrl.onShare(provider)"
           ng-class="'button-' + provider">
        </a>
      </div>
      <!--copy link row-->
      <div>
        <p>Copy link</p>
        <div class="socialshare__clipboard">
          <itt-clipboard
            light="true"
            custom-notice="true"
            on-copy="$ctrl.textCopied($event)"
            source-text="{{$ctrl.stubUrl}}">
          </itt-clipboard>
          <div ng-if="$ctrl._textCopied">
            <span class="button button-text-copied"></span>
            <span class="text--notice">(Link copied to clipboard)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  
</span>
`;

type SupportedProviders = 'facebook' | 'twitter' | 'google' | 'linkedin' | 'email' | 'reddit';
interface ISocialShareBindings {
  providers: SupportedProviders[];
  subdomain: string;
  paths: { narrative: string, timeline?: string };
}

class SocialShareController implements ng.IComponentController, ISocialShareBindings {
  // bindings
  assetIds: string[];
  providers: SupportedProviders[];
  subdomain: string;
  // props
  paths: {narrative: string, timeline?: string};
  stubUrl: string = 'https://thecareerplaybook.narrasys.com/narratives/jim-citrin';
  expanded: boolean = false;
  _textCopied: boolean = false;
  static $inject = ['Socialshare'];
  constructor(public Socialshare) {}

  $onInit() {
    //MVP only works in player, so require full timeline path
    if (this.subdomain && this.paths && this.paths.narrative && this.paths.timeline) {
      this.stubUrl = SocialShareController.formatShareUrl(this.subdomain, this.paths.narrative, this.paths.timeline);
    }
  }

  onShare(provider) {
    // available providers, params: https://github.com/720kb/angular-socialshare
    const shareConfig = {
      provider: provider,
      attrs: {}
    };

    switch (provider) {
      case 'email':
        Object.assign(shareConfig.attrs, { socialshareBody: this.stubUrl });
        break;
      default:
        Object.assign(shareConfig.attrs, { socialshareUrl: this.stubUrl });
    }

    this.Socialshare.share(shareConfig);
  }

  toggleExpanded() {
    this.expanded = !this.expanded;
    this._textCopied = false;
  }

  textCopied(e: any) {
    this._textCopied = true;
  }

  private static formatShareUrl(subDomain: string, narrativePath: string, timelinePath:string): string {
    let protocol = 'https://';
    let rootDomain = '.narrasys.com/narratives/';
    return `${protocol}${subDomain}${rootDomain}${narrativePath}/${timelinePath}`;
  };

}

export class IttSocialShare implements ng.IComponentOptions {
  static Name: string = 'ittSocialShare';
  bindings: any = {
    providers: '<',
    subdomain: '@',
    paths: '<'
  };
  template: string = TEMPLTE;
  controller = SocialShareController;
}
