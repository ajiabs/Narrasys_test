// @npUpgrade-stories-true
/**
 * Created by githop on 5/26/17.
 */
import { Partial } from '../../../interfaces';
import { IDataSvc } from '../../../shared/services/dataSvc/dataSvc';
import socialShareHtml from './social-share.html';

/**
 * Created by githop on 5/18/17.
 */

export interface IEmailFields {
  to_email_address: string;
  to_email_name: string;
  from_email_address: string;
  from_name: string;
  subject: string;
  message: string;
  sender_copy: boolean;
}

type SupportedProviders = 'facebook' | 'twitter' | 'google' | 'linkedin' | 'email' | 'reddit';

interface ISocialShareBindings {
  providers: SupportedProviders[];
  subdomain: string;
  shareTitle?: string;
  paths: { narrative: string, timeline?: { url: string, id: string } };
}

class SocialShareController implements ng.IComponentController, ISocialShareBindings {
  // bindings
  providers: SupportedProviders[];
  subdomain: string;
  shareTitle?: string;
  paths: { narrative: string, timeline: { url: null, id: null } };
  // props
  stubUrl: string = 'https://thecareerplaybook.narrasys.com/narratives/jim-citrin';
  expanded: boolean = false;
  emailshareExpanded: boolean = false;
  textCopied: boolean = false;
  email: Partial<IEmailFields> = {};
  static $inject = ['Socialshare', 'dataSvc'];

  constructor(public Socialshare, private dataSvc: IDataSvc) { // tslint:disable-line
   //
  }

  $onInit() {
    //MVP only works in player, so require full timeline path
    if (this.subdomain && this.paths && this.paths.narrative && this.paths.timeline) {
      this.stubUrl = SocialShareController.formatShareUrl(
        this.subdomain, this.paths.narrative, this.paths.timeline.url
      );
    }
  }

  onShare(provider: SupportedProviders) {
    // available providers, params: https://github.com/720kb/angular-socialshare
    const shareConfig = {
      provider,
      attrs: {}
    };

    switch (provider) {
      case 'email':
        this.toggleEmailshare();
        return;
      case 'linkedin':
      case 'twitter':
      case 'reddit':
        // these providers in 720.kb use the socialshareText attr.
        Object.assign(shareConfig.attrs, { socialshareText: this.shareTitle }, { socialshareUrl: this.stubUrl });
        break;
      default:
        Object.assign(shareConfig.attrs, { socialshareUrl: this.stubUrl });
    }

    this.Socialshare.share(shareConfig);
    this.closeAll();
  }

  toggleExpanded() {
    this.expanded = !this.expanded;
    this.textCopied = false;
    this.emailshareExpanded = false;
  }

  ontextCopied(e: any) {
    this.textCopied = true;
  }

  handleEmailShare(email: IEmailFields, ngForm: ng.IFormController) {
    if (ngForm.$invalid) {
      ngForm.$error.required.forEach((field: any) => {
        field.$setTouched();
      });
      return;
    }
    this.dataSvc.sendSocialshareEmail(this.paths.timeline.id, email)
      .then(resp => this.closeAll())
      .catch(e => console.log('error!', e));

  }

  private static formatShareUrl(subDomain: string, narrativePath: string, timelinePath: string): string {
    const protocol = 'https://';
    const rootDomain = '.narrasys.com/narratives/';
    return `${protocol}${subDomain}${rootDomain}${narrativePath}/${timelinePath}`;
  }

  private closeAll() {
    this.expanded = false;
    this.textCopied = false;
    this.emailshareExpanded = false;
  }

  private toggleEmailshare() {
    this.emailshareExpanded = !this.emailshareExpanded;
  }

}

export class SocialShare implements ng.IComponentOptions {
  bindings: any = {
    providers: '<',
    subdomain: '@',
    shareTitle: '@',
    paths: '<'
  };
  template: string = socialShareHtml;
  controller = SocialShareController;
  static Name: string = 'ittSocialShare'; // tslint:disable-line
}
