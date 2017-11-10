
import mirroredTwocolHtml from './mirrored-twocol.html';

export class MirroredTwocolTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = mirroredTwocolHtml;
  scope = true;
  static Name = 'npMirroredTwocolTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new MirroredTwocolTemplate();
  }
}
