export function ittNarrativeList() {
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

NarrativeListCtrl.$inject = ['$location', 'authSvc', 'appState', 'dataSvc'];
export function NarrativeListCtrl($location, authSvc, appState, dataSvc) {
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

