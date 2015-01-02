'use strict';

angular.module('com.inthetelling.story')
	.directive('ittPollQuestion', function (questionAnswersSvc, analyticsSvc, appState, _) {
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
			templateUrl: "templates/item/question-mc-poll-inner.html",
			link: function (scope, element, attrs) {
				//TODO: check if already answered?
				//
				//TODO: add labels to pie chart
				//
				//console.log(scope.onChoice);
				//
				//

				scope.chartType = "pie";
				scope.chartOptions = {
					pie: {
						show: true
					},
					yaxis: {
						showLabels: false
					},
					xaxis: {
						showLabels: false
					},
					grid: {
						horizontalLines: false,
						verticalLines: false
					}
				};
				if (scope.plugin.hasBeenAnswered === true) {

							var grouped = scope.plugin.answer_counts;
							var chartData = questionAnswersSvc.calculatePercentages(grouped);
							scope.chartData = chartData;
	
				}


				scope.scorePoll = function (i) {


					questionAnswersSvc.saveAnswer("question-answered", scope.qid, {
							'answer': scope.plugin.distractors[i].text,
							'correct': !!(scope.plugin.distractors[i].correct)
						})
						.then(function (data) {
							//		questionAnswersSvc.getAnswers(scope.qid)
							//		.then(function (data) {
							//var grouped = questionAnswersSvc.calculateCounts(data);
							questionAnswersSvc.incrementAnswerCount(scope.plugin.answer_counts, scope.plugin.distractors[i].text);
							var grouped = scope.plugin.answer_counts;
							var chartData = questionAnswersSvc.calculatePercentages(grouped);
							scope.chartData = chartData;
							scope.plugin.distractors[i].selected = true;
							scope.plugin.hasBeenAnswered = true;
							scope.plugin.selectedDistractor = i;
							//});
						});

				};



			}
		};
	});
