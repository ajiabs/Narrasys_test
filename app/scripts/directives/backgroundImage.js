'use strict';

angular.module('com.inthetelling.player')
.directive('backgroundImage', function(){
	return function(scope, element, attrs){
		attrs.$observe('backgroundImage', function(value) {
			element.css({
					'background-image': 'url(' + value +')',
			});
		});
	};
});
