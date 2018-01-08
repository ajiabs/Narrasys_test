

import sxsFileHtml from './sxs-file.html';

export class SxsFileFieldTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = sxsFileHtml;
  scope = true;
  static Name = 'npSxsFileFieldTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new SxsFileFieldTemplate();
  }
}
