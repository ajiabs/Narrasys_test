'use strict';

/* 
NOTE: when authoring templates make sure that outgoing links call the link() function, 
so they get logged properly: don't draw plain hrefs
*/


angular.module('com.inthetelling.player')
	.directive('ittItem', function($http, config, modelSvc, analyticsSvc, timelineSvc) {
		return {
			restrict: 'A',
			replace: true,
			scope: {
				item: '=ittItem'
			},
			template: function(el, attrs) {
				if (attrs.forcetemplate) {
					return '<div ng-include="\'templates/item/' + attrs.forcetemplate + '.html\'"></div>';
				} else {
					return '<div ng-include="item.templateUrl"></div>';
				}
			},
			controller: 'ItemController',
			link: function(scope, element, attrs) {
				// console.log('ittItem', scope, element, attrs);


				// TODO plugins should each be their own directive!
				if (scope.item.data) {
					scope.plugin = scope.item.data._plugin;
					scope.plugin._type = scope.item.data._pluginType;

					// BEGIN multiple choice question
					if (scope.plugin._type === 'multiplechoice') {
						// ng-model was handling this before, but now broken somehow. Forcing it for demo:
						scope.setChoice = function(i) {
							if (!scope.plugin.hasBeenAnswered) {
								scope.plugin.selectedDistractor = i;
							}
						};

						scope.scoreQuiz = function() {
							scope.plugin.distractors[scope.plugin.selectedDistractor].selected = true;

							scope.plugin.hasBeenAnswered = true;

							analyticsSvc.captureEventActivity("question-answered", scope.item._id);
						};

						scope.resetQuestion = function() {
							// console.log("RESET");
							scope.plugin.selectedDistractor = undefined;
							scope.plugin.hasBeenAnswered = false;
							for (var i = 0; i < scope.plugin.distractors.length; i++) {
								scope.plugin.distractors[i].selected = false;
							}
						};
					}
					// END m/c question
					// BEGIN credly badge
					if (scope.plugin._type === 'credlyBadge') {
						// TODO: have analytics record that this event has been reached, so it can be used as a trigger for 
						// other achievements

						// Don't show this to guest users
						var userData = modelSvc.appState.user;

						if (userData.roles.length && userData.roles[0] !== 'guest') {
							scope.plugin.eligibleForBadges = true;
							scope.plugin.userEmail = userData.emails[0];
							scope.plugin.totalAchieved = 0;

							angular.forEach(scope.plugin.requirements, function(req) {
								analyticsSvc.readEventActivity(req.eventId, req.activity)
									.then(function(achieved) {
										req.achieved = achieved;
										if (achieved) {
											scope.plugin.totalAchieved++;
										}
									});
							});
						} else {
							// not badge-eligible, move on
							//timelineSvc.play();
						}

						scope.badger = function() {
							scope.plugin.gettingBadge = true;
							$http({
								method: 'GET',
								url: config.apiDataBaseUrl + '/v1/send_credly_badge?badge_id=' + scope.plugin.credlyBadgeId + '&email=' + scope.plugin.userEmail
							}).
							success(function(data, status, headers, config) {
								// TODO check the data to make sure it's not status: "Badge previously sent."
								// console.log("SUCCESS", data);
								if (data.status === 'Badge previously sent.') {
									scope.plugin.alreadyHadBadge = true;
								}
								scope.plugin.gotBadge = true;

							}).
							error(function(data, status, headers, config) {
								// called asynchronously if an error occurs
								// or server returns response with an error status.
							});
						};
					}
					// END credly badge
				}
				// end plugin

				scope.toggleDetailView = function() {
					// console.log("Item toggleDetailView");
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
