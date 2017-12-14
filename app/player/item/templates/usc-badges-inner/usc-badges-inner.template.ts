
import uscBadgesInnerHtml from './usc-badges-inner.html';
import { componentTemplateNameify, EventTemplates } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.USC_BADGES_INNER_TEMPLATE);

export class UscBadgesInnerTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = uscBadgesInnerHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new UscBadgesInnerTemplate();
  }
}
