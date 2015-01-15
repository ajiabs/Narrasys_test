'use strict';
angular.module('com.inthetelling.story')
	.factory('questionAnswersSvc', function ($q, analyticsSvc) {
		var svc = {};
		svc.saveAnswer = function (name, eventID, data) {
			return analyticsSvc.forceCaptureEventActivityWithPromise(name, eventID, data);
		};
		svc.getAnswers = function (eventId) {
			var defer = $q.defer();
			analyticsSvc.readEventActivity(eventId)
				.then(function (activityData) {
					var answers = activityData.filter(function (activity) {
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
				grouped[event.data.answer] ++;
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
			for (answertext in grouped) {
				if (grouped.hasOwnProperty(answertext)) {
					chartData.push({
						data: ((grouped[answertext] / totalAnswers) * 100),
						//						data: [
						//							[x, ((grouped[answertext] / totalAnswers) * 100)]
						//						],
						label: answertext
					});

				}
				x++;
			}
			return chartData;
		};
		return svc;
	});
