

import cornerHHtml from './cornerH.html';

export class CornerHTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = cornerHHtml;
  scope = true;
  static Name = 'npCornerHTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new CornerHTemplate();
  }
}
