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
	        link: function(scope, elm) {
	        	//offset of top toolbar
	        	var topConst = 85;
				var initBcr = elm[0].getBoundingClientRect();

				setTranslateY(initBcr.top - topConst);

				var currentDimensions = getDimensions();

				angular.element(window).bind('resize', function() {
					var bcr = getDimensions();
					var val = bcr.top - currentDimensions.top;
					setTranslateY(val);
				});

				function getDimensions() {
					console.log('bcr', elm[0].getBoundingClientRect());
					return elm[0].getBoundingClientRect();
				}

				function setTranslateY(top) {
					var val = top;
					var transformStr = 'translateY(-' + val +'px)';
					elm.css('transform', transformStr);
				}
			}
	    };
	}


})();
