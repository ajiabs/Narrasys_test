/**
 * Created by githop on 5/10/16.
 */

(function () {
	'use strict';

	angular.module('com.inthetelling.story')
		.component('ittSidenav', {
			templateUrl: 'templates/sidenav.html',
			bindings: {
				layouts: '<',
				visible: '<',
				onSelect: '&'
			},
			controller: function ittSideNavCtrl() {
				var ctrl = this;
				ctrl.$onInit = function() {
					console.log('hmmm');
					ctrl.firstSelect = false;
				};

				ctrl.setSelect = function(l) {
					ctrl.onSelect(l);
					ctrl.l = l;
					ctrl.firstSelect = true;
				};

			}
		});


})();
