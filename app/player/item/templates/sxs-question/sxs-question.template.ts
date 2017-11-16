
import sxsQuestionHtml from './sxs-question.html';

export class SxsQuestionTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = sxsQuestionHtml;
  scope = true;
  static Name = 'npSxsQuestionTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new SxsQuestionTemplate();
  }
}
