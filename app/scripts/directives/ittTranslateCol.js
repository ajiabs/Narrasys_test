/**
 * Created by githop on 7/19/16.
 */
(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittTranslateCol', ittTranslateCol);

	function ittTranslateCol() {
	    return {
	        restrict: 'EA',
	        link: function(scope, elm, attr) {
	        	var parentCol = $('.col');


				var initBcr = getDimensions();
				setTranslateY(initBcr);

				angular.element(window).bind('resize', function() {
					console.log('window resized!!', getDimensions());
					var bcr = getDimensions();
					setTranslateY(bcr);
				});

				function getDimensions() {
					return $(window).height();
					// return parentCol[0].getBoundingClientRect();
				}

				function setTranslateY(bcr) {
					var val = bcr;
					var transformStr = 'translateY(-' + val +'px)';
					elm.css('transform', transformStr);
				}
			}
	    };
	}


})();
