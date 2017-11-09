
import pullquoteHtml from './pullquote.html';

export class PullquoteTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = pullquoteHtml;
  scope = true;
  static Name = 'npPullquoteTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new PullquoteTemplate();
  }
}
