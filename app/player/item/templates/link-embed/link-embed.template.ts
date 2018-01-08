
import linkEmbedHtml from './link-embed.html';
import { EventTemplates, componentTemplateNameify } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.LINK_EMBED_TEMPLATE);
export class LinkEmbedTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = linkEmbedHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new LinkEmbedTemplate();
  }
}
