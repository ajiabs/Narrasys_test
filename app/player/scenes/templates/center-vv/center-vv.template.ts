
import centerVVHtml from './centerVV.html';
import { componentTemplateNameify, EventTemplates } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.CENTER_VV_TEMPLATE);

export class CenterVvTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = centerVVHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new CenterVvTemplate();
  }
}
