
import linkEmbedHtml from './link-embed.html';

export class LinkEmbedTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = linkEmbedHtml;
  scope = true;
  static Name = 'npLinkEmbedTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new LinkEmbedTemplate();
  }
}
