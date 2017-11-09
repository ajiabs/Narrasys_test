import imageCaptionSlidingHtml from './image-caption-sliding.html';

export class ImageCaptionSlidingTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = imageCaptionSlidingHtml;
  scope = true;
  static Name = 'npImageCaptionSlidingTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new ImageCaptionSlidingTemplate();
  }
}
