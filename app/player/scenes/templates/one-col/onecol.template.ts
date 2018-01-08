
import onecolHtml from './onecol.html';
import { componentTemplateNameify, EventTemplates } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.ONECOL_TEMPLATE);

export class OnecolTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = onecolHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new OnecolTemplate();
  }
}
