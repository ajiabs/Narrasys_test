

import imageInlineWithtextHtml from './image-inline-withtext.html';
import { EventTemplates, componentTemplateNameify } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.IMAGE_INLINE_WITHTEXT_TEMPLATE);

export class ImageInlineWithtextTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = imageInlineWithtextHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new ImageInlineWithtextTemplate();
  }
}
