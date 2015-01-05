'use strict';

angular.module('com.inthetelling.story')
	.directive('ittPollQuestion', function (questionAnswersSvc, analyticsSvc, appState, _) {
		return {
			restrict: 'E',
			scope: {
				plugin: '=data',
				qid: '=',
				choices: '=',
				correct: '=',
				chartResults: '='
			},
			templateUrl: "templates/item/question-mc-poll-inner.html",
			link: function (scope, element, attrs) {
				scope.chartOptions = {
					series: {
						pie: {
							show: true,
							label: {
								show: true,
								formatter: function (label, series) {
									return '<div style="font-size:8pt;text-align:center;padding:2px;color:black;">' + label + '<br/>' + Math.round(series.data[0][1]) + '%</div>';
								},
								background: {
									opacity: 0.3
								}
							}
						}
					},
					legend: {
						show: false
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
							scope.plugin.answer_counts = (typeof scope.plugin.answer_counts === 'undefined') ? {} : scope.plugin.answer_counts;
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
