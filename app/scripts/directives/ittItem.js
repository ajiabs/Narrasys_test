'use strict';

// "Transmedia" Item Directive
angular.module('com.inthetelling.player')
.directive('ittItem', function (modalMgr) {
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
				scope.item.origTemplateUrl = scope.item.templateUrl;
				scope.item.templateUrl = "templates/transmedia-"+scope.item.type+"-"+attrs.forceTemplate+".html";
				// TODO: force layouts and styles too?  Ideally this won't be necessary, the layouts and styles will either be interchangeable or no-op, but will need to try it to be sure
			} else {
				// no forceTemplate, so revert to the original (if there is one!)
				if (scope.item.origTemplateUrl) {
					scope.item.templateUrl = scope.item.origTemplateUrl;
				}
			}
			
			scope.toggleDetailView = function() {
				if (scope.item.showInlineDetail) {
					// if inline detail view is visible, close it. (If a modal is visible, this is inaccessible anyway, so no need to handle that case.)
					scope.item.showInlineDetail = false;
				} else if (element.closest('.content').width() > 400) {
					// otherwise show detail inline if there's room for it:
					scope.item.showInlineDetail = !scope.item.showInlineDetail;
				} else {
					// otherwise pop a modal
					modalMgr.createItemDetailOverlay(scope);
				}
			};

		},
		controller: "ItemController"
	};
});

