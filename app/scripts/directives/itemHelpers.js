'use strict';
/*
Directives for use inside of item templates

ittTimestamp
ittText 
*/

angular.module('com.inthetelling.story')

.directive('ittTimestamp', function () {
		return {
			restrict: 'A',
			replace: true,
			scope: {
				item: '=ittTimestamp',
				pos: '@pos'
			},
			template: '<span ng-include="\'/templates/v2/timestamp/\'+(item.tmpl.timestamp||\'default\')+\'-\'+pos+\'.html\'"></span>',
			link: function () {

			}
		};
	})
	.directive('ittText', function () {
		return {
			restrict: 'A',
			replace: false,
			scope: {
				font: '=ittText', // {face: 'default',size: 50,color: '#000'}
				bindval: '='
			},
			template: '<span class="type-{{font.face}}" ng-class="{lorem: !bindval}" ng-style="{fontSize: font.size+\'%\', color: font.color}" ng-bind-html="bindval"></span>',
			link: function (scope) {
				scope.font = scope.font || {};
				scope.font.face = scope.font.face || 'default';
				scope.font.size = scope.font.size || '100';
				scope.font.color = scope.font.color || '#000';
			}
		};
	});
