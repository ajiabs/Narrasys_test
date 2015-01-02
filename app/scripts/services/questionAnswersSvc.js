'use strict';
angular.module('com.inthetelling.story')
	.factory('questionAnswersSvc', function ($q, $http, $routeParams, $interval, analyticsSvc, config, appState, _) {
		var svc = {};
		svc.saveAnswer = function (name, eventID, data) {
			return analyticsSvc.captureEventActivityWithPromise(name, eventID, data);
		};
		svc.getAnswers = function (eventId) {
			var defer = $q.defer();
			analyticsSvc.readEventActivity(eventId)
				.then(function (activityData) {
					var answers = _.filter(activityData, function (activity) {
						return (activity.name === "question-answered" || activity.name === "question-answered-updated");
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
						var userAnswer = _.filter(data, function (item) {
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
			grouped = _.countBy(events, function (event) {
				return event.data.answer;
			});
			return grouped;
		};
		svc.incrementAnswerCount = function (answerCounts, answerText) {
			answerCounts[answerText] = (answerCounts[answerText] || 0) + 1;
		};
		svc.calculatePercentages = function (grouped) {
			var totalAnswers = 0;
			for (var answertext in grouped) {
				if (grouped.hasOwnProperty(answertext)) {
					totalAnswers += grouped[answertext];
				}
			}
			var chartData = [];
			var x = 0;
			for (var answertext in grouped) {
				if (grouped.hasOwnProperty(answertext)) {
					chartData.push({
						data: [
							[x, ((grouped[answertext] / totalAnswers) * 100)]
						]
					});

				}
				x++;
			}
			return chartData;
		};
		return svc;
	});
