
import imagePlainHtml from './image-plain.html';

export class ImagePlainTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = imagePlainHtml;
  scope = true;
  static Name = 'npImagePlainTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new ImagePlainTemplate();
  }
}
