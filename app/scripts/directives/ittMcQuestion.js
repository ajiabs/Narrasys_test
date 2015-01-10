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
				questionType: '@'
			},
			templateUrl: "templates/item/question-mc-inner.html",
			link: function (scope, element, attrs) {
				scope.scoreQuiz = function (i) {
					scope.plugin.distractors[i].selected = true;
					scope.plugin.hasBeenAnswered = true;
					scope.plugin.selectedDistractor = i;
					analyticsSvc.captureEventActivity("question-answered", scope.qid, {
						'answer': scope.plugin.distractors[i].text,
						'correct': !!(scope.plugin.distractors[i].correct)
					});
				};
				var getQuestionType = function(item) {
					return item.questiontype;
				}
				scope.questionType = getQuestionType(scope.plugin);
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
					console.log("answer", scope.plugin);
					if (typeof scope.plugin.answer_counts === 'undefined') {
						scope.plugin.answer_counts = {};
						scope.plugin.answer_counts[scope.plugin.distractors[scope.plugin.selectedDistractor].text] = 1;
					}
					//TODO: this is a -bad- edge case. it means that we stored the user answer in the analytics svc
					//scope.plugin.answer_counts = (typeof scope.plugin.answer_counts === 'undefined') ? {} : scope.plugin.answer_counts;
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
