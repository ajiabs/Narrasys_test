
import questionMcHtml from './question-mc.html';

export class QuestionMcTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = questionMcHtml;
  scope = true;
  static Name = 'npQuestionMcTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new QuestionMcTemplate();
  }
}
