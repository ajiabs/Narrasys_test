
import sxsAnnotationHtml from './sxs-annotation.html';

export class SxsAnnotationFieldTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = sxsAnnotationHtml;
  scope = {
    item: '<',
    onUpdate: '&'
  };
  bindToController = true;
  controllerAs = '$ctrl';
  controller = class SxsAnnotationFieldController {

  };
  static Name = 'npSxsAnnotationFieldTemplate'; // tslint:disable-line
  static factory(): ng.IDirectiveFactory {
    return () => new SxsAnnotationFieldTemplate();
  }
}
