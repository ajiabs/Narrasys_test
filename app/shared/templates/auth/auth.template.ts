
import authHtml from './auth.html';

export class AuthTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = authHtml;
  scope = true;
  static Name = 'npAuthTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new AuthTemplate();
  }
}
