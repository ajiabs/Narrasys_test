'use strict';

// jQuery dependencies: offset(), animate(), namespaced .bind and .unbind 


angular.module('com.inthetelling.player')
	.directive('ittTimeline', function(modelSvc, timelineSvc) {
		return {
			restrict: 'A',
			replace: true,
			scope: true,
			templateUrl: "templates/timeline.html",
			controller: "TimelineController",
			link: function(scope, element, attrs) {
				// console.log('ittTimeline', scope, element, attrs);

				scope.appState = modelSvc.appState;
				scope.timeline = timelineSvc;
				scope.handlePosition = 0; // position of draghandle (as a fraction of full timeline)
				scope.zoomLevel = 1; // multiples by which the timeline is zoomed in
				scope.zoomOffset = 0; // multiple by which the timeline is offset to the left
				var timelineNode = element.find('.progressbarContainer');
				var timelineContainer = element.find('.progressbar');

				// TODO: buffered video

				scope.prevScene = function() {
					for (var i = timelineSvc.markedEvents.length - 1; i >= 0; i--) {
						if (timelineSvc.markedEvents[i].start_time < modelSvc.appState.time) {
							// console.log("Seeking to ", timelineSvc.markedEvents[i].start_time);
							timelineSvc.seek(timelineSvc.markedEvents[i].start_time, "prevScene");
							break;
						}
					}
				};
				scope.nextScene = function() {
					var found = false;
					for (var i = 0; i < timelineSvc.markedEvents.length; i++) {
						if (timelineSvc.markedEvents[i].start_time > modelSvc.appState.time) {
							// console.log("Seeking to ", timelineSvc.markedEvents[i].start_time);
							timelineSvc.seek(timelineSvc.markedEvents[i].start_time, "nextScene");
							found = true;
							break;
						}
					}
					if (!found) {
						timelineSvc.seek(modelSvc.appState.duration, "nextScene");
					}
				};

				scope.userChangingVolume = function(evt) {
					if (modelSvc.appState.muted) {
						scope.toggleMute();
					}
					var volumeNode = angular.element(evt.currentTarget);
					var updateVolume = function(movement, noApplyNeeded) {
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
					angular.element(document).bind('mouseup.volume', function() {
						angular.element(document).unbind('mouseup.volume');
						volumeNode.unbind('mousemove.volume');
					});
				};

				scope.currentVolume = function() {
					if (modelSvc.appState.muted) {
						return 0;
					} else {
						return modelSvc.appState.volume;
					}
				};

				scope.audioIcon = function() {
					if (modelSvc.appState.muted) {
						return "muted";
					} else {
						return "vol" + Math.floor(modelSvc.appState.volume / 34);
					}
				};


				scope.showTooltip = function(event) {
					// console.log("tip: ", event);
					event.showTooltip = true;
				};
				scope.hideTooltip = function(event) {
					event.showTooltip = false;
				};

				scope.zoomIn = function() {
					scope.stopWatching = true;
					scope.zoomLevel = scope.zoomLevel + 1;
					zoom();
				};
				scope.zoomOut = function() {
					scope.stopWatching = true;
					scope.zoomLevel = scope.zoomLevel - 1;
					if (scope.zoomLevel < 1) {
						scope.zoomLevel = 1;
					}
					zoom();
				};
				var zoom = function() {
					scope.zoomOffset = -((scope.zoomLevel - 1) * (modelSvc.appState.time / modelSvc.appState.duration));
					timelineNode.animate({
						"left": (scope.zoomOffset * 100) + "%",
						"width": (scope.zoomLevel * 100) + "%"
					}, 1000, function() {
						scope.stopWatching = false;
					});
				};

				// at all times keep playhead position at the same % of the visible progress bar as the time is to the duration
				// TODO: (cosmetic) stop watching while zoom-animation is in progress
				scope.$watch(function() {
					return {
						t: modelSvc.appState.time,
						d: modelSvc.appState.duration,
					};
				}, function() {
					if (!scope.stopWatching) {
						scope.zoomOffset = -((scope.zoomLevel - 1) * (modelSvc.appState.time / modelSvc.appState.duration));
						timelineNode.css({
							"left": (scope.zoomOffset * 100) + '%'
						});
					}
				}, true);

				// triggered on mousedown:
				scope.startSeek = function(evt) {
					// console.log("SEEK");
					scope.isSeeking = true;
					timelineContainer.bind('mouseup.timeline', function() {
						//  trigger timeline change only on mouseup within progress bar.
						// console.log("timeline mouseup");
						scope.stopWatching = true;
						timelineSvc.seek(scope.willSeekTo, "scrubTimeline");
						zoom();
					});
					angular.element(document).bind('mouseup.timeline', function() {
						// console.log("doc mouseup");
						// kill all events on  mouse up (anywhere).
						angular.element(document).unbind('mouseup.timeline');
						timelineContainer.unbind('mouseup.timeline');
						scope.$apply(function() {
							scope.isSeeking = false;
						});
					});
					scope.seeking(evt);
				};

				// triggered on mousemove:
				scope.seeking = function(evt) {
					if (!scope.isSeeking) {
						return;
					}
					scope.willSeekTo = (evt.clientX - timelineNode.offset().left) / timelineNode.width() * modelSvc.appState.duration;
				};


			}


		};
	});
