
import imageHtml from './image.html';

export class ImageTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = imageHtml;
  scope = true;
  static Name = 'npImageTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new ImageTemplate();
  }
}
