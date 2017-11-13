// @npUpgrade-episode-true
const TEMPLATE = `
{{$ctrl.copyrightOrg}} player &#169;
<span ng-bind-html="$ctrl.now | date:'yyyy'"></span>
<a
  ng-href="//{{$ctrl.orgLinkUrl}}"
  target="_blank"
  rel="noopener noreferrer">{{$ctrl.orgLinkText}}</a>. All rights reserved.
<br>
<a href="/privacy.html" target="_blank">Privacy</a>
<span ng-if="$ctrl.supportUrl"> -
	<a ng-href="{{$ctrl.supportUrl}}">Support</a>
</span>
`;

interface ICopyrightBindings extends ng.IComponentController {
  org: 'np' | 'itt';
  supportUrl?: string;
}

class CopyrightController implements ICopyrightBindings {
  org: 'np' | 'itt';
  now: Date = new Date;
  itt = {
    copyrightOrg: 'TELLING STORY',
    orgLinkUrl: 'inthetelling.com',
    orgLinkText: 'IN THE TELLING'
  };
  np = {
    copyrightOrg: 'Narrative',
    orgLinkUrl: 'narrasys.com',
    orgLinkText: 'Narrasys'
  };

  get copyrightOrg() {
    return this[this.org].copyrightOrg;
  }

  get orgLinkUrl() {
    return this[this.org].orgLinkUrl;
  }

  get orgLinkText() {
    return this[this.org].orgLinkText;
  }
}


export class Copyright implements ng.IComponentOptions {
  bindings: any = {
    org: '@',
    supportUrl: '@'
  };
  template: string = TEMPLATE;
  controller = CopyrightController;
  static Name: string = 'npCopyright'; // tslint:disable-line
}
