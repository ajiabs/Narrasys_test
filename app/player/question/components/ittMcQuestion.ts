// @npUpgrade-question-true

import { IPluginData } from '../../../models';
import { IAnalyticsSvc } from '../../../interfaces';

const TEMPLATE = `
<div class="question item__text">

  <p ng-bind-html="$ctrl.plugin.questiontext | i18n"></p>
  <div ng-if="!$ctrl.showChart">

    <div ng-repeat="distractor in $ctrl.choices">
      <div ng-if="(distractor.text | i18n) != ''">
        <label ng-class="{
					correct: $ctrl.plugin.hasBeenAnswered && distractor.correct,
					incorrect: $ctrl.plugin.hasBeenAnswered && !distractor.correct
				}">
          <input ng-change="$ctrl.scoreQuiz($index)" type="radio" name="fnord" ng-model="index"
                 ng-disabled="$ctrl.plugin.hasBeenAnswered" value="{{$index}}" ng-checked="distractor.selected">
          <span ng-bind-html="distractor.text | i18n"></span>
        </label>
      </div>
    </div>
    <div ng-if="$ctrl.plugin.hasBeenAnswered" ng-bind-html="$ctrl.feedback() | i18n"></div>
  </div>

  <div ng-if="$ctrl.showChart">
    <div ng-if="!$ctrl.plugin.hasBeenAnswered" ng-repeat="distractor in $ctrl.plugin.distractors">
      <div ng-if="(distractor.text | i18n) != ''">
        <label>
          <input ng-change="$ctrl.scorePoll($index)" type="radio" name="fnord"
            ng-disabled="$ctrl.plugin.hasBeenAnswered"
            ng-model="$ctrl.plugin.selectedDistractor" value="{{$index}}">
          <span ng-bind-html="distractor.text | i18n"></span>
        </label>
      </div>
    </div>
    <br>
    <div ng-if="$ctrl.plugin.hasBeenAnswered">
      <p ng-if="$ctrl.plugin.selectedDistractor">Here's how others answered this question. (Your choice was:
        <b ng-repeat="distractor in $ctrl.plugin.distractors | filter:{ index: $ctrl.plugin.selectedDistractor }"
           ng-bind-html="distractor.text | i18n"></b>)
      </p>

      <itt-flotr2-chart type="{{$ctrl.chartType}}" title="" data="{{$ctrl.chartData}}"
                        options="{{$ctrl.chartOptions}}"></itt-flotr2-chart>
    </div>
  </div>
</div>

`;

interface IMcQuestionBindings extends ng.IComponentController {
  showChart: boolean;
  choices: any;
  plugin: IPluginData;
  qid: string;
}

class McQuestionController implements IMcQuestionBindings {
  showChart: boolean;
  choices: any;
  plugin: IPluginData;
  qid: string;
  //
  chartOptions: any;
  chartData: any;
  chartType: any;
  static $inject = ['questionAnswersSvc', 'analyticsSvc', 'appState'];

  constructor(public questionAnswersSvc, public analyticsSvc: IAnalyticsSvc, public appState) {
    //
  }

  $onInit() {
    this.chartOptions = {};

    if (this.plugin.hasBeenAnswered === true) {

      /*
       answer_counts is included in event data as {
       index: count,
       index: count
       }
       */
      if (typeof this.plugin.answer_counts === 'undefined') {
        // This is in case of failure on the API side to return answer_counts (which shouldn't happen):
        console.error('No answer_counts returned from API');
        this.plugin.answer_counts = {};
      }

      const grouped = this.plugin.answer_counts;
      const chartData = this.formatAnswersForFlotPieChart(grouped);
      this.chartData = chartData;
    }

  }

  scoreQuiz(distractorIndex) {
    this.plugin.distractors[distractorIndex].selected = true;
    this.plugin.hasBeenAnswered = true;
    this.plugin.selectedDistractor = this.plugin.distractors[distractorIndex].index;
    this.analyticsSvc.captureEventActivity('question-answered', this.qid, {
      'answer': this.plugin.distractors[distractorIndex].text,
      'index': this.plugin.distractors[distractorIndex].index,
      'correct': !!(this.plugin.distractors[distractorIndex].correct)
    });
  }

  feedback() {
    for (let i = 0; i < this.plugin.distractors.length; i += 1) {
      if (this.plugin.distractors[i].index === this.plugin.selectedDistractor) {
        return (this.plugin.distractors[i].correct) ? this.plugin.correctfeedback : this.plugin.incorrectfeedback;
      }
    }
  }

  scorePoll(i: number) {
    console.log('scorePoll');
    this.questionAnswersSvc.saveAnswer(
      'question-answered',
      this.qid,
      {
        'answer': this.plugin.distractors[i].text,
        'index': this.plugin.distractors[i].index,
        'correct': !!(this.plugin.distractors[i].correct)
      }
    ).then(() => {
      this.plugin.answer_counts = (typeof this.plugin.answer_counts === 'undefined') ? {} : this.plugin.answer_counts;
      this.questionAnswersSvc.incrementAnswerCount(this.plugin.answer_counts, this.plugin.distractors[i].index);
      const grouped = this.plugin.answer_counts;
      const chartData = this.formatAnswersForFlotPieChart(grouped);
      this.chartData = chartData;
      this.plugin.distractors[i].selected = true;
      this.plugin.hasBeenAnswered = true;
      this.plugin.selectedDistractor = this.plugin.distractors[i].index;
    });

  }

  private formatAnswersForFlotPieChart(grouped) {
    // console.log("Formatting ", grouped, " for ", scope.plugin);
    const chartData = [];
    for (const answerIndex in grouped) {
      if (grouped.hasOwnProperty(answerIndex)) {
        // translate the index into the answer text
        angular.forEach(this.plugin.distractors, (distractor) => {
          if (distractor.index + '' === answerIndex + '') {
            let label = distractor.text;
            if (typeof (label) === 'object') {
              label = label[this.appState.lang] || label.en || '';
            }
            chartData.push({
              label,
              data: grouped[answerIndex]
            });
          }
        });
      }
    }
    return chartData;
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class McQuestion implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    showChart: '<',
    choices: '<',
    plugin: '<',
    qid: '@'
  };
  template: string = TEMPLATE;
  controller = McQuestionController;
  static Name: string = 'npMcQuestion'; // tslint:disable-line
}

/* tslint:disable */
// ittMcQuestion.$inject = ['questionAnswersSvc', 'analyticsSvc', 'appState'];
//
// export default function ittMcQuestion(questionAnswersSvc, analyticsSvc, appState) {
//   return {
//     restrict: 'E',
//     replace: false,
//     scope: {
//       plugin: '=data',
//       qid: '=',
//       choices: '=',
//       correct: '=',
//       onChoice: '=',
//       questionType: '@',
//       showChart: '='
//     },
//     template: questionMcInnerHtml,
//     link: function (scope) {
//
//       scope.scoreQuiz = function (i) {
//         scope.plugin.distractors[i].selected = true;
//         scope.plugin.hasBeenAnswered = true;
//         scope.plugin.selectedDistractor = scope.plugin.distractors[i].index;
//         analyticsSvc.captureEventActivity("question-answered", scope.qid, {
//           'answer': scope.plugin.distractors[i].text,
//           'index': scope.plugin.distractors[i].index,
//           'correct': !!(scope.plugin.distractors[i].correct)
//         });
//       };
//
//       scope.feedback = function () {
//         for (var i = 0; i < scope.plugin.distractors.length; i++) {
//           if (scope.plugin.distractors[i].index === scope.plugin.selectedDistractor) {
//             return (scope.plugin.distractors[i].correct) ? scope.plugin.correctfeedback : scope.plugin.incorrectfeedback;
//           }
//         }
//       };
//
//       scope.questionType = scope.plugin.questiontype;
//
//       // NOT YET SUPPORTED IN ittFlotChart:
//       scope.chartOptions = {}; // moving default chartOptions into ittFlotChart; use this to override.
//
//       var formatAnswersForFlotPieChart = function (grouped) {
//         // console.log("Formatting ", grouped, " for ", scope.plugin);
//         var chartData = [];
//         for (var answerIndex in grouped) {
//           if (grouped.hasOwnProperty(answerIndex)) {
//             // translate the index into the answer text
//             angular.forEach(scope.plugin.distractors, function (distractor) {
//               if (distractor.index + "" === answerIndex + "") {
//                 var label = distractor.text;
//                 if (typeof (label) === 'object') {
//                   label = label[appState.lang] || label.en || "";
//                 }
//                 chartData.push({
//                   data: grouped[answerIndex],
//                   label: label
//                 });
//               }
//             });
//           }
//         }
//         return chartData;
//       };
//
//       if (scope.plugin.hasBeenAnswered === true) {
//
//         /*
//          answer_counts is included in event data as {
//          index: count,
//          index: count
//          }
//          */
//         if (typeof scope.plugin.answer_counts === 'undefined') {
//           // This is in case of failure on the API side to return answer_counts (which shouldn't happen):
//           console.error("No answer_counts returned from API");
//           scope.plugin.answer_counts = {};
//         }
//
//         var grouped = scope.plugin.answer_counts;
//         var chartData = formatAnswersForFlotPieChart(grouped);
//         scope.chartData = chartData;
//       }
//
//       scope.scorePoll = function (i) {
//         console.log("scorePoll");
//         questionAnswersSvc.saveAnswer("question-answered", scope.qid, {
//           'answer': scope.plugin.distractors[i].text,
//           'index': scope.plugin.distractors[i].index,
//           'correct': !!(scope.plugin.distractors[i].correct)
//         })
//           .then(function () {
//             scope.plugin.answer_counts = (typeof scope.plugin.answer_counts === 'undefined') ? {} : scope.plugin.answer_counts;
//             questionAnswersSvc.incrementAnswerCount(scope.plugin.answer_counts, scope.plugin.distractors[i].index);
//             var grouped = scope.plugin.answer_counts;
//             var chartData = formatAnswersForFlotPieChart(grouped);
//             scope.chartData = chartData;
//             scope.plugin.distractors[i].selected = true;
//             scope.plugin.hasBeenAnswered = true;
//             scope.plugin.selectedDistractor = scope.plugin.distractors[i].index;
//             //});
//           });
//
//       };
//
//     }
//
//   };
// }
