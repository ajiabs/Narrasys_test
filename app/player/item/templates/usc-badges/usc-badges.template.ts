
import uscBadgesHtml from './usc-badges.html';
import { EventTemplates, componentTemplateNameify } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.USC_BADGES_TEMPLATE);
export class UscBadgesTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = uscBadgesHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new UscBadgesTemplate();
  }
}
