
import sxsQuestionHtml from './sxs-question.html';
import { EventTemplates, componentTemplateNameify } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.SXS_QUESTION_TEMPLATE);
export class SxsQuestionTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = sxsQuestionHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new SxsQuestionTemplate();
  }
}
