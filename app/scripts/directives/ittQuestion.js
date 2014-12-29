'use strict';

angular.module('com.inthetelling.story')
	.directive('ittQuestion', function (analyticsSvc) {
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
			onChoice:'='

			},
			templateUrl: "templates/item/question.html",
			link: function (scope, element, attrs) {
				
				//console.log(scope.onChoice);
				scope.scoreQuiz = function (i) {
					scope.plugin.distractors[i].selected = true;
					scope.plugin.hasBeenAnswered = true;
					scope.plugin.selectedDistractor = i;
					analyticsSvc.captureEventActivity("question-answered", scope.qid, {
						'answer': scope.plugin.distractors[i].text,
						'correct': !!(scope.plugin.distractors[i].correct)
					});
				};



			}
		};
	});
