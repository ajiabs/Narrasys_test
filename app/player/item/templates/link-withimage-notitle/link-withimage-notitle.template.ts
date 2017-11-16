
import linkWithimageNotitleHtml from './link-withimage-notitle.html';

export class LinkWithimageNotitleTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = linkWithimageNotitleHtml;
  scope = true;
  static Name = 'npLinkWithimageNotitleTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new LinkWithimageNotitleTemplate();
  }
}
