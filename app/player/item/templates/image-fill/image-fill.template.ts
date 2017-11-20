
import imageFillHtml from './image-fill.html';

import { EventTemplates, componentTemplateNameify } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.IMAGE_FILL_TEMPLATE);

export class ImageFillTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = imageFillHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new ImageFillTemplate();
  }
}
