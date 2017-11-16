
import videoHtml from './video.html';

export class VideoTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = videoHtml;
  scope = true;
  static Name = 'npVideoTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new VideoTemplate();
  }
}

