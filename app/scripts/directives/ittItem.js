'use strict';

/* 
NOTE: when authoring templates make sure that outgoing links call the outgoingLink() function, 
so they get logged properly: don't draw plain hrefs
*/

angular.module('com.inthetelling.story')
	.directive('ittItem', function ($http, $timeout, config, appState, analyticsSvc, timelineSvc, modelSvc) {
		return {
			restrict: 'A',
			replace: false,
			scope: {
				item: '=ittItem'
			},
			template: function (el, attrs) {
				if (attrs.forcetemplate) {
					return '<div ng-include="\'templates/item/' + attrs.forcetemplate + '.html\'"></div>';
				} else {
					return '<div ng-include="item.templateUrl"></div>';
				}
			},
			controller: 'ItemController',
			link: function (scope, element) {




				scope.toggleDetailView = function () {
					// console.log("Item toggleDetailView");
					if (scope.item.showInlineDetail) {
						// if inline detail view is visible, close it. (If a modal is visible, this is inaccessible anyway, so no need to handle that case.)
						scope.item.showInlineDetail = false;
					} else {
						timelineSvc.pause();
						scope.captureInteraction();
						if (element.width() > 400) {
							// show detail inline if there's room for it:
							scope.item.showInlineDetail = true;
						} else {
							// otherwise pop a modal:
							appState.itemDetail = scope.item;
						}
					}
				};
				var KeyCodes = {
					ENTER: 13,
					SPACE: 32
				};

				scope.toggleDetailOnKeyPress = function ($event) {
					var e = $event;
					var passThrough = true;
					switch (e.keyCode) {
					case KeyCodes.ENTER:
						scope.toggleDetailView();
						passThrough = false;
						break;
					case KeyCodes.SPACE:
						scope.toggleDetailView();
						passThrough = false;
						break;
					default:
						passThrough = true;
						break;
					}
					if (!passThrough) {
						$event.stopPropagation();
						$event.preventDefault();
					}
				};

				scope.forceModal = function () {
					timelineSvc.pause();
					appState.itemDetail = scope.item;
				};
				scope.outgoingLinkOnKeyPress = function (url, $event) {
					var e = $event;
					var passThrough = true;
					switch (e.keyCode) {
					case KeyCodes.ENTER:
						scope.outgoingLink(url);
						passThrough = false;
						break;
					case KeyCodes.SPACE:
						scope.outgoingLink(url);
						passThrough = false;
						break;
					default:
						passThrough = true;
						break;
					}
					if (!passThrough) {
						$event.stopPropagation();
						$event.preventDefault();
					}
				};


				scope.outgoingLink = function (url) {
					timelineSvc.pause();
					scope.captureInteraction();
					if (scope.item.targetTop) {
						$timeout(function () {
							window.location.href = url;
						});
					} else {
						window.open(url);
					}
				};

				scope.editItem = function () {
					appState.editEvent = scope.item;

					appState.videoControlsActive = true; // TODO see playerController showControls; this may not be sufficient on touchscreens
					appState.videoControlsLocked = true;
				};

				scope.captureInteraction = function () {
					analyticsSvc.captureEventActivity("clicked", scope.item._id);
				};

				// HACK: need to capture embedded links on item enter, since they're automatically 'clicked'
				if (scope.item.templateUrl === 'templates/item/link-embed.html') {
					scope.captureInteraction();
				}

				// HACK not sure why but modelSvc.resolveEpisodeAssets isn't always doing the job.
				// (Possibly a race condition?)  Quick fix here to resolve it:
				if (scope.item.asset_id && !scope.item.asset) {
					scope.item.asset = modelSvc.assets[scope.item.asset_id];
				}

				// Slight hack to simplify css for image-fill:
				if (scope.item.styleCss && scope.item.styleCss.match(/fill|contain|cover/)) {
					// TODO: figure out why item.asset.cssUrl works in IE, and item.backgroundImageStyle works in everything else.
					// Probably just an escaped-quote issue or something dumb like that
					scope.item.asset.cssUrl = "url('" + scope.item.asset.url + "');";
					scope.item.backgroundImageStyle = "background-image: url('" + scope.item.asset.url + "');";
				}

				// TODO plugins should each be their own directive!
				if (scope.item.data) {

					scope.plugin = scope.item.data._plugin;
					scope.plugin._type = scope.item.data._pluginType;

					// BEGIN multiple choice question
					if (scope.plugin._type === 'question') {
						scope.plugin.selectedDistractor = undefined;
						scope.scoreQuiz = function () {
							scope.plugin.distractors[scope.plugin.selectedDistractor].selected = true;
							scope.plugin.hasBeenAnswered = true;
							analyticsSvc.captureEventActivity("question-answered", scope.item._id, {
								'answer': scope.plugin.distractors[scope.plugin.selectedDistractor].text,
								'correct': !!(scope.plugin.distractors[scope.plugin.selectedDistractor].correct)
							});
						};

						scope.scorePoll = function () {
							scope.plugin.distractors[scope.plugin.selectedDistractor].selected = true;
							scope.plugin.hasBeenAnswered = true;

							analyticsSvc.captureEventActivity("question-answered", scope.item._id, {
								'answer': scope.plugin.distractors[scope.plugin.selectedDistractor].text,
								'correct': !!(scope.plugin.distractors[scope.plugin.selectedDistractor].correct)
							});
							// TODO: get back list of all users' responses (need a new api endpoint for this)
							// and display results
						};

						scope.resetQuestion = function () {
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
						// console.log("credly");
						// have analytics record that this event has been reached, so it can be used as a trigger for other achievements
						analyticsSvc.captureEventActivity("viewed", scope.item._id);
						if (appState.user.roles && appState.user.roles.length === 1 && appState.user.roles[0] === "guest") {
							scope.plugin.eligibleForBadges = false;
						} else {
							scope.plugin.eligibleForBadges = true;
							if (appState.user.emails) {
								scope.plugin.userEmail = appState.user.emails[0];
							} else {
								scope.plugin.userEmail = '';
							}
							scope.plugin.totalAchieved = 0;
						}

						scope.checkBadgeEligibility = function () {
							// console.log('checkBadgeEligibility');
							if (!scope.plugin.eligibleForBadges) {
								return;
							}

							angular.forEach(scope.plugin.requirements, function (req) {
								if (!req.achieved) {
									analyticsSvc.readEventActivity(req.eventId, req.activity)
										.then(function (achieved) {
											req.achieved = achieved;
											scope.countAchievements(); // can't just do totalAchieved++ here: .then() happens asynch to the forEach, so scoping problems
										});
								}
								scope.countAchievements(); // catch the case where all were already marked
							});
						};

						// update credly state every time the item becomes current or visible (i.e. in review mode)
						scope.$watch(function () {
							return scope.item.isCurrent || appState.viewMode === 'review';
						}, function (itIs, itWas) {
							if (itIs && !itWas) {
								scope.checkBadgeEligibility();
							}
						});

						scope.countAchievements = function () {
							var count = 0;
							angular.forEach(scope.plugin.requirements, function (req) {
								if (req.achieved) {
									count = count + 1;
								}
							});
							scope.plugin.totalAchieved = count;
							if (scope.plugin.totalAchieved === scope.plugin.requirements.length) {
								// HACK TODO we need to implement a real way for items to control the visibility of other items or scenes.
								// The silly workaround here only works (for some poorly-defined version of 'works') because USC episodes only have one badge
								scope.$parent.episode.styleCss = scope.$parent.episode.styleCss + " uscHackUserHasBadge";
							}
						};

						scope.badger = function () {
							scope.plugin.gettingBadge = true;
							$http({
									method: 'GET',
									url: config.apiDataBaseUrl + '/v1/send_credly_badge?badge_id=' + scope.plugin.credlyBadgeId + '&email=' + scope.plugin.userEmail
								})
								.
							success(function (data) {
									// TODO check the data to make sure it's not status: "Badge previously sent."
									scope.checkBadgeEligibility();
									// console.log("SUCCESS", data);
									if (data.status === 'Badge previously sent.') {
										scope.plugin.alreadyHadBadge = true;
									}
									scope.plugin.gotBadge = true;
								})
								.error(function () {
									scope.plugin.gettingBadge = false;
									scope.plugin.error = true; // TEMP HACK
								});
						};
					}
					// END credly badge
				}
				// end plugin

			}
		};
	});
