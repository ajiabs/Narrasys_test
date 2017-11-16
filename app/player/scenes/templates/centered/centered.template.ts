
import centeredHtml from './centered.html';
import { componentTemplateNameify, EventTemplates } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.CENTERED_TEMPLATE);
export class CenteredTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = centeredHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new CenteredTemplate();
  }
}
