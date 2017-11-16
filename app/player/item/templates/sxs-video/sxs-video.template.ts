
import sxsVideoHtml from './sxs-video.html';

export class SxsVideoTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = sxsVideoHtml;
  scope = true;
  static Name = 'npSxsVideoTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new SxsVideoTemplate();
  }
}
