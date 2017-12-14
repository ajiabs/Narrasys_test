
import pipHtml from './pip.html';
import { componentTemplateNameify, EventTemplates } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.PIP_TEMPLATE);

export class PipTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = pipHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new PipTemplate();
  }
}
