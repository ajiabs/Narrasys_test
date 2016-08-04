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
	        scope: {
				flags: '=',
				item: '='
			},
			template: [
				'<div class="field">',
				'	<div class="label">Flags</div>',
				'	<div class="input">',
				'		<span ng-repeat="flag in flags._flags">',
				'			<label for="{{flags._ids[flag]}}"></label>',
				'			<input id="{{flags._ids[flag]}}" type="checkbox" itt-dynamic-model="\'flags.item.\' + flag" ng-change="flags.handleChange()"/>{{flags._displays[flag]}}',
				'		</span>',
				'	</div>',
				'</div>'
			].join(' '),
			controller: ['$scope', 'selectService', function($scope, selectService) {
				var ctrl = this;
				ctrl._flags = angular.copy(ctrl.flags);
				ctrl.handleChange = handleChange;
				ctrl._displays = {
					required: 'Required',
					stop: 'Stop item',
					cosmetic: 'Cosmetic',
					chapter_marker: 'Chapter Event'
				};
				ctrl._ids = {
					required: 'itemRequired',
					stop: 'itemStop',
					cosmetic: 'itemCosmetic',
					chapter_marker: 'itemChapter'
				};

				$scope.$watch(watchTemplateUrl, setFlags);

				function handleChange() {
					if (ctrl.item.hasOwnProperty('stop')) {
						selectService.onSelectChange(ctrl.item);
					}
				}

				function _h1OrH2(url) {
					return (url === 'templates/item/text-h1.html' || url === 'templates/item/text-h2.html');
				}

				function watchTemplateUrl() {
					return ctrl.item.templateUrl;
				}

				function setFlags(newVal) {
					if (newVal) {
						if (!_h1OrH2(newVal)) {
							ctrl._flags = ctrl._flags.filter(function(f) {
								return f !== 'chapter_marker';
							});
						} else {
							ctrl._flags = ctrl.flags;
						}
					}
				}

			}],
			controllerAs: 'flags',
			bindToController: true
	    };
	}


})();
