
import onecolHtml from './onecol.html';

export class OnecolTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = onecolHtml;
  scope = true;
  static Name = 'npOnecolTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new OnecolTemplate();
  }
}
