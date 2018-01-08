

import textH2Html from './text-h2.html';

import { EventTemplates, componentTemplateNameify } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.HEADER_TWO_TEMPLATE);

export class HeaderTwoTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = textH2Html;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new HeaderTwoTemplate();
  }
}
