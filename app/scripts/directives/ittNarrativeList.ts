export function ittNarrativeList() {
	'ngInject';
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

export function NarrativeListCtrl($location, authSvc, appState, dataSvc) {
	'ngInject';
	var ctrl = this;

	ctrl.narratives = ctrl.narrativesData;
	ctrl.customers = ctrl.customersData;
	ctrl.logout = authSvc.logout;
	ctrl.user = appState.user;
	ctrl.narrativeSelect = false;

	ctrl.toggleSelectNarrative = toggleSelectNarrative;
	ctrl.addNarrative = addNarrative;

	if (authSvc.userHasRole('admin')) {
		ctrl.canAccess = true;
	}

	function toggleSelectNarrative() {
		ctrl.narrativeSelect = !ctrl.narrativeSelect;
	}

	function addNarrative(n) {
		dataSvc.createNarrative(n).then(function (narrativeResp) {
			$location.path('/story/' + narrativeResp._id);
		});
	}

}

