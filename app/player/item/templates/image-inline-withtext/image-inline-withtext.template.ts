

import imageInlineWithtextHtml from './image-inline-withtext.html';

export class ImageInlineWithtextTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = imageInlineWithtextHtml;
  scope = true;
  static Name = 'npImageInlineWithtextTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new ImageInlineWithtextTemplate();
  }
}
