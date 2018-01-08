// @npUpgrade-question-false
'use strict';
questionAnswersSvc.$inject = ['$q', 'analyticsSvc', 'appState'];

export default function questionAnswersSvc($q, analyticsSvc, appState) {
  var svc = {};
  svc.saveAnswer = function (name, eventID, data) {
    return analyticsSvc.forceCaptureEventActivityWithPromise(name, eventID, data);
  };
  svc.getAnswers = function (eventId) {
    var defer = $q.defer();
    analyticsSvc.readEventActivity(eventId)
      .then(function (activityData) {
        var answers = activityData.filter(function (activity) {
          return (
            (activity.name === "question-answered" || activity.name === "question-answered-updated") &&
            activity.episode_id === appState.episodeId
          );
        });
        defer.resolve(answers);
      });
    return defer.promise;
  };
  svc.getUserAnswer = function (eventId, userId) {
    var defer = $q.defer();
    svc.getAnswers(eventId)
      .then(function (data) {
        if (data) {
          var userAnswer = data.filter(function (item) {
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

  svc.calculateCounts = function (events) {
    var grouped;
    angular.forEach(events, function (event) {
      grouped[event.data.index]++;
    });
    return grouped;
  };
  svc.incrementAnswerCount = function (answerCounts, answerIndex) {
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

  return svc;
}
