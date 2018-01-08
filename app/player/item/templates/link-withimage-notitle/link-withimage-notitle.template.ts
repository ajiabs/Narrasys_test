
import linkWithimageNotitleHtml from './link-withimage-notitle.html';
import { EventTemplates, componentTemplateNameify } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.LINK_WITHIMAGE_NOTITLE_TEMPLATE);
export class LinkWithimageNotitleTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = linkWithimageNotitleHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new LinkWithimageNotitleTemplate();
  }
}
