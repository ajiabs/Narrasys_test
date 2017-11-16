
import cornerVHtml from './cornerV.html';
import { componentTemplateNameify, EventTemplates } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.CORNER_V_TEMPLATE);

export class CornerVTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = cornerVHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new CornerVTemplate();
  }
}
