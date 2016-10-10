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
				data: '=',
				//for the invertColor option
				itemForm: '=?'
			},
			template: [
				'<div class="field">',
				'	<div class="label">Flags</div>',
				'	<div class="input">',
				'		<span ng-repeat="flag in $ctrl._flags">',
				'			<span ng-if="flag !== \'invertColor\'">',
				'				<label for="{{$ctrl._ids[flag]}}"></label>',
				'				<input id="{{$ctrl._ids[flag]}}" type="checkbox" itt-dynamic-model="\'$ctrl.data.\' + flag" ng-change="$ctrl.handleChange()"/>{{$ctrl._displays[flag]}}',
				'			</span>',
				'			<span ng-if="flag === \'invertColor\'">',
				'				<label for="{{$ctrl._ids[flag]}}"></label>',
				'				<input id="{{$ctrl._ids[flag]}}" type="checkbox" ng-model="$ctrl.itemForm.color" ng-true-value="\'Invert\'" ng-false-value="\'\'" ng-change="$ctrl.handleChange()"/>{{$ctrl._displays[flag]}}',
				'			</span>',
				'		</span>',
				'	</div>',
				'</div>'
			].join(' '),
			controller: ['$scope', 'selectService', 'ittUtils', function($scope, selectService, ittUtils) {
				var ctrl = this;
				ctrl._flags = angular.copy(ctrl.flags);
				ctrl.handleChange = handleChange;
				ctrl._displays = {
					required: 'Required',
					stop: 'Stop item',
					cosmetic: 'Cosmetic',
					chapter_marker: 'Chapter Event',
					invertColor: 'Invert Color'
				};
				ctrl._ids = {
					required: 'itemRequired',
					stop: 'itemStop',
					cosmetic: 'itemCosmetic',
					chapter_marker: 'itemChapter',
					invertColor: 'Invert'
				};

				$scope.$watch(watchTemplateUrl, setFlags);

				function handleChange() {
					if (ctrl.data.hasOwnProperty('stop')) {
						selectService.onSelectChange(ctrl.data, ctrl.itemForm);
					}
				}

				function _h1OrH2(url) {
					return (url === 'templates/item/text-h1.html' || url === 'templates/item/text-h2.html');
				}

				function watchTemplateUrl() {
					return ctrl.data.templateUrl;
				}

				function setFlags(newVal) {
					if (newVal) {
						if (ctrl.data.templateUrl === 'templates/item/image-fill.html') {
							ctrl._flags = ctrl._flags.filter(function(f) {
								return f !== 'stop';
							});
						} else {
							ctrl._flags = ctrl.flags;
						}

						if (!_h1OrH2(newVal)) {
							if (ittUtils.existy(ctrl.itemForm)) {
								ctrl.itemForm.color = '';

							}
							ctrl._flags = ctrl._flags.filter(function(f) {
								return f !== 'chapter_marker' && f !== 'invertColor';
							});
						} else {
							ctrl._flags = ctrl.flags;
							if (ittUtils.existy(ctrl.itemForm)) {
								ctrl.itemForm.color = 'Invert';
							}
						}
					}
				}

			}],
			controllerAs: '$ctrl',
			bindToController: true
	    };
	}


})();
