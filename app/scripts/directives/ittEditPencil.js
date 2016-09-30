/**
 * Created by githop on 6/16/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittEditPencil', ittEditPencil);

	function ittEditPencil() {
	    return {
	        restrict: 'EA',
			transclude: true,
			scope: {
				canAccess: '=?',
				onEdit: '&'
			},
			template: [
				'<div>',
				'	<span ng-transclude></span>',
				'	<span style="text-indent: 0">',
				'		<span class="edit-pencil" ng-click="onEdit()" ng-if="showPencil"></span>',
				'	</span>',
				'</div>'
			].join(' '),
			link: function(scope, elm) {
				scope.showPencil = false;
				if (scope.canAccess === true) {
					elm.mouseenter(function() {
						scope.$apply(function() {
							scope.showPencil = true;
						});
					});

					elm.mouseleave(function() {
						scope.$apply(function() {
							scope.showPencil = false;
						});
					});
				}
			}
	    };
	}


})();
