

import linkDescriptionfirstHtml from './link-descriptionfirst.html';

export class LinkDescriptionfirstTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = linkDescriptionfirstHtml;
  scope = true;
  static Name = 'npLinkDescriptionfirstTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new LinkDescriptionfirstTemplate();
  }
}
