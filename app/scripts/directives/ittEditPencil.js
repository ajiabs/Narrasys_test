/**
 * Created by githop on 6/16/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittEditPencil', ittEditPencil);

	function ittEditPencil() {
	    return {
	        restrict: 'A',
			scope: {
				canAccess: '=',
				onEdit: '&'
			},
			link: function(scope, elm) {
				if (scope.canAccess === true) {
					elm.mouseenter(function() {
						elm.addClass('edit-pencil');
					});

					elm.mouseleave(function() {
						elm.removeClass('edit-pencil');
					});

					//idomatic angular would say use ng-click, however this
					//directive does not have a template, so there is no
					//markup to append an ng-click attribute to...
					//binding to click event doesn't kick off a digest (like ng-click does)
					//we'll need to tell angular that a click happened,
					//thus we use $apply to let ng know clicks are happening.
					elm[0].addEventListener('click', function() {
						scope.$apply(scope.onEdit);
					});
				}


			}
	    };
	}


})();
