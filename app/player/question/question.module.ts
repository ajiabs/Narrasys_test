import questionAnswersSvc from './services/questionAnswersSvc';
import ittFlotr2Chart from './components/ittFlotChart';
import ittQuestionOptions, { QuestionOptions } from './components/ittQuestionOptions';
import ittQuestionTextField from './components/ittQuestionTextField';
import ittQuestionTypeSelect from './components/ittQuestionTypeSelect';
import { McQuestion } from './components/ittMcQuestion';

const npQuestionModule = angular.module('np.question', []);

npQuestionModule
  .factory('questionAnswersSvc', questionAnswersSvc)
  .directive('ittFlotr2Chart', ittFlotr2Chart)
  .directive('ittQuestionOptions', ittQuestionOptions)
  .component(QuestionOptions.Name, new QuestionOptions())
  .directive('ittQuestionTextField', ittQuestionTextField)
  .directive('ittQuestionTypeSelect', ittQuestionTypeSelect)
  .component(McQuestion.Name, new McQuestion());

export default npQuestionModule;
