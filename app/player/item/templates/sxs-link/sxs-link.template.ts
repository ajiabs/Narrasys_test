
import sxsLinkHtml from './sxs-link.html';
import { EventTemplates, componentTemplateNameify } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.SXS_LINK_TEMPLATE);
export class SxsLinkTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = sxsLinkHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new SxsLinkTemplate();
  }
}
