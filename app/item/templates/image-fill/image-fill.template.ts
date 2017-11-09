
import imageFillHtml from './image-fill.html';

export class ImageFillTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = imageFillHtml;
  scope = true;
  static Name = 'npImageFillTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new ImageFillTemplate();
  }
}
