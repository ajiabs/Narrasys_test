

import sxsAnnotationHtml from './sxs-annotation.html';

export class SxsAnnotationTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = sxsAnnotationHtml;
  scope = true;
  static Name = 'npSxsAnnotationTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new SxsAnnotationTemplate();
  }
}
