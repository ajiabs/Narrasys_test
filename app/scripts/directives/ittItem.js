'use strict';

// "Transmedia" Item Directive
angular.module('com.inthetelling.player')
	.directive('ittItem', function (modalMgr, videojs) {
		return {
			restrict: 'A',
			replace: false,
			template: '<div ng-include="item.templateUrl">Loading Item...</div>',
			scope: {
				item: '=ittItem'
			},
			link: function (scope, element, attrs) {
				// TODO this whole force-template thing is a total hack.  Should be handled at the scene level instead of here.
				// Most of this is overriding things back to default in the explore mode; that may wind up being better as a whole different
				// item directive.   (video mode uses it too, but much less complicated-ly)
				
				// check for forceTemplate attribute on the item ng-repeat.  If present, stash the real templateUrl in origTemplateUrl,
				// and set a new templateUrl value for this scene only.
				if (attrs.forceItemTemplate) {
					scope.item.origTemplateUrl = scope.item.templateUrl;
					if (scope.item.type === "annotation") {
						if (attrs.forceItemTemplate === "default" && scope.item.templateUrl.indexOf("templates/text-") > -1) {
							// leave headers and pullquotes alone in explore mode
						} else {
							scope.item.templateUrl="templates/transcript-"+attrs.forceItemTemplate+".html";
						}
					} else if (scope.item.type === "upload" || scope.item.type === "image") { // TODO "image" is probably an artifact of bad test data; need to check API to make sure that can safely be removed
						scope.item.templateUrl="templates/transmedia-image-"+attrs.forceItemTemplate+".html";
					} else if (scope.item.type === "link") {
						// HACK exceptions and special cases galore
						if (scope.item.templateUrl !== "templates/transmedia-link-noembed.html" && scope.item.templateUrl !== "templates/transmedia-link-frameicide.html") {
							scope.item.templateUrl="templates/transmedia-link-"+attrs.forceItemTemplate+".html";
						}
					} else {
						console.warn("PROBABLE ERROR: unknown item type ",scope.item);
					}
					// Stash and disable the styles and layout, too. (TODO: in future may want to allow some or all of these after all...)
					scope.item.origLayout = scope.item.layout;
					scope.item.layout = '';
					// HACK: forcing borderLeft in explore mode. TODO: producer should allow specifying a highlight for explore mode
					scope.item.origStyles = scope.item.styles;
					if (attrs.forceItemTemplate === "default") {
						scope.item.styles="highlightSide";
					} else {
						scope.item.styles = '';
					}
				} else {
					// no forceTemplate, so revert to the original (if there is one!)
					if (scope.item.origTemplateUrl) {
						scope.item.templateUrl = scope.item.origTemplateUrl;
						scope.item.layout = scope.item.origLayout;
						scope.item.styles = scope.item.origStyles;
					}
				}

				scope.toggleDetailView = function () {
					if (scope.item.showInlineDetail) {
						// if inline detail view is visible, close it. (If a modal is visible, this is inaccessible anyway, so no need to handle that case.)
						scope.item.showInlineDetail = false;
					} else {
						videojs.player.pause();
						if (element.closest('.content').width() > 500) {
							// otherwise show detail inline if there's room for it:
							scope.item.showInlineDetail = !scope.item.showInlineDetail;
						} else {
							// otherwise pop a modal
							modalMgr.createItemDetailOverlay(scope);
						}
					}
				};

			},
			controller: "ItemController"
		};
	});
