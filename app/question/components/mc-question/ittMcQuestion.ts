// @npUpgrade-question-false

import questionMcInnerHtml from './question-mc-inner.html';

ittMcQuestion.$inject = ['questionAnswersSvc', 'analyticsSvc', 'appState'];

export default function ittMcQuestion(questionAnswersSvc, analyticsSvc, appState) {
  return {
    restrict: 'E',
    replace: false,
    scope: {
      plugin: '=data',
      qid: '=',
      choices: '=',
      correct: '=',
      onChoice: '=',
      questionType: '@',
      showChart: '='
    },
    template: questionMcInnerHtml,
    link: function (scope) {

      scope.scoreQuiz = function (i) {
        scope.plugin.distractors[i].selected = true;
        scope.plugin.hasBeenAnswered = true;
        scope.plugin.selectedDistractor = scope.plugin.distractors[i].index;
        analyticsSvc.captureEventActivity("question-answered", scope.qid, {
          'answer': scope.plugin.distractors[i].text,
          'index': scope.plugin.distractors[i].index,
          'correct': !!(scope.plugin.distractors[i].correct)
        });
      };

      scope.feedback = function () {
        for (var i = 0; i < scope.plugin.distractors.length; i++) {
          if (scope.plugin.distractors[i].index === scope.plugin.selectedDistractor) {
            return (scope.plugin.distractors[i].correct) ? scope.plugin.correctfeedback : scope.plugin.incorrectfeedback;
          }
        }
      };

      scope.questionType = scope.plugin.questiontype;

      // NOT YET SUPPORTED IN ittFlotChart:
      scope.chartOptions = {}; // moving default chartOptions into ittFlotChart; use this to override.

      var formatAnswersForFlotPieChart = function (grouped) {
        // console.log("Formatting ", grouped, " for ", scope.plugin);
        var chartData = [];
        for (var answerIndex in grouped) {
          if (grouped.hasOwnProperty(answerIndex)) {
            // translate the index into the answer text
            angular.forEach(scope.plugin.distractors, function (distractor) {
              if (distractor.index + "" === answerIndex + "") {
                var label = distractor.text;
                if (typeof (label) === 'object') {
                  label = label[appState.lang] || label.en || "";
                }
                chartData.push({
                  data: grouped[answerIndex],
                  label: label
                });
              }
            });
          }
        }
        return chartData;
      };

      if (scope.plugin.hasBeenAnswered === true) {

        /*
         answer_counts is included in event data as {
         index: count,
         index: count
         }
         */
        if (typeof scope.plugin.answer_counts === 'undefined') {
          // This is in case of failure on the API side to return answer_counts (which shouldn't happen):
          console.error("No answer_counts returned from API");
          scope.plugin.answer_counts = {};
        }

        var grouped = scope.plugin.answer_counts;
        var chartData = formatAnswersForFlotPieChart(grouped);
        scope.chartData = chartData;
      }

      scope.scorePoll = function (i) {
        console.log("scorePoll");
        questionAnswersSvc.saveAnswer("question-answered", scope.qid, {
          'answer': scope.plugin.distractors[i].text,
          'index': scope.plugin.distractors[i].index,
          'correct': !!(scope.plugin.distractors[i].correct)
        })
          .then(function () {
            scope.plugin.answer_counts = (typeof scope.plugin.answer_counts === 'undefined') ? {} : scope.plugin.answer_counts;
            questionAnswersSvc.incrementAnswerCount(scope.plugin.answer_counts, scope.plugin.distractors[i].index);
            var grouped = scope.plugin.answer_counts;
            var chartData = formatAnswersForFlotPieChart(grouped);
            scope.chartData = chartData;
            scope.plugin.distractors[i].selected = true;
            scope.plugin.hasBeenAnswered = true;
            scope.plugin.selectedDistractor = scope.plugin.distractors[i].index;
            //});
          });

      };

    }

  };
}
