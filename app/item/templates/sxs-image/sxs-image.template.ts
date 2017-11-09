

import sxsImageHtml from './sxs-image.html';

export class SxsImageTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = sxsImageHtml;
  scope = true;
  static Name = 'npSxsImageTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new SxsImageTemplate();
  }
}
