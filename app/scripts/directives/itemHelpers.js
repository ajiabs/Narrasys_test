'use strict';
/*
Directives for use inside of item templates

loremVal
ittTimestamp

*/

angular.module('com.inthetelling.story')
	.directive('loremVal', function () {
		return {
			restrict: 'A',
			replace: false,
			scope: {
				val: '=loremVal'
			},
			template: '<span ng-class="{lorem: !val}" ng-bind-html="val"></span>'
		};
	})
	.directive('ittTimestamp', function () {
		return {
			restrict: 'A',
			replace: 'true',
			scope: {
				item: '=ittTimestamp',
				pos: '@pos'
			},
			template: '<span ng-include="\'/templates/v2/timestamp/\'+(item.tmpl.timestamp||\'default\')+\'-\'+pos+\'.html\'"></span>',
			link: function () {

			}
		};
	})

;
