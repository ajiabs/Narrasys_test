/**
 * Created by githop on 6/30/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittFlags', ittFlags);

	function ittFlags() {
	    return {
	        restrict: 'EA',
	        scope: true,
			template: [
			'<div class="field">',
			'	<div class="label">Flags</div>',
			'	<div class="input">',
			'		<label for="itemRequired"></label>',
			'		<input id="itemRequired" type="checkbox" ng-model="item.required">Required',
			'		<label for="itemStop"></label>',
			'		<input id="itemStop" type="checkbox" ng-change="selectService.onSelectChange(item)" ng-model="item.stop">Stop item',
			'		<label for="itemCosmetic"></label>',
			'		<input id="itemCosmetic" type="checkbox" ng-model="item.cosmetic">Cosmetic',
			'		<div ng-if="item.templateUrl === \'templates/item/text-h1.html\' || item.templateUrl === \'templates/item/text-h2.html\'">',
			'			<label for="itemChapter"></label>',
			'			<input id="itemChapter" type="checkbox" ng-model="item.chapter_marker">Chapter Event',
			'		</div>',
			'	</div>',
			'</div>'
			].join(' ')
	    };
	}


})();
