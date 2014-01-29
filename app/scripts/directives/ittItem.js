'use strict';

// "Transmedia" Item Directive
angular.module('com.inthetelling.player')
	.directive('ittItem', function (modalMgr) {
		return {
			restrict: 'A',
			replace: false,
			template: '<div ng-include="item.templateUrl">Loading Item...</div>',
			scope: {
				item: '=ittItem'
			},
			link: function (scope, element, attrs) {

				// check for forceTemplate attribute on the item ng-repeat.  If present, stash the real templateUrl in origTemplateUrl,
				// and set a new templateUrl value for this scene only.
				if (attrs.forceItemTemplate) { 
					scope.item.origTemplateUrl = scope.item.templateUrl;
					if (scope.item.type === "annotation") {
						scope.item.templateUrl="templates/transcript-"+attrs.forceItemTemplate+".html";
					} else if (scope.item.type === "upload") {
						scope.item.templateUrl="templates/transmedia-image-"+attrs.forceItemTemplate+".html";
					} else if (scope.item.type === "link") {
						// HACK exceptions and special cases galore
						if (scope.item.templateUrl !== "templates/transmedia-link-noembed.html") {
							scope.item.templateUrl="templates/transmedia-link-"+attrs.forceItemTemplate+".html";
						}
					} else {
						console.warn("PROBABLE ERROR: unknown item type ",scope.item);
					}
					// TODO: force layouts and styles too?  Ideally this won't be necessary, the layouts and styles will either be interchangeable or no-op, but will need to try it to be sure
				} else {
					// no forceTemplate, so revert to the original (if there is one!)
					if (scope.item.origTemplateUrl) {
						scope.item.templateUrl = scope.item.origTemplateUrl;
					}
				}

				scope.toggleDetailView = function () {
					if (scope.item.showInlineDetail) {
						// if inline detail view is visible, close it. (If a modal is visible, this is inaccessible anyway, so no need to handle that case.)
						scope.item.showInlineDetail = false;
					} else if (element.closest('.content').width() > 500) {
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
