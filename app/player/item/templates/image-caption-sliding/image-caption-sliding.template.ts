import imageCaptionSlidingHtml from './image-caption-sliding.html';

import { EventTemplates, componentTemplateNameify } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.SLIDING_CAPTION);

export class ImageCaptionSlidingTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = imageCaptionSlidingHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new ImageCaptionSlidingTemplate();
  }
}
