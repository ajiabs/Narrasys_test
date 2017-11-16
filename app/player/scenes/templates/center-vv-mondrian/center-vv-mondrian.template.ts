

import centerVVMondrianHtml from './centerVV-Mondrian.html';
import { componentTemplateNameify, EventTemplates } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.CENTER_VV_MONDRIAN_TEMPLATE);
export class CenterVvMondrianTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = centerVVMondrianHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new CenterVvMondrianTemplate();
  }
}
