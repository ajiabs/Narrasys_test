

import sxsQuestionHtml from './sxs-question.html';

export class SxsQuestionFieldTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = sxsQuestionHtml;
  scope = true;
  static Name = 'npSxsQuestionFieldTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new SxsQuestionFieldTemplate();
  }
}
