

import cornerHHtml from './cornerH.html';
import { componentTemplateNameify, EventTemplates } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.CORNER_H_TEMPLATE);

export class CornerHTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = cornerHHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new CornerHTemplate();
  }
}
