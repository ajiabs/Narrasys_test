// @npUpgrade-question-false

/***********************************
 **** Updated by Curve10 (JAB/EDD)
 **** Feb 2018
 ***********************************/

'use strict';

export interface IQuestionAnswersSvc {
  saveAnswer(name, eventID, data);
  getAnswers(eventId);
  getUserAnswer(eventId, userId);
  calculateCounts(events);
  incrementAnswerCount(answerCounts, answerIndex);
}

export class QuestionAnswersSvc implements IQuestionAnswersSvc {
  static Name = 'questionAnswersSvc'; // tslint:disable-line
  static $inject = ['$q', 'analyticsSvc', 'appState'];

  constructor (
    private $q,
    private analyticsSvc,
    private appState) {
    }

  // private svc = {};
  saveAnswer(name, eventID, data) {
    return this.analyticsSvc.forceCaptureEventActivityWithPromise(name, eventID, data);
  };

  getAnswers(eventId) {
    var defer = this.$q.defer();
    this.analyticsSvc.readEventActivity(eventId)
      .then( (activityData) => {
        var answers = activityData.filter( (activity) => {
          return (
            (activity.name === "question-answered" || activity.name === "question-answered-updated") &&
            activity.episode_id === this.appState.episodeId
          );
        });
        defer.resolve(answers);
      });
    return defer.promise;
  };

  getUserAnswer(eventId, userId) {
    var defer = this.$q.defer();
    this.getAnswers(eventId)
      .then( (data) => {
        if (data) {
          var userAnswer = data.filter( (item) => {
            return item.user_id === userId;
          });
          if (userAnswer.length > 0) {
            defer.resolve(userAnswer[0]);
          } else {
            defer.reject();
          }
        } else {
          return defer.reject();
        }
      });
    return defer.promise;
  };

  calculateCounts(events) {
    var grouped;
    angular.forEach(events, (event) => {
      grouped[event.data.index]++;
    });
    return grouped;
  };

  incrementAnswerCount(answerCounts, answerIndex) {
    answerCounts[answerIndex] = (answerCounts[answerIndex] || 0) + 1;
  };

  /* This never gets used (flot calculates percentages for us) and was I think incorrect anyway (the chart was displaying the percentage as the answer count)
   svc.calculatePercentages = function (grouped) {
   console.log("CalcPercentages", grouped);
   var totalAnswers = 0;
   for (var answerIndex in grouped) {
   if (grouped.hasOwnProperty(answerIndex)) {
   totalAnswers += grouped[answerIndex];
   }
   }
   var chartData = [];
   var x = 0;
   for (answerIndex in grouped) {
   if (grouped.hasOwnProperty(answerIndex)) {
   chartData.push({
   data: ((grouped[answerIndex] / totalAnswers) * 100),
   //						data: [
   //							[x, ((grouped[answertext] / totalAnswers) * 100)]
   //						],
   label: answerIndex
   });

   }
   x++;
   }
   console.log("returning ", chartData);
   return chartData;
   };
   */

}
