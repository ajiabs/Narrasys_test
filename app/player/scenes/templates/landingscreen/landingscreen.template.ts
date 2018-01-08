
import landingscreenHtml from './landingscreen.html';
import { componentTemplateNameify, EventTemplates } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.LANDINGSCREEN_TEMPLATE);
export class LandingscreenTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = landingscreenHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new LandingscreenTemplate();
  }
}
