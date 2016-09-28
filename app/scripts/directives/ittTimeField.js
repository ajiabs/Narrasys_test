/**
 * Created by githop on 6/30/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittTimeField', ittTimeField);

	function ittTimeField() {
	    return {
	        restrict: 'EA',
			scope: true,
	        template: [
			'<div class="field" ng-if="!(item._type===\'Scene\' && item.start_time <= 0.1)">',
			'	<div class="label">Start</div>',
			'	<div class="input">',
			'		<span sxs-input-time="item" x-input-field="start_time"></span>',
			'		<span ng-if="!(item.stop || item._type === \'Scene\' || item._type === \'Chapter\')">',
			'			<span class="label"> &nbsp; &nbsp; &nbsp; End</span>',
			'			<span sxs-input-time="item" x-input-field="end_time"></span>',
			'		</span>',
			'	</div>',
			'</div>'
			].join(' ')
	    };
	}


})();
