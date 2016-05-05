/**
 * Created by githop on 5/2/16.
 */



(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittDemoDrop', ittDemoDrop);

	function ittDemoDrop() {
	    return {
	        restrict: 'EA',
			replace: true,
			template: [
				'<div class="drop-target">',
				'	<div class="drop-box"><h1 ng-show="dropDisabled">Please Add Video First!</h1><i ng-hide="dropDisabled" class="fa fa-3 {{faIcon}}"></i></div>',
				'</div>'
			].join(''),
	        scope: {
				onDrop: '&',
				faIcon: '@'
			},
			link: link
	    };


		function link(scope, elm) {
			elm[0].addEventListener('drop', handleDrop);
			elm[0].addEventListener('dragover', handleDragOver);
			elm[0].addEventListener('dragenter', handleDragEnter);
			elm[0].addEventListener('dragleave', handleDragLeave);

			function handleDrop(ev) {
				ev.preventDefault();
				scope.onDrop({ev: ev.dataTransfer.files});
				elm.remove();
			}

			function handleDragOver(ev) {
				ev.preventDefault();

				var isDisabled = elm.hasClass('disable-drop');
				if (isDisabled) {
					ev.dataTransfer.dropEffect = 'none';
				} else {
					ev.dataTransfer.dropEffect = 'move';
				}

				handleDragEnter();
				return false;
			}

			function handleDragEnter() {
				var isDisabled = elm.hasClass('disable-drop');
				if (isDisabled) {
					scope.dropDisabled = true;
				}
				elm.addClass('droppable');
			}

			function handleDragLeave() {
				scope.dropDisabled = false;
				elm.removeClass('droppable');
			}
		}
	}


})();
