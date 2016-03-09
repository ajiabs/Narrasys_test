/**
 * Created by githop on 3/8/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittLetterSpace', ittLetterSpace);

	function ittLetterSpace() {
	    return {
	        restrict: 'EA',
	        link: link
	    };


		function link(scope, elm, attrs) {
			//console.log(elm.find('.h1-item'));

			scope.$evalAsync(function() {
				var h1Item = elm.find('.h1-item');

				//h1Item.css('letter-spacing', '0.3em');
				$(h1Item).css('color', 'red');

			});

		}
	}


})();
