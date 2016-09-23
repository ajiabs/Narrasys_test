/**
 * Created by githop on 8/5/16.
 */
(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittFilesHandler', ittFilesHandler);

	function ittFilesHandler() {
	    return {
	    	scope: {
	    		onSelected: '&'
			},
	        restrict: 'A',
			link: function(scope, elm) {
				elm.bind('change', function() {
					scope.$apply(function() {
						console.log('changed?');
						scope.onSelected({files: elm[0].files});
					});
				});
			}
	    };
	}


})();
