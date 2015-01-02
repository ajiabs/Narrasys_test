angular.module('com.inthetelling.story')
	.directive('ittQuestionAnswerResultsChart', function () {
		return {
			scope: {},
			templateUrl: 'templates/item/qa_results_chart.html',
			replace: true,
			controller: 'QuestionAnswersCtrl',
			controllerAs: 'ctrl',
			link: function (scope, element, attrs) {



			}
		};
	})
	.controller('QuestionAnswersCtrl', function (analyticsSvc) {

			});
// angular.module('contestantApp', ['contestantList', 'contestantEditor']);
// <itt-flotr2-chart title="test" data="" options=""></itt-flotr2-chart>
