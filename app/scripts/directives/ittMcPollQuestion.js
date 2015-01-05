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

				//scope.chartType = "pie";


//TRY setting formatter after it has passed through the observe and json.parse
				scope.chartOptions = {
					series: {
						pie: {
							show: true,
							label: {
								show: true,
								formatter: function (label, series) {
									return '<div style="font-size:8pt;text-align:center;padding:2px;color:black;">' + label + '<br/>' + Math.round(series.data[0][1]) + '%</div>';
								},
								background: { opacity: 0.3 } 
							}
						}
					},
					legend: {
						show: false
					}
				};
				//				scope.chartOptions = {
				//					pie: {
				//						show: true
				//					},
				//					yaxis: {
				//						showLabels: false
				//					},
				//					xaxis: {
				//						showLabels: false
				//					},
				//					grid: {
				//						horizontalLines: false,
				//						verticalLines: false
				//					}
				//				};
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
