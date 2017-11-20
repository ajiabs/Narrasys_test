

import imageThumbnailHtml from './image-thumbnail.html';
import { EventTemplates, componentTemplateNameify } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.IMAGE_THUMBNAIL_TEMPLATE);
export class ImageThumbnailTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = imageThumbnailHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new ImageThumbnailTemplate();
  }
}
