
import cornerVHtml from './cornerV.html';

export class CornerVTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = cornerVHtml;
  scope = true;
  static Name = 'npCornerVTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new CornerVTemplate();
  }
}
