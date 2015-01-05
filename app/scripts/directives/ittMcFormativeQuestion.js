'use strict';

angular.module('com.inthetelling.story')
	.directive('ittQuestion', function (analyticsSvc) {
		return {
			restrict: 'E',
			scope: {
				plugin: '=data',
				qid: '=',
				choices: '=',
				correct: '=',
				onChoice: '='
			},
			templateUrl: "templates/item/question-mc-formative-inner.html",
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
			}
		};
	});
