
import uscBadgesInnerHtml from './usc-badges-inner.html';

export class UscBadgesInnerTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = uscBadgesInnerHtml;
  scope = true;
  static Name = 'npUscBadgesInnerTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new UscBadgesInnerTemplate();
  }
}
