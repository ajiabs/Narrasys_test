
import sxsFileHtml from './sxs-file.html';

export class SxsFileTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = sxsFileHtml;
  scope = true;
  static Name = 'npSxsFileTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new SxsFileTemplate();
  }
}
