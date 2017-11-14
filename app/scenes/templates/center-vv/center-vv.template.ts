
import centerVVHtml from './centerVV.html';

export class CenterVvTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = centerVVHtml;
  scope = true;
  static Name = 'npCenterVvTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new CenterVvTemplate();
  }
}
