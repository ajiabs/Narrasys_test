'use strict';

// "Transmedia" Item Directive
angular.module('com.inthetelling.player')
.directive('ittItem', function () {
	return {
		restrict: 'A',
		replace: true,
		template: '<div ng-include="item.templateUrl">Loading Item...</div>',
		scope: {
			item: '=ittItem'
		},
		link: function(scope, element, attrs) {
			// check for forceTemplate attribute on the item ng-repeat.  If present, stash the real templateUrl in origTemplateUrl,
			// and set a new templateUrl value for this scene only.
			if (attrs.forceTemplate) {
				console.log(scope.item);
				scope.item.origTemplateUrl = scope.item.templateUrl
				scope.item.templateUrl = "templates/transmedia-"+scope.item.type+"-"+attrs.forceTemplate+".html";
			} else {
				// no forceTemplate, so revert to the original (if there is one!)
				if (scope.item.origTemplateUrl) {
					scope.item.templateUrl = scope.item.origTemplateUrl;
				}
			}
		},
		controller: function($scope, modalMgr) {
			// pass through method to modal.createItemDetailOverlay() for templates
			$scope.launchDetailView = function() {
				modalMgr.createItemDetailOverlay($scope);
			};
		}
	};
});
