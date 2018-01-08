

import sxsImageHtml from './sxs-image.html';

export class SxsImageFieldTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = sxsImageHtml;
  scope = true;
  static Name = 'npSxsImageFieldTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new SxsImageFieldTemplate();
  }
}
