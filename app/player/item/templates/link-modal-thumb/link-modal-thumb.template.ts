
import linkModalThumbHtml from './link-modal-thumb.html';
import { EventTemplates, componentTemplateNameify } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.LINK_MODAL_THUMB_TEMPLATE);
export class LinkModalThumbTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = linkModalThumbHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new LinkModalThumbTemplate();
  }
}
