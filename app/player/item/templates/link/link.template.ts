

import linkHtml from './link.html';
import { EventTemplates, componentTemplateNameify } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.LINK_TEMPLATE);
export class LinkTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = linkHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new LinkTemplate();
  }
}
