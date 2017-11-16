

import textDefinitionHtml from './text-definition.html';

export class TextDefinitionTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = textDefinitionHtml;
  scope = true;
  static Name = 'npTextDefinitionTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new TextDefinitionTemplate();
  }
}
