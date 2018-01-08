
import discovermodeHtml from './discovermode.html';

export class DiscovermodeTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = discovermodeHtml;
  scope = true;
  static Name = 'npDiscovermodeTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new DiscovermodeTemplate();
  }
}
