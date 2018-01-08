
import centeredProHtml from './centeredPro.html';
import { componentTemplateNameify, EventTemplates } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.CENTERED_PRO_TEMPLATE);

export class CenteredProTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = centeredProHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new CenteredProTemplate();
  }
}
