
import uscBadgesHtml from './usc-badges.html';

export class UscBadgesTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = uscBadgesHtml;
  scope = true;
  static Name = 'npUscBadgesTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new UscBadgesTemplate();
  }
}
