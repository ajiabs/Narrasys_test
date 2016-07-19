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
				var initBcr = getDimensions();
				setTranslateY(initBcr);

				angular.element(window).bind('resize', function() {
					var bcr = getDimensions();
					setTranslateY(bcr);
				});

				function getDimensions() {
					return $(window).height();
				}

				function setTranslateY(bcr) {
					var transformStr = 'translateY(-' + bcr +'px)';
					elm.css('transform', transformStr);
				}
			}
	    };
	}


})();
