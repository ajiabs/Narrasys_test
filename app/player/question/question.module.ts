import questionAnswersSvc from './services/questionAnswersSvc';
import ittFlotr2Chart from './components/ittFlotChart';
import ittQuestionOptions from './components/ittQuestionOptions';
import ittQuestionTextField from './components/ittQuestionTextField';
import ittQuestionTypeSelect from './components/ittQuestionTypeSelect';
import ittMcQuestion from './components/mc-question/ittMcQuestion';

const npQuestionModule = angular.module('np.question', []);

npQuestionModule
  .factory('questionAnswersSvc', questionAnswersSvc)
  .directive('ittFlotr2Chart', ittFlotr2Chart)
  .directive('ittQuestionOptions', ittQuestionOptions)
  .directive('ittQuestionTextField', ittQuestionTextField)
  .directive('ittQuestionTypeSelect', ittQuestionTypeSelect)
  .directive('ittMcQuestion', ittMcQuestion);

export default npQuestionModule;
