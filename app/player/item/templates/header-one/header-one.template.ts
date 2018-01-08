
import textH1Html from './text-h1.html';
import { EventTemplates, componentTemplateNameify } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.HEADER_ONE_TEMPLATE);

export class HeaderOneTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = textH1Html;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new HeaderOneTemplate();
  }
}
