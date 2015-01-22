'use strict';

/*
Son of cuePointScheduler, with a smattering of video controls.    

This needs a bit of a rewrite before it can safely handle more than one episode at a time:
stepEvent (and probably other things too) currently depends on video time matching timeline time;
we'll need to have a way to calculate one from the other (which will get especially complicated when 
we allow skipping scenes in SxS...)


keeps an sorted-by-time array of timed events.
	Events are (item/scene id) enter or exit, (timeline) pause or play

There are two separate loops here:
clock() just updates appState.time on a tight interval, purely for time display.
stepEvent() runs on a slower interval, watches the current video's reported current time,
            and handles any events since it was last called.  If one of them is
            a stop event, it will 'rewind' the timeline to that time (and stop handling events past it.)

appState.time is the current playhead position
timeMultiplier is the playback speed. No negative values or zero.


injectEvents(events, t) receives a list of timed events (i.e. an episode) to be injected into the timeline at a given point.
For now that point has to be zero. In future this will support injecting episodes inside of other episodes.

TODO: support sequential episodes
TODO: support injecting into the middle of an episode
TODO: have a way to delete a portion of the timeline (so sXs users can skip scenes)

*/

angular.module('com.inthetelling.story')
	.factory('timelineSvc', function ($timeout, $interval, $rootScope, $filter, config, modelSvc, appState, analyticsSvc) {

		var svc = {};

		svc.timelineEvents = []; // each entry consists of {t:n, id:eventID|timeline, action:enter|exit|pause|play}. Keep sorted by t.
		svc.markedEvents = []; // time, title of marked events (scenes, currently)

		var clock;
		var eventTimeout;
		var videoScope;

		var timeMultiplier;

		svc.registerVideo = function (newVideoScope) {
			// console.log("timelineSvc.registerVideo", newVideoScope);
			if (videoScope !== undefined) {
				// Route changes weren't always seeking to the correct time; this forces it on next $digest:
				$timeout(function () {
					svc.seek(appState.time);
				});
			}
			videoScope = newVideoScope;
		};

		svc.setSpeed = function (speed) {
			// console.log("timelineSvc.setSpeed", speed);
			timeMultiplier = speed;
			appState.timeMultiplier = timeMultiplier; // here, and only here, make this public. (an earlier version of this tweaked the private timeMultiplier variable if the video and timeline fell out of synch.  Fancy.  Too fancy.  Didn't work. Stopped doing it.)
			videoScope.setSpeed(speed);
			stepEvent();
		};

		svc.play = function (nocapture) {
			// console.log("timelineSvc.play", videoScope);
			// On first play, we need to check if we need to show help menu instead; if so, don't play the video:
			// (WARN this is a bit of a sloppy mixture of concerns.)

			if (!appState.duration || appState.duration < 0.1) {
				console.error("This episode has no duration");
				return;
			}

			if (!appState.hasBeenPlayed) {
				appState.hasBeenPlayed = true; // do this before the $emit, or else endless loop
				$rootScope.$emit("video.firstPlay");
				return; // playerController needs to catch this and either show the help pane or trigger play again 
			}

			if (appState.time > appState.duration - 0.1) {
				svc.seek(0.1); // fudge the time a bit to skip the landing scene
				svc.play();
			}

			// wait until the video is ready:
			if (videoScope === undefined) {
				var unwatch = $rootScope.$watch(function () {
					return videoScope !== undefined;
				}, function (itIsReady) {
					if (itIsReady) {
						unwatch();
						svc.play();
					}
				});
				return;
			}

			// console.log("timelineSvc.play (passed preflight)");
			appState.videoControlsActive = true;
			appState.show.navPanel = false;
			appState.timelineState = "buffering";

			videoScope.play().then(function () {
				appState.timelineState = "playing";
				startTimelineClock();
				startEventClock();
				if (!nocapture) {
					analyticsSvc.captureEpisodeActivity("play");
				}
			});
		};

		svc.pause = function (nocapture) {
			// console.log("timelineSvc.pause");
			appState.videoControlsActive = true;
			$interval.cancel(clock);
			stopEventClock();
			clock = undefined;
			lastTick = undefined;

			appState.timelineState = "paused";
			videoScope.pause();

			// TODO we're not using timed pauses yet...
			// if (n) {
			// 	$timeout(svc.play, (n * 1000 * Math.abs(timeMultiplier)));
			// }

			if (!nocapture) {
				analyticsSvc.captureEpisodeActivity("pause");
			}
		};

		svc.stall = function () {
			console.warn("timelineSvc.stall");
			// called by videoController when video stalls.  Essentially similar to pause() but sets different states
			// (and doesn't tell the video to pause)
			$interval.cancel(clock);
			stopEventClock();
			clock = undefined;
			lastTick = undefined;
			svc.wasPlaying = (appState.timelineState === "playing");
			appState.timelineState = "buffering";
		};

		svc.unstall = function () {
			// videoController will call this when ready
			// console.warn("timelineSvc.unstall");
			if (svc.wasPlaying) {
				appState.timelineState = "playing";
				svc.play();
			} else {
				appState.timelineState = "paused";
			}
			svc.wasPlaying = undefined;
		};

		// "method" and "eventID" are for analytics purposes
		svc.seek = function (t, method, eventID) {
			// console.log("timelineSvc.seek ", t);
			if (!videoScope || appState.duration === 0) {
				// if duration = 0, we're trying to seek to a time from a url param before the events 
				// have loaded.  Just poll until events load, that's good enough for now.
				// TODO throw error and stop looping if this goes on too long
				$timeout(function () {
					// console.log("waiting for video to be ready");
					svc.seek(t, method, eventID);
				}, 300);
				return;
			}
			stopEventClock();
			var oldT = appState.time;
			t = parseTime(t);
			if (t < 0) {
				t = 0;
			}
			if (t > appState.duration) {
				t = appState.duration;
			}

			appState.time = t;
			videoScope.seek(t);
			svc.updateEventStates();
			stepEvent(true);

			// capture analytics data:
			if (method) {
				var captureData = {
					"method": method,
					"seekStart": oldT
				};
				if (eventID) {
					captureData.event_id = eventID;
				}
				// console.log("capture", captureData);
				analyticsSvc.captureEpisodeActivity("seek", captureData);
			} else {
				console.warn("timelineSvc.seek called without method.  Could be normal resynch, could be a bug");
			}
		};

		svc.prevScene = function () {
			for (var i = svc.markedEvents.length - 1; i >= 0; i--) {
				var now = appState.time;
				if (appState.timelineState === 'playing') {
					now = now - 3; // leave a bit of fudge when skipping backwards in a video that's currently playing
				}
				if (svc.markedEvents[i].start_time < now) {
					// console.log("Seeking to ", svc.markedEvents[i].start_time);
					//scope.enableAutoscroll(); // TODO in playerController
					svc.seek(svc.markedEvents[i].start_time, "prevScene");

					break;
				}
			}

		};

		svc.nextScene = function () {
			var found = false;
			for (var i = 0; i < svc.markedEvents.length; i++) {
				if (svc.markedEvents[i].start_time > appState.time) {
					// console.log("Seeking to ", svc.markedEvents[i].start_time);
					//scope.enableAutoscroll(); // TODO in playerController
					svc.seek(svc.markedEvents[i].start_time, "nextScene");
					found = true;
					break;
				}
			}
			if (!found) {
				svc.pause();
				svc.seek(appState.duration - 0.01, "nextScene");
				//scope.enableAutoscroll(); // in playerController
			}
		};

		// - - - - - - - - - - - - - - - - - - - - - - - - - -

		// WHY IS THIS AUDIO CHOCOLATE IN MY TIMELINE PEANUT BUTTER?
		// to make it easier to maintain state for these across multiple videos, when there are multiple videos.
		// Also because there isn't an obviously better place for it.  If this is dumb, TODO: be less dumb

		svc.toggleMute = function () {
			appState.muted = !appState.muted;
			videoScope.toggleMute();
		};
		svc.setVolume = function (vol) { // 0..100
			appState.volume = vol;
			videoScope.setVolume(vol);
		};

		// - - - - - - - - - - - - - - - - - - - - - - - - - -
		// Event clock

		/* 
		  If timeline is playing, 
			(TODO 1. find out how long since last checked, compare videotime delta to timeline delta, adjust timeline if necessary)
			2. check for timeline events since the last time stepEvent ran, handle them in order
			3. if any were stop events, 
				rewind the timeline and the video to that time (and stop handling events)
			otherwise
				set a timeout for a bit after the next event in the queue, up to some maximum amount of time, to run again
				(the 'up to some maximum' bit is for 1., so the timeline and video time don't fall out of synch)
		*/

		var eventClockData;

		var resetEventClock = function () {
			eventClockData = {
				lastTimelineTime: 0,
				lastVideoTime: 0
			};
		};
		resetEventClock();

		var startEventClock = function () {
			eventClockData.lastTimelineTime = appState.time;
			eventClockData.lastVideoTime = appState.time; // TODO this should be relative to episode, not timeline
			stepEvent();
		};

		var stopEventClock = function () {
			$timeout.cancel(eventTimeout);
			resetEventClock();
		};

		var stepEvent = function (ignoreStopEvents) {
			$timeout.cancel(eventTimeout);
			if (appState.timelineState !== 'playing') {
				return;
			}
			var vidTime = videoScope.currentTime();
			var ourTime = appState.time;
			// console.log("stepEvent handling events from ", eventClockData.lastTimelineTime, " to ", ourTime);

			// TODO check video time delta, adjust ourTime as needed (most likely case is that video stalled
			// and timeline has run ahead, so we'll be backtracking the timeline to match the video before we handle the events.)

			// find timeline events since last time stepEvent ran, handle them in order until one is a stop or a seek
			for (var i = 0; i < svc.timelineEvents.length; i++) {
				var evt = svc.timelineEvents[i];
				if (evt.t >= eventClockData.lastTimelineTime) {
					if (evt.t > ourTime) {
						break; // NOTE! next event should be this one; let i fall through as is
					}
					// Don't let stop events stop us before we even start.
					// (if the stop event and lastTimelineTime match, that stop event is what stopped us in the first place)
					if (evt.action === "pause" && (ignoreStopEvents || evt.t === eventClockData.lastTimelineTime)) {
						console.log("Skipping pause event");
					} else {
						handleEvent(evt);
						if (evt.action === "pause") {
							// TODO: check for multiple simultaneous pause actions, skip to the last one
							i++;
							break; //NOTE! next event should be the one AFTER the stop event, so let i++ fall through
						}
					}
				}
			}
			var nextEvent = svc.timelineEvents[i]; // i falls through from the break statements above

			// console.log("Next event is  ", svc.timelineEvents[i]);

			eventClockData.lastVideoTime = vidTime;
			eventClockData.lastTimelineTime = ourTime;

			if (nextEvent && appState.timelineState === "playing") { // need to check timelineState in case there were stop events above
				// Find out how long until the next event, and aim for just a bit after it.
				var timeToNextEvent = (svc.timelineEvents[i].t - ourTime) * 1000 / timeMultiplier;
				// console.log("next event in ", timeToNextEvent);
				eventTimeout = $timeout(stepEvent, timeToNextEvent + 10);
			}
		};

		// "event" here refers to a timelineEvents event, not the modelSvc.event:
		var handleEvent = function (event) {
			//console.log("handle event: ", event);
			if (event.id === 'timeline') {
				//console.log("TIMELINE EVENT");
				if (event.action === 'pause') {
					appState.time = event.t;
					svc.pause(); // TODO handle pause with duration too
				} else {
					svc.play();
				}
			} else {
				if (event.action === "enter") {
					modelSvc.events[event.id].state = "isCurrent";
					modelSvc.events[event.id].isCurrent = true;
				} else if (event.action === "exit") {
					modelSvc.events[event.id].state = "isPast";
					modelSvc.events[event.id].isCurrent = false;
				} else if (event.action === "preload") {
					preloadImageAsset(modelSvc.events[event.id]);
				} else {
					console.warn("Unknown event action: ", event, event.action);
				}
			}
		};

		// This is ONLY used to update appState.time in "real" time.  Events are handled by stepEvent.
		var lastTick;
		var startTimelineClock = function () {
			lastTick = undefined;
			$interval.cancel(clock); // safety belt, in case we're out of synch
			clock = $interval(_tick, 20);
		};

		var _tick = function () {
			var thisTick = new Date();
			var delta = (isNaN(thisTick - lastTick)) ? 0 : (thisTick - lastTick);
			var newTime = parseFloat(appState.time) + (delta / 1000 * timeMultiplier);
			// check for out of bounds:
			if (newTime < 0) {
				newTime = 0;
				svc.pause();
			}

			// console.log(newTime, appState.time);
			if (newTime > appState.duration) {
				newTime = appState.duration;
				svc.pause();
			}
			appState.time = newTime;
			lastTick = thisTick;
		};

		svc.init = function (episodeId) {
			// console.log("timelineSvc.init", episodeId);
			svc.timelineEvents = [];
			svc.markedEvents = [];
			timeMultiplier = 1;
			appState.duration = 0;
			appState.timelineState = 'paused';

			svc.injectEvents(modelSvc.episodeEvents(episodeId), 0);
			$interval.cancel(clock);
			stopEventClock();
		};

		svc.injectEvents = function (events, injectionTime) {

			console.log("timelineSvc.injectEvents: has ", svc.timelineEvents.length, " adding ", events.length);
			// events should be an array of items in modelSvc.events
			// for now this only supports adding events starting at injectionTime=0,
			// which does not shift existing events later in time.

			// in future will be able to inject episode events at injectionTime=whatever, shifting any later events
			// to their new time (based on the total duration of the injected group)
			// (which we'll need to get probably by passing in episode.duration along with the events?)

			if (events.length === 0) {
				return;
			}
			if (!injectionTime) {
				injectionTime = 0;
			}
			angular.forEach(events, function (event) {
				event.start_time = Number(event.start_time);
				event.end_time = Number(event.end_time);
				// add scenes to markedEvents[]:
				if (event._type === "Scene") {
					if (appState.product === 'producer') {
						// producer gets all scenes, even 'hidden' ones
						addMarkedEvent(event);
					} else {
						// sxs and player just get scenes with titles
						if (event.display_title) {
							addMarkedEvent(event);
						}
					}
				}
				if (event.start_time === 0 && !event._id.match('internal')) {
					event.start_time = 0.01;
					modelSvc.events[event._id].start_time = 0.01;
				}
				// add start and end to timelineEvents array
				if (event.stop) {
					svc.timelineEvents.push({
						t: event.start_time + injectionTime,
						id: "timeline",
						action: "pause"
					});
					svc.timelineEvents.push({
						t: event.start_time + injectionTime,
						id: event._id,
						action: "enter"
					});
					// For now, ignore end_time on stop events; they always end immediately after user hits play again.
					// TODO: In future we may allow durations on stop events so the video will start automatically after that elapses.
					svc.timelineEvents.push({
						t: (event.start_time + injectionTime + 0.01),
						id: event._id,
						action: "exit"
					});
				} else {
					// not a stop event.
					svc.timelineEvents.push({
						t: event.start_time + injectionTime,
						id: event._id,
						action: "enter"
					});
					if (event.end_time || event.end_time === 0) {
						svc.timelineEvents.push({
							t: event.end_time + injectionTime,
							id: event._id,
							action: "exit"
						});
					} else {
						// TODO: handle missing end times.  For transcript items, create an end time matching the start of the next transcript or the end of the scene or the duration (whichever comes first)
						// For other items, create an end time matching the next scene start or the duration, whichever comes first
						// For scenes, create an end time matching the start of the next scene or the duration, whichever comes first.
						// That's complex logic, may be better handled in a second pass.... or, duh,  during authoring
						console.warn("Missing end_time on event ", event);
					}
				}

				// allow preload of event assets:
				if (event.asset_id || event.annotation_image_id || event.link_image_id) {
					svc.timelineEvents.push({
						t: (event.start_time < 3) ? 0 : event.start_time - 3, // 3 seconds early
						id: event._id,
						action: "preload"
					});
				}

			});

			svc.sortTimeline();
		};

		var addMarkedEvent = function (newEvent) {
			// scan through existing markedEvents; if the new event is already there, replace it; otherwise add it
			var wasFound = false;
			for (var i = 0; i < svc.markedEvents.length; i++) {
				if (svc.markedEvents[i]._id === newEvent._id) {
					// replace existing event
					svc.markedEvents[i] = angular.copy(newEvent);
					wasFound = true;
				}
			}

			// wasn't found, so add it:
			if (!wasFound) {
				svc.markedEvents.push(newEvent);
			}
			//console.log(svc.markedEvents);
		};

		svc.removeEvent = function (removeId) {
			// delete anything corresponding to this id from the timeline:
			// console.log("timelineSvc.removeEvent");
			svc.timelineEvents = $filter('filter')(svc.timelineEvents, {
				id: '!' + removeId
			});
			// and from the markedEvents, with its inexplicably inconsistent ID naming:
			svc.markedEvents = $filter('filter')(svc.markedEvents, {
				_id: '!' + removeId
			});

			svc.updateEventStates();
		};

		svc.updateEventTimes = function (event) {
			// remove old references, as in removeEvent, then re-add it with new times 
			// (not calling removeEvent here since it would do a redundant updateEventStates)
			svc.timelineEvents = $filter('filter')(svc.timelineEvents, {
				id: '!' + event._id
			});
			svc.injectEvents([event], 0);
		};

		svc.updateSceneTimes = function (episodeId) {
			// HACK(ish): since editing a scene's timing has side effects on other scenes, need to updateEventTimes for each scene in the episode when one changes
			angular.forEach(modelSvc.episodes[episodeId].scenes, function (scene) {
				svc.updateEventTimes(scene);
			});
		};

		svc.sortTimeline = function () {

			//keep events sorted by time.
			// Simultaneous events should be sorted as exit, then enter, then stop.
			// (sort order of 'preload' events doesn't matter.)
			svc.timelineEvents = svc.timelineEvents.sort(function (a, b) {
				if (a.t === b.t) {
					if (a.action === b.action) {
						return 0;
					}
					// This is overly verbose, but I keep running into differences in 
					// how Safari and FF sort when I try to simplify it:
					if (a.action === 'enter' && b.action === 'pause') {
						return -1;
					}
					if (a.action === 'enter' && b.action === 'exit') {
						return 1;
					}
					if (a.action === 'exit' && b.action === 'enter') {
						return -1;
					}
					if (a.action === 'exit' && b.action === 'pause') {
						return -1;
					}
					if (a.action === 'pause' && b.action === 'enter') {
						return 1;
					}
					if (a.action === 'pause' && b.action === 'exit') {
						return 1;
					}
					return 0;
				} else {
					return a.t - b.t;
				}
			});

			svc.markedEvents = svc.markedEvents.sort(function (a, b) {
				return a.start_time - b.start_time;
			});

			// for (var i = 0; i < svc.timelineEvents.length; i++) {
			// 	console.log(svc.timelineEvents[i].t, svc.timelineEvents[i].action);
			// }

			// Find the latest end_time in the timeline, set that as the duration.
			// TODO this will need to change when we support multiple episodes in one timeline

			if (svc.timelineEvents.length > 0) {
				appState.duration = svc.timelineEvents[svc.timelineEvents.length - 1].t;
			}
			svc.updateEventStates();
		};

		svc.updateEventStates = function () {
			// console.log("timelineSvc.updateEventStates", appState.time);
			// Sets past/present/future state of every event in the timeline.  
			// TODO performance check (though this isn't done often, only on seek and inject.)

			// DO NOT check event start and end times directly; they're relative to the episode, not the timeline!
			// instead preset everything to the future, then scan the timeline events up to now and set state based on enter/exit events per the timeline
			var now = appState.time;
			// put everything in the future state:
			angular.forEach(svc.timelineEvents, function (tE) {
				if (tE.id !== "timeline") {
					var event = modelSvc.events[tE.id];
					if (event) { // cancelling adding an event can leave "internal:editing" in the event list; TODO keep that from happening but for now just ignore it if it doesn't exist
						event.state = "isFuture";
						event.isCurrent = false;
					}
				}
			});

			// 2nd pass, step through all events before now:
			angular.forEach(svc.timelineEvents, function (tE) {
				if (tE.t <= now) {
					var event = modelSvc.events[tE.id];
					if (event) {
						if (tE.action === 'enter') {
							event.state = "isCurrent";
							event.isCurrent = true;
						} else if (tE.action === 'exit') {
							event.state = "isPast";
							event.isCurrent = false;
						}
					}
				}
			});
			stepEvent();
		};

		var alreadyPreloadedImages = {};
		var preloadImageAsset = function (event) {
			if (event.asset && event.asset._type === 'Asset::Image') {
				if (!alreadyPreloadedImages[event.asset.url]) {
					console.log("Preloading ", event.asset.url);
					alreadyPreloadedImages[event.asset.url] = new Image();
					alreadyPreloadedImages[event.asset.url].src = event.asset.url;
				}
			}
		};

		// supports these formats: "1:10", 1m10s", "1m", "10s", or a plain number (in seconds)
		var parseTime = function (t) {
			if (!isNaN(parseFloat(t)) && isFinite(t)) {
				return t;
			}
			var parse = t.match(/^(\d+)[m:]([\d\.]+)s?$/);
			if (parse) {
				return (parseFloat(parse[1] * 60) + parseFloat(parse[2]));
			}
			parse = t.match(/^([\d\.]+)s$/);
			if (parse) {
				return parseFloat(parse[1]);
			}
			parse = t.match(/^([\d\.]+)m$/);
			if (parse) {
				return parseFloat(parse[1] * 60);
			}
			console.error("Tried to parse invalid time string: ", t);
		};

		if (config.debugInBrowser) {
			console.log("timelineSvc: ", svc);
		}

		return svc;
	});
