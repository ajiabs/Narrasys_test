
import questionMcHtml from './question-mc.html';
import { EventTemplates, componentTemplateNameify } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.QUESTION_TEMPLATE);
export class QuestionMcTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = questionMcHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new QuestionMcTemplate();
  }
}
