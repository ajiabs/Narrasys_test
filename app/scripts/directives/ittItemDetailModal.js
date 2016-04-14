'use strict';
/**
 * @ngdoc directive
 * @name iTT.directive:ittItemDetailModal
 * @restrict 'A'
 * @scope
 * @description
 * For opening modals with event objects
 * @requires iTT.service:appState
 * @param {Object} item Event object to display in modal
 */

angular.module('com.inthetelling.story')
	.directive('ittItemDetailModal', ittItemDetailModal);

	function ittItemDetailModal(appState) {
		return {
			restrict: 'A',
			replace: true,
			scope: {
				item: '=ittItemDetailModal'
			},
			templateUrl: 'templates/item/modal.html',
			link: function (scope) {

				var modalSmooth = {
					'transition': 'none'
				};

				if (!scope.item.animate) {
					scope.modalSmooth = modalSmooth;
				}

				scope.item = scope.item.item;
				scope.dismiss = function () {
					appState.itemDetail = false;
				};
			}

		};
	}
