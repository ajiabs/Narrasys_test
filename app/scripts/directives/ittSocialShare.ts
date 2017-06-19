/**
 * Created by githop on 5/26/17.
 */
import {Partial} from '../interfaces';
import {IDataSvc} from '../services/dataSvc';
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
      <!--end share button row-->
      <!--copy link row-->
      <div>
        <p>Copy link</p>
        <div class="socialshare__clipboard">
          <itt-clipboard
            light="true"
            custom-notice="true"
            on-copy="$ctrl.ontextCopied($event)"
            source-text="{{$ctrl.stubUrl}}">
          </itt-clipboard>
          <div ng-if="$ctrl.TextCopied">
            <span class="button button-text-copied"></span>
            <span class="text--notice">(Link copied to clipboard)</span>
          </div>
        </div>
      </div>
      <!--end copy link row-->
      <!--email options-->
      <div class="socialshare__email-row" ng-if="$ctrl.emailshareExpanded">
        <div class="socialshare__email-from email-row--flex-half">
        <form name="emailshareForm">
          <span>
            <label for="ssFromName">From name</label>
            <input type="text" id="ssFromName" ng-model="email.from_name" required/>
          </span>
          <span>
            <label for="ssToName">To name</label>
            <input id="ssToName" type="text" ng-model="email.to_name" required/>
          </span>
        </div>
        <div class="socialshare__email-to email-row--flex-half">
          <span>
            <label for="ssFromEmail">From email</label>
            <input type="email" id="ssFromEmail" ng-model="email.from_email_address" required/>
          </span>
          <span>
            <label for="ssToEmail">To email</label>
            <input type="email" id="ssToEmail" ng-model="email.to_email_address" required/>
          </span>        
        </form>
        </div>
        <div class="socialshare__email-subject email-row--flex-full">
          <label for="ssSubject">Subject</label>
          <textarea id="ssSubject" ng-model="email.subject"></textarea>
        </div>
        <div class="email-row--flex-full">
          <button ng-click="$ctrl.handleEmailShare(email)" ng-disabled="emailshareForm.$invalid" type="submit">Send email</button>
        </div>
      </div>
      <!--end email options-->
      
    </div>
  </div>
  
</span>
`;

export interface IEmailFields {
  to_email_address: string;
  to_email_name: string;
  from_email_address: string;
  from_name: string;
  subject?: string;
}

type SupportedProviders = 'facebook' | 'twitter' | 'google' | 'linkedin' | 'email' | 'reddit';
interface ISocialShareBindings {
  providers: SupportedProviders[];
  subdomain: string;
  shareTitle?: string;
  paths: { narrative: string, timeline?: {url: string, id: string} };
}

class SocialShareController implements ng.IComponentController, ISocialShareBindings {
  // bindings
  providers: SupportedProviders[];
  subdomain: string;
  shareTitle?: string;
  paths: {narrative: string, timeline: {url: null, id: null}};
  // props
  stubUrl: string = 'https://thecareerplaybook.narrasys.com/narratives/jim-citrin';
  expanded: boolean = false;
  emailshareExpanded: boolean = false;
  textCopied: boolean = false;
  email: Partial<IEmailFields> = {};
  static $inject = ['Socialshare', 'dataSvc'];
  constructor(public Socialshare, private dataSvc: IDataSvc) {}

  $onInit() {
    //MVP only works in player, so require full timeline path
    if (this.subdomain && this.paths && this.paths.narrative && this.paths.timeline) {
      this.stubUrl = SocialShareController.formatShareUrl(this.subdomain, this.paths.narrative, this.paths.timeline.url);
    }
    console.log('huh?', this.paths.timeline);
  }

  onShare(provider: SupportedProviders) {
    // available providers, params: https://github.com/720kb/angular-socialshare
    const shareConfig = {
      provider: provider,
      attrs: {}
    };

    switch (provider) {
      case 'email':
        this._toggleEmailshare();
        return;
      case 'linkedin':
      case 'twitter':
      case 'reddit':
        // these providers in 720.kb use the socialshareText attr.
        Object.assign(shareConfig.attrs, {socialshareText: this.shareTitle}, {socialshareUrl: this.stubUrl});
        break;
      default:
        Object.assign(shareConfig.attrs, { socialshareUrl: this.stubUrl });
    }

    this.Socialshare.share(shareConfig);
  }

  toggleExpanded() {
    this.expanded = !this.expanded;
    this.textCopied = false;
  }

  onTextCopied(e: any) {
    this.textCopied = true;
  }

  handleEmailShare(email: IEmailFields) {
    console.log('sending email!', email);
    this.dataSvc.sendSocialshareEmail(this.paths.timeline.id, email)
      .then(resp => {this._toggleEmailshare();this.toggleExpanded()})
      .catch(e => console.log('error!', e));

  }

  private static formatShareUrl(subDomain: string, narrativePath: string, timelinePath:string): string {
    let protocol = 'https://';
    let rootDomain = '.narrasys.com/narratives/';
    return `${protocol}${subDomain}${rootDomain}${narrativePath}/${timelinePath}`;
  };

  private _toggleEmailshare() {
    this.emailshareExpanded = !this.emailshareExpanded;
  }

}

export class IttSocialShare implements ng.IComponentOptions {
  static Name: string = 'ittSocialShare';
  bindings: any = {
    providers: '<',
    subdomain: '@',
    shareTitle: '@',
    paths: '<'
  };
  template: string = TEMPLTE;
  controller = SocialShareController;
}
