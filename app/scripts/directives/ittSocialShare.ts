/**
 * Created by githop on 5/26/17.
 */
/**
 * Created by githop on 5/18/17.
 */

const TEMPLTE = `
<!--<span ng-repeat="provider in $ctrl.providers">-->
  <!--<a class="button" ng-class="'button-' + provider" ng-click="$ctrl.onShare(provider)"></a>-->
<!--</span>-->
<span>
  <a class="button button-facebook"></a>
  <a class="button button-linkedin"></a>
  <a class="button">asdf</a>
</span>
`;

type SupportedProviders = 'facebook' | 'twitter' | 'google' | 'linkedin' | 'email';
interface ISocialShareBindings {
  providers: SupportedProviders[];
  subdomain: string;
  paths: { narrative: string, timeline?: string };
}

class SocialShareController implements ng.IComponentController, ISocialShareBindings {
  static $inject = ['Socialshare'];
  providers: SupportedProviders[];
  subdomain: string;
  paths: {narrative: string, timeline?: string};
  stubUrl: string = 'https://thecareerplaybook.narrasys.com/narratives/jim-citrin';
  constructor(public Socialshare) {}

  $onInit() {
    //MVP only works in player, so require full timeline path
    if (this.subdomain && this.paths && this.paths.narrative && this.paths.timeline) {
      this.stubUrl = SocialShareController.formatShareUrl(this.subdomain, this.paths.narrative, this.paths.timeline);
    }
  }

  onShare(provider) {
    const shareConfig = {
      provider: provider,
      attrs: {
        socialshareUrl: this.stubUrl
      }
    };

    this.Socialshare.share(shareConfig);
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
