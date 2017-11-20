

import textDefinitionHtml from './text-definition.html';
import { EventTemplates, componentTemplateNameify } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.TEXT_DEFINITION_TEMPLATE);
export class TextDefinitionTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = textDefinitionHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new TextDefinitionTemplate();
  }
}
