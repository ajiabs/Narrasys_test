
import endingscreenHtml from './endingscreen.html';
import { componentTemplateNameify, EventTemplates } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.ENDINGSCREEN_TEMPLATE);
export class EndingscreenTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = endingscreenHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new EndingscreenTemplate();
  }
}
