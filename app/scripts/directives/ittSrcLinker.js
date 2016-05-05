/**
 * Created by githop on 4/28/16.
 */


(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittSrcLinker', ittSrcLinker);

	function ittSrcLinker(ittUtils) {
	    return {
			scope: {
				item: '='
			},
			link: function(scope, elm) {
				var existy = ittUtils.existy;
				scope.$watch('item', function(newVal) {
					console.count("iframe src change!");

					if (!existy(newVal)) { return; }

					if (existy(newVal) && existy(newVal.asset)) {
						elm.attr('src', newVal.asset.url);
					} else {
						console.log('newVal', newVal);
						elm.attr('src', newVal.url);
					}
					elm.load();
				});
			}
	    };
	}


})();
