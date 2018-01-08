

import linkDescriptionfirstHtml from './link-descriptionfirst.html';
import { EventTemplates, componentTemplateNameify } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.LINK_DESCRIPTION_FIRST_TEMPLATE);
export class LinkDescriptionfirstTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = linkDescriptionfirstHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new LinkDescriptionfirstTemplate();
  }
}
