

import centerVVMondrianHtml from './centerVV-Mondrian.html';

export class CenterVvMondrianTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = centerVVMondrianHtml;
  scope = true;
  static Name = 'npCenterVvMondrianTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new CenterVvMondrianTemplate();
  }
}
