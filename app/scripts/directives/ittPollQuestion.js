'use strict';

angular.module('com.inthetelling.story')
	.directive('ittPollQuestion', function (analyticsSvc, _) {
		return {
			restrict: 'E',
			//require: "ngModel",
			scope: {
				//questionText: '=questionText',
				//distractors: '=distractors',
				plugin: '=data',
				qid: '=',
				choices: '=',
				correct: '=',
				chartResults: '='
			},
			templateUrl: "templates/item/poll-question.html",
			link: function (scope, element, attrs) {

				//console.log(scope.onChoice);
				scope.scorePoll = function (i) {
					console.log('text', scope.plugin.distractors[i].text);
					console.log("answerrr", i);
					//	ngModel.$setViewValue(ngModel.$viewValue);
					//	scope.$apply();
					console.log("qid:", scope.qid);
					scope.plugin.distractors[i].selected = true;
					scope.plugin.hasBeenAnswered = true;
					scope.plugin.selectedDistractor = i;
					analyticsSvc.captureEventActivity("question-answered", scope.qid, {
							'answer': scope.plugin.distractors[i].text,
							'correct': !!(scope.plugin.distractors[i].correct)
						})
						//	.then(function (data) {
					analyticsSvc.readEventActivity(scope.qid)
						.then(function (data) {
							console.log(data);
							var grouped;
							grouped = _.countBy(data, function (data) {
								return data.data.answer;
							});
							console.log("grouped", grouped);
							var totalAnswers = 0;
							for (var answertext in grouped) {
								if (grouped.hasOwnProperty(answertext)) {
									console.log(answertext);
									totalAnswers += grouped[answertext];
								}
							}
							var chartData = [];
							var i = 0;
							for (var answertext in grouped) {
								if (grouped.hasOwnProperty(answertext)) {
									chartData.push({
										data: [
											[i, ((grouped[answertext] / totalAnswers) * 100)]
										]
									});

								}
								i++;
							}
							console.log("chartData", chartData);
							scope.chartData = chartData;
							scope.chartType = "pie";
							scope.chartOptions = {};
						});
					//	});

				};



			}
		};
	});
