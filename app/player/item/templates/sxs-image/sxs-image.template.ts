

import sxsImageHtml from './sxs-image.html';
import { EventTemplates, componentTemplateNameify } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.SXS_IMAGE_TEMPLATE);
export class SxsImageTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = sxsImageHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new SxsImageTemplate();
  }
}
