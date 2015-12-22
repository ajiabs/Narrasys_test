/**
 * Created by githop on 12/21/15.
 */

(function(){
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittToolbarStory', ittToolbarStory);

	function ittToolbarStory() {
		return {
			scope: true,
			templateUrl: 'templates/toolbar-story.html'
		};
	}
})();
