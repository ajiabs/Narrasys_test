/**
 * Created by githop on 7/1/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittDynamicModel', ittDynamicModel);

  ittDynamicModel.$inject = ['$compile', '$parse'];

	//http://stackoverflow.com/a/32096328
	function ittDynamicModel($compile, $parse) {
		return {
			restrict: 'A',
			terminal: true,
			priority: 100000,
			link: function (scope, elem) {
				var name = $parse(elem.attr('itt-dynamic-model'))(scope);
				elem.removeAttr('itt-dynamic-model');
				elem.attr('ng-model', name);
				$compile(elem)(scope);
			}
		};
	}

})();
