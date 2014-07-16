'use strict';

// jQuery dependencies: offset(), animate(), namespaced .bind and .unbind 
// TODO some events need to be unbound on destroy, which I'll get around to implementing if this ever needs to be destroyed
// TODO for now simply hiding volume controls on touchscreen devices (they'll use native buttons). Future, see if we can include those and have them work properly...

angular.module('com.inthetelling.story')
	.directive('ittTimeline', function (appState, timelineSvc) {
		return {
			restrict: 'A',
			replace: true,
			scope: true,
			templateUrl: "templates/timeline.html",
			controller: "TimelineController",
			link: function (scope, element, attrs) {
				console.log('ittTimeline', scope, element, attrs);

				scope.appState = appState;
				scope.timeline = timelineSvc;
				scope.handlePosition = 0; // position of draghandle (as a fraction of full timeline)
				scope.zoomLevel = 1; // multiples by which the timeline is zoomed in
				scope.zoomOffset = 0; // multiple by which the timeline is offset to the left
				var timelineNode = element.find('.progressbarContainer');
				var timelineContainer = element.find('.progressbar');

				// TODO: display buffered portion of video?

				scope.showSceneMenuTooltip = function (makeVisible) {
					if (makeVisible && !(appState.isTouchDevice)) {
						scope.sceneMenuToolTip = true;
					} else {
						scope.sceneMenuToolTip = false;
					}
				};

				scope.prevScene = function () {
					for (var i = timelineSvc.markedEvents.length - 1; i >= 0; i--) {
						var now = appState.time;
						if (appState.timelineState === 'playing') {
							now = now - 3; // leave a bit of fudge when skipping backwards in a video that's currently playing
						}
						if (timelineSvc.markedEvents[i].start_time < now) {
							// console.log("Seeking to ", timelineSvc.markedEvents[i].start_time);
							timelineSvc.seek(timelineSvc.markedEvents[i].start_time, "prevScene");
							break;
						}
					}
				};
				scope.nextScene = function () {
					var found = false;
					for (var i = 0; i < timelineSvc.markedEvents.length; i++) {
						if (timelineSvc.markedEvents[i].start_time > appState.time) {
							// console.log("Seeking to ", timelineSvc.markedEvents[i].start_time);
							timelineSvc.seek(timelineSvc.markedEvents[i].start_time, "nextScene");
							found = true;
							break;
						}
					}
					if (!found) {
						timelineSvc.seek(appState.duration, "nextScene");
					}
				};

				scope.userChangingVolume = function (evt) {
					if (appState.muted) {
						scope.toggleMute();
					}
					var volumeNode = angular.element(evt.currentTarget);
					var updateVolume = function (movement, noApplyNeeded) {
						var newVolume = (movement.clientX - volumeNode.offset().left) / volumeNode.width() * 100;
						if (newVolume > 98) {
							newVolume = 100;
						}
						if (newVolume < 3) {
							newVolume = 0;
						}
						if (noApplyNeeded) {
							scope.setVolume(newVolume); // mousedown
						} else {
							scope.$apply(scope.setVolume(newVolume)); // mousemove
						}
					};
					updateVolume(evt, true); //mousedown
					volumeNode.bind('mousemove.volume', updateVolume); // mousemove
					angular.element(document).bind('mouseup.volume', function () {
						angular.element(document).unbind('mouseup.volume');
						volumeNode.unbind('mousemove.volume');
					});
				};

				scope.currentVolume = function () {
					if (appState.muted) {
						return 0;
					} else {
						return appState.volume;
					}
				};

				scope.audioIcon = function () {
					if (appState.muted) {
						return "muted";
					} else {
						return "vol" + Math.floor(appState.volume / 34);
					}
				};

				scope.showTooltip = function (event) {
					// console.log("tip: ", event);
					event.showTooltip = true;
				};
				scope.hideTooltip = function (event) {

					event.showTooltip = false;
				};

				scope.zoomIn = function () {
					scope.stopWatching = true;
					scope.zoomLevel = scope.zoomLevel + 1;
					zoom();
				};
				scope.zoomOut = function () {
					scope.stopWatching = true;
					scope.zoomLevel = scope.zoomLevel - 1;
					if (scope.zoomLevel < 1) {
						scope.zoomLevel = 1;
					}
					zoom();
				};

				// adjust the position of the playhead after a scale change:
				var zoom = function () {
					scope.zoomOffset = -((scope.zoomLevel - 1) * (appState.time / appState.duration));
					timelineNode.animate({
						"left": (scope.zoomOffset * 100) + "%",
						"width": (scope.zoomLevel * 100) + "%"
					}, 1000, function () {
						scope.stopWatching = false;
					});
				};

				// at all times keep playhead position at the same % of the visible progress bar as the time is to the duration
				// TODO: (cosmetic) stop watching while zoom-animation is in progress
				scope.$watch(function () {
					return {
						t: appState.time,
						d: appState.duration,
					};
				}, function () {
					if (!scope.stopWatching) {
						scope.zoomOffset = -((scope.zoomLevel - 1) * (appState.time / appState.duration));
						timelineNode.css({
							"left": (scope.zoomOffset * 100) + '%'
						});
					}
				}, true);

				// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
				// BEGIN handling of seek: mouse/touch interactions with the playhead
				// startSeek when they mousedown or touchdown (binds the finish and cancel events)
				// seeking on mousemove or touchmove (sets the time they will be seeking to)
				// finishSeek when they mouseup or touchend inside the playhead (triggers the actual seek)
				// cancelSeek when they mouseup or touchend outside the playhead (cancels)

				var startSeek = function (evt) {
					scope.isSeeking = true;

					var userEventName = (appState.isTouchDevice) ? 'touchend.timeline' : 'mouseup.timeline';
					timelineContainer.bind(userEventName, function () {
						finishSeek();
					});
					angular.element(document).bind(userEventName, function () {
						cancelSeek();
					});
					seeking(evt);
				};

				// triggered on mousemove:
				var seeking = function (evt) {
					if (!scope.isSeeking) {
						return;
					}

					// timelineNode is the full timeline, including offscreen portions if zoomed in.
					// So this math gives how far the pointer is in the full timeline as a percentage, 
					// multiplied by the real duration, which gives the real time.
					scope.willSeekTo = (evt.clientX - timelineNode.offset().left) / timelineNode.width() * appState.duration;

					// ios is still registering drags outside the visible boundaries of the timeline, 
					// so need to do some sanity checking here:
					if (scope.willSeekTo < 0) {
						scope.willSeekTo = 0;
					}
					if (scope.willSeekTo > appState.duration) {
						scope.willSeekTo = appState.duration;
					}
				};

				var finishSeek = function () {
					// console.log("timeline mouseup or touchend");
					scope.stopWatching = true;
					timelineSvc.seek(scope.willSeekTo, "scrubTimeline");
					zoom();
				};

				var cancelSeek = function () {
					// console.log("doc mouseup or touchend");
					// kill all events on  mouse up (anywhere).
					angular.element(document).off('mouseup.timeline');
					angular.element(document).off('touchend.timeline');
					timelineContainer.off('mouseup.timeline');
					timelineContainer.off('touchend.timeline');
					scope.$apply(function () {
						scope.isSeeking = false;
					});
				};

				var initPlayheadEvents = function () {
					// bind playhead events:
					console.log("ittTimeline initPlayheadEvents");
					var playhead = $(element.find('.playhead'));
					console.log(playhead);
					if (appState.isTouchDevice) {
						playhead.on('touchstart.timeline', function (e) {
							startSeek(e.originalEvent.targetTouches[0]);
							e.preventDefault();
						});
						playhead.on('touchmove.timeline', function (e) {
							seeking(e.originalEvent.targetTouches[0]);
							e.preventDefault();
						});
					} else {
						playhead.on('mousedown.timeline', function (e) {
							startSeek(e);
							e.preventDefault();
						});
						playhead.on('mousemove.timeline', function (e) {
							seeking(e);
							e.preventDefault();
						});
					}
				};
				initPlayheadEvents();

				scope.$on('$destroy', function () {
					cancelSeek(); // unbinds playhead events
				});

			}
		};
	});
