(function () {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittNarrativeList', ittNarrativeList)
		.controller('NarrativeListCtrl', NarrativeListCtrl);

	function ittNarrativeList() {
		return {
			restrict: 'A',
			replace: true,
			templateUrl: 'templates/narrativelist.html',
			scope: {
				narrativesData: '=',
				customersData: '='
			},
			controller: 'NarrativeListCtrl',
			controllerAs: 'narrativeList',
			bindToController: true
		};
	}

	NarrativeListCtrl.$inject = ['$location','authSvc', 'appState', 'dataSvc', 'modelSvc'];

	function NarrativeListCtrl($location, authSvc, appState, dataSvc, modelSvc) {
		var ctrl = this;

		ctrl.narratives = ctrl.narrativesData;
		ctrl.customers = ctrl.customersData;
		ctrl.logout = authSvc.logout;
		ctrl.user = appState.user;
		ctrl.narrativeSelect = false;

		ctrl.toggleSelectNarrative = toggleSelectNarrative;
		ctrl.addNarrative = addNarrative;

		if (authSvc.userHasRole('admin') || authSvc.userHasRole('customer admin')) {
			ctrl.canAccess = true;
		}

		function toggleSelectNarrative() {
			ctrl.narrativeSelect = !ctrl.narrativeSelect;
		}

		function addNarrative(n) {
			dataSvc.createNarrative(n).then(function(narrative) {
				narrative.subDomain = modelSvc.customers[narrative.customer_id].domains[0];
				modelSvc.cache('narrative', narrative);
				$location.path('/story/' + narrative._id);
			});
		}

	}
})();

