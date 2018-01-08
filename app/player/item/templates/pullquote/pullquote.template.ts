
import pullquoteHtml from './pullquote.html';
import { EventTemplates, componentTemplateNameify } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.PULLQUOTE_TEMPLATE);
export class PullquoteTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = pullquoteHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new PullquoteTemplate();
  }
}
