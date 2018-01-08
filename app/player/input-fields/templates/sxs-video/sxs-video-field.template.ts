

import sxsVideoHtml from './sxs-video.html';

export class SxsVideoFieldTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = sxsVideoHtml;
  scope = true;
  static Name = 'npSxsVideoFieldTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new SxsVideoFieldTemplate();
  }
}
