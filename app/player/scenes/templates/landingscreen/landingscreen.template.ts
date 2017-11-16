
import landingscreenHtml from './landingscreen.html';

export class LandingscreenTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = landingscreenHtml;
  scope = true;
  static Name = 'npLandingscreenTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new LandingscreenTemplate();
  }
}
