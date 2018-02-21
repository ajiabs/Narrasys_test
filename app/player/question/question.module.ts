import { QuestionAnswersSvc } from './services/questionAnswersSvc';
import ittFlotr2Chart from './components/ittFlotChart';
import { QuestionOptions } from './components/ittQuestionOptions';
import { QuestionTextField } from './components/ittQuestionTextField';
import ittQuestionTypeSelect from './components/ittQuestionTypeSelect';
import { McQuestion } from './components/ittMcQuestion';

const npQuestionModule = angular.module('np.question', []);

npQuestionModule
  // .factory('questionAnswersSvc', questionAnswersSvc)
  .service(QuestionAnswersSvc.Name, QuestionAnswersSvc)
  .directive('ittFlotr2Chart', ittFlotr2Chart)
  .component(QuestionOptions.Name, new QuestionOptions())
  .component(QuestionTextField.Name, new QuestionTextField())
  .directive('ittQuestionTypeSelect', ittQuestionTypeSelect)
  .component(McQuestion.Name, new McQuestion());

export default npQuestionModule;
