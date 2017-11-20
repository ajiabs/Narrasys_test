

import sxsAnnotationHtml from './sxs-annotation.html';
import { EventTemplates, componentTemplateNameify } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.SXS_ANNOTAITON_TEMPLATE);
export class SxsAnnotationTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = sxsAnnotationHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new SxsAnnotationTemplate();
  }
}
