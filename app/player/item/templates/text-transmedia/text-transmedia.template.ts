
import textTransmediaHtml from './text-transmedia.html';
import { EventTemplates, componentTemplateNameify } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.TEXT_TRANSMEDIA_TEMPLATE);
export class TextTransmediaTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = textTransmediaHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new TextTransmediaTemplate();
  }
}
