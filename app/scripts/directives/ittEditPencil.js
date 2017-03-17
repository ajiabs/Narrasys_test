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
				'	<span class="pencil__content" ng-transclude></span>',
				'	<span style="text-indent: 0">',
				'		<span class="edit-pencil" ng-click="onEdit({$event: $event})" ng-if="showPencil"></span>',
				'	</span>',
				'</div>'
			].join(' '),
			link: function(scope, elm) {
				scope.showPencil = false;

        elm.mouseenter(function() {
          if (scope.canAccess === true) {
            scope.$apply(function() {
              scope.showPencil = true;
            });
          }
        });

        elm.mouseleave(function() {
          if (scope.canAccess === true) {
            scope.$apply(function() {
              scope.showPencil = false;
            });
          }
        });
			}
	    };
	}


})();
