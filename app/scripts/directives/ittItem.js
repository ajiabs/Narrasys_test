'use strict';

/* 
NOTE: when authoring templates make sure that outgoing links call the link() function, 
so they get logged properly: don't draw plain hrefs
*/


angular.module('com.inthetelling.player')
	.directive('ittItem', function(modelSvc, analyticsSvc, timelineSvc) {
		return {
			restrict: 'A',
			replace: true,
			scope: {
				item: '=ittItem'
			},
			template: '<div ng-click="editItem($event)" ng-include="item.templateUrl">Loading Item...</div>',
			controller: 'ItemController',
			link: function(scope, element, attrs) {
				// console.log('ittItem', scope, element, attrs);


				// TODO plugins should each be their own directive!
				if (scope.item.data) {
					scope.plugin = scope.item.data._plugin;
					scope.plugin._type = scope.item.data._pluginType;

					// ng-model was handling this before, but now broken somehow. Forcing it for demo:
					scope.setChoice = function(i) {
						if (!scope.plugin.hasBeenAnswered) {
							scope.plugin.selectedDistractor = i;
						}
					};

					scope.scoreQuiz = function() {
						scope.plugin.distractors[scope.plugin.selectedDistractor].selected = true;

						scope.plugin.hasBeenAnswered = true;
						// TODO send whatever credly-ish "achievement unlocked" message to API here
					};

					scope.resetQuestion = function() {
						console.log("RESET");
						scope.plugin.selectedDistractor = undefined;
						scope.plugin.hasBeenAnswered = false;
						for (var i = 0; i < scope.plugin.distractors.length; i++) {
							scope.plugin.distractors[i].selected = false;
						}
					};
				}
				// end plugin

				scope.toggleDetailView = function() {
					console.log("Item toggleDetailView");
					if (scope.item.showInlineDetail) {
						// if inline detail view is visible, close it. (If a modal is visible, this is inaccessible anyway, so no need to handle that case.)
						scope.item.showInlineDetail = false;
					} else {
						scope.captureInteraction();
						if (element.closest('.content').width() > 500) {
							// show detail inline if there's room for it:
							scope.item.showInlineDetail = true;
						} else {
							// otherwise pop a modal:
							timelineSvc.pause();
							modelSvc.appState.itemDetail = scope.item;
						}
					}
				};

				scope.forceModal = function() {
					timelineSvc.pause();
					modelSvc.appState.itemDetail = scope.item;
				};

				scope.outgoingLink = function(url) {
					timelineSvc.pause();
					scope.captureInteraction();
					window.open(url);
				};

				scope.captureInteraction = function() {
					analyticsSvc.captureEventActivity("clicked", scope.item._id);
				};

			}
		};
	});
