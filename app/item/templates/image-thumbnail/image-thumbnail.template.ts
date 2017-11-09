

import imageThumbnailHtml from './image-thumbnail.html';

export class ImageThumbnailTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = imageThumbnailHtml;
  scope = true;
  static Name = 'npImageThumbnailTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new ImageThumbnailTemplate();
  }
}
