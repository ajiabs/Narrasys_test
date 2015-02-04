'use strict';

angular.module('com.inthetelling.story')
	.directive('ittMcQuestion', function (questionAnswersSvc, analyticsSvc) {
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
			templateUrl: "templates/item/question-mc-inner.html",
			link: function (scope) {
				
				scope.scoreQuiz = function (i) {
					scope.plugin.distractors[i].selected = true;
					scope.plugin.hasBeenAnswered = true;
					scope.plugin.selectedDistractor = i;
					analyticsSvc.captureEventActivity("question-answered", scope.qid, {
						'answer': scope.plugin.distractors[i].text,
						'correct': !!(scope.plugin.distractors[i].correct)
					});
				};
				var getQuestionType = function (item) {
					return item.questiontype;
				};
				scope.questionType = getQuestionType(scope.plugin);
				scope.chartOptions = {
					series: {
						pie: {
							show: true,
							label: {
								show: true,
								background: {
									opacity: 0.3
								}
							}
						}
					},
					legend: {
						show: false
					},
					grid: {
						hoverable: true
					},
					tooltip: true,
					tooltipOpts: {
						content: "%y.0, %s", // show percentages, rounding to 2 decimal places
						shifts: {
							x: 20,
							y: 0
						},
						defaultTheme: false
					}
				};

				var formatAnswersForFlotPieChart = function (grouped) {
					var chartData = [];
					for (var answertext in grouped) {
						if (grouped.hasOwnProperty(answertext)) {
							chartData.push({
								data: grouped[answertext],
								label: answertext
							});
						}
					}
					return chartData;
				};


				if (scope.plugin.hasBeenAnswered === true) {
					if (typeof scope.plugin.answer_counts === 'undefined') {
						scope.plugin.answer_counts = {};
						scope.plugin.answer_counts[scope.plugin.distractors[scope.plugin.selectedDistractor].text] = 1;
					}
					//TODO: this is a -bad- edge case. it means that we stored the user answer in the analytics svc
					//scope.plugin.answer_counts = (typeof scope.plugin.answer_counts === 'undefined') ? {} : scope.plugin.answer_counts;
					var grouped = scope.plugin.answer_counts;
					var chartData = formatAnswersForFlotPieChart(grouped);
					scope.chartData = chartData;
				}

				scope.scorePoll = function (i) {
					questionAnswersSvc.saveAnswer("question-answered", scope.qid, {
							'answer': scope.plugin.distractors[i].text,
							'correct': !!(scope.plugin.distractors[i].correct)
						})
						.then(function () {
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
