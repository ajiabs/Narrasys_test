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
            and handles the events since it was last called.  If one of them is
            a stop event, it may 'rewind' the timeline to that time.



modelSvc.appState.time is the current playhead position
timeMultiplier is the playback speed. No negative values or zero.


registerVideo() called by videoController to identify which <video> tag the timeline is controlling.

play() 
	starts clock()
	stepEvent()

pause(n) 
	stop clock()
	cancel stepEvent timer
	Future: if n > 0, Set timer for n seconds to trigger play() again

seek(t) 
	moves to time t and immediately updates past/current/future for all events (in future, just those between oldT and newT)


init resets everything

injectEvents(events, t) receives a list of timed events (i.e. an episode) to be injected into the timeline at a given point.
For now that point has to be zero. In future this will support injecting episodes inside of other episodes.

deleteEvent(...) TODO

TODO: have a way to delete a portion of the timeline (so sXs users can skip scenes)

*/

angular.module('com.inthetelling.player')
	.factory('timelineSvc', function($timeout, $interval, modelSvc, analyticsSvc) {

		var svc = {};

		svc.timelineEvents = []; // each entry consists of {t:n, id:eventID|timeline, action:enter|exit|pause|play}. Keep sorted by t.
		svc.markedEvents = []; // time, title of marked events (scenes, currently)

		var clock;
		var eventTimeout;
		var videoScope;

		var timeMultiplier;

		svc.registerVideo = function(newVideoScope) {
			console.log("timelineSvc.registerVideo", newVideoScope);
			if (videoScope !== undefined) {
				// Route changes weren't always seeking to the correct time; this forces it on next $digest:
				$timeout(function() {
					svc.seek(modelSvc.appState.time);
				});
			}
			videoScope = newVideoScope;
		};

		svc.setSpeed = function(speed) {
			// console.log("timelineSvc.setSpeed");
			timeMultiplier = speed;
			modelSvc.appState.timeMultiplier = timeMultiplier; // here, and only here, make this public (this is the untweaked, user-selected speed.)
			videoScope.setSpeed(speed);
		};

		//TODO video should return a promise and callback only when the video actually starts playing
		svc.play = function() {
			// console.log("timelineSvc.play");
			if (angular.isDefined(clock)) {
				return; // we're already playing
			}
			console.log("user requested 'play'");
			videoScope.play().then(function() {
				console.log("play begins");
				modelSvc.appState.timelineState = "playing";
				// videoSynchronizer = $interval(synchronize, 1000); // if you change this interval you must also change the target adjustment rate inside synchronise()
				_tick();
				clock = $interval(_tick, 20);

				startEventClock();

				analyticsSvc.captureEpisodeActivity("play");
			});
		};

		svc.pause = function(n) {
			// console.log("timelineSvc.pause");
			$interval.cancel(clock);
			stopEventClock();
			// $interval.cancel(videoSynchronizer);
			clock = undefined;
			lastTick = undefined;
			// videoSynchronizer = undefined;
			modelSvc.appState.timelineState = "paused";
			videoScope.pause();
			if (n) {
				$timeout(svc.play, (n * 1000 * Math.abs(timeMultiplier)));
			}
			analyticsSvc.captureEpisodeActivity("pause");
		};

		// "method" and "eventID" are for analytics purposes
		svc.seek = function(t, method, eventID) {
			console.log("timelineSvc.seek ", t);
			if (!videoScope || modelSvc.appState.duration === 0) {
				// if duration = 0, we're trying to seek to a time from a url param before the events 
				// have loaded.  Just poll until events load, that's good enough for now.
				//console.log('duration 0; poll');
				$timeout(function() {
					svc.seek(t);
				}, 300);
				return;
			}

			stopEventClock();
			var oldT = modelSvc.appState.time;
			t = parseTime(t);
			if (t < 0) {
				t = 0;
			}
			if (t > modelSvc.appState.duration) {
				t = modelSvc.appState.duration;
			}

			modelSvc.appState.time = t;
			svc.updateEventStates();
			videoScope.seek(t);
			if (modelSvc.appState.timelineState === 'playing') {
				// TODO handle lag between seeking to new point and the video actually playing?
				startEventClock();
			}
			// capture analytics data:
			if (method) {
				var captureData = {
					"method": method,
					"seekStart": oldT
				};
				if (eventID) {
					captureData.event_id = eventID;
				}
				analyticsSvc.captureEpisodeActivity("seek", captureData);
			} else {
				console.warn("timelineSvc.seek called without method.  Could be normal resynch, could be a bug");
			}
		};

		// - - - - - - - - - - - - - - - - - - - - - - - - - -

		// WHY IS THIS AUDIO CHOCOLATE IN MY TIMELINE PEANUT BUTTER?
		// to make it easier to maintain state for these across multiple videos, when there are multiple videos.
		// Also because there isn't an obviously better place for it.  If this is dumb, TODO: be less dumb

		svc.toggleMute = function() {
			modelSvc.appState.muted = !modelSvc.appState.muted;
			videoScope.toggleMute();
		};
		svc.setVolume = function(vol) { // 0..100
			modelSvc.appState.volume = vol;
			videoScope.setVolume(vol);
		};

		// - - - - - - - - - - - - - - - - - - - - - - - - - -
		// Event clock

		/* 
		So here's the plan: if timeline is playing, 
			(TODO 1. find out how long since last checked, compare videotime delta to timeline delta, adjust timeline if necessary)

			2. check for timeline events since the last time stepEvent ran, handle them in order
			3. if any were stop events, 
				rewind the timeline and the video to that time (and stop handling events)
			otherwise
				set a timeout for a bit after the next event in the queue, up to some maximum amount of time, to run again
				(the 'up to some maximum' bit is for 1., so the timeline and video time don't fall out of synch)
		*/

		var eventClock, eventClockData;

		var resetEventClock = function() {
			eventClockData = {
				lastTimelineTime: 0,
				lastVideoTime: 0
			};
		};
		resetEventClock();

		var startEventClock = function() {
			//			resetEventClock(); (should it?)
			eventClockData.lastTimelineTime = modelSvc.appState.time;
			eventClockData.lastVideoTime = modelSvc.appState.time; // TODO this should be relative to episode, not timeline
			stepEvent();
		};

		var stopEventClock = function() {
			$timeout.cancel(eventTimeout);
			resetEventClock();
		};

		var stepEvent = function() {
			$timeout.cancel(eventTimeout);
			if (modelSvc.appState.timelineState !== 'playing') {
				return;
			}
			var vidTime = videoScope.currentTime();
			var ourTime = modelSvc.appState.time;

			// TODO check video time delta, adjust ourTime as needed

			// find timeline events since last time stepEvent ran, handle them in order until one is a stop or a seek
			for (var i = 0; i < svc.timelineEvents.length; i++) {
				var evt = svc.timelineEvents[i];
				if (evt.t >= eventClockData.lastTimelineTime) {
					if (evt.t > ourTime) {
						break; // NOTE! next event should be this one; let i fall through as is
					}
					console.log("Handling event ", evt);
					handleEvent(evt);
					if (evt.action === "pause") {
						i++;
						break; //NOTE! next event should be the one AFTER the stop event, so let i++ fall through
					}
				}
			}
			var nextEvent = svc.timelineEvents[i]; // i falls through from the break statements above

			console.log("Next event is  ", svc.timelineEvents[i]);

			eventClockData.lastVideoTime = vidTime;
			eventClockData.lastTimelineTime = ourTime;

			if (nextEvent && modelSvc.appState.timelineState === "playing") { // need to check timelineState in case there were stop events above
				// Find out how long until the next event, and aim for just a bit after itL
				var timeToNextEvent = (svc.timelineEvents[i].t - ourTime) * 1000;
				/* don't need this until we start adjusting the timeline time to match video time
				if (timeToNextEvent > 1000) {
					timeToNextEvent = 1000;
				}
				*/
				eventTimeout = $timeout(stepEvent, timeToNextEvent + 10);
			}
		};


		var handleEvent = function(event) {
			// console.log("handle event: ", event);
			if (event.id === 'timeline') {
				//console.log("TIMELINE EVENT");
				if (event.action === 'pause') {
					svc.pause(); // TODO handle pause with duration too
				} else {
					svc.play();
				}
			} else {
				if (event.action === "enter") {
					modelSvc.events[event.id].state = "isCurrent";
					modelSvc.events[event.id].isCurrent = true;
				} else {
					modelSvc.events[event.id].state = "isPast";
					modelSvc.events[event.id].isCurrent = false;
				}
			}
		};


		// This is ONLY used to update appState.time in "real" time.  Events are handled by stepEvent.
		var lastTick;
		var _tick = function() {
			var thisTick = new Date();
			var delta = (isNaN(thisTick - lastTick)) ? 0 : (thisTick - lastTick);
			var newTime = parseFloat(modelSvc.appState.time) + (delta / 1000 * timeMultiplier);
			// check for out of bounds:
			if (newTime < 0) {
				newTime = 0;
				svc.pause();
			}
			if (newTime > modelSvc.appState.duration) {
				newTime = modelSvc.appState.duration;
				svc.pause();
			}
			modelSvc.appState.time = newTime;
			lastTick = thisTick;
		};


		svc.init = function(episodeId) {
			// console.log("timelineSvc.init", episodeId);
			svc.timelineEvents = [];
			timeMultiplier = 1;
			modelSvc.appState.duration = 0;
			modelSvc.appState.timelineState = 'paused';
			svc.injectEvents(modelSvc.episodeEvents(episodeId), 0);
		};


		// for now this only supports a single episode starting at injectionTime=0
		// in future will be able to inject episode events at injectionTime=whatever, shifting any later events
		// to their new time (based on the total duration of the injected group)
		// (which we'll need to get probably by passing in episode.duration along with the events?)

		// TODO: ensure scenes are contiguous and non-overlapping

		svc.injectEvents = function(events, injectionTime) {
			if (events.length === 0) {
				return;
			}
			// console.log("timelineSvc.injectEvents");
			angular.forEach(events, function(event) {
				// add scenes to markedEvents[]:
				if (event._type === "Scene" && event.title) {
					svc.markedEvents.push(event);
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
						t: event.start_time,
						id: event._id,
						action: "enter"
					});
					// For now, ignore end_time on stop events; they always end immediately after user hits play again.
					// TODO: In future we'll allow durations on stop events so the video will start automatically after that elapses.
					svc.timelineEvents.push({
						t: (event.start_time + 0.01 + injectionTime),
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
			});

			//keep events sorted by time.
			// TODO when times are the same, put the stop event last
			svc.timelineEvents = svc.timelineEvents.sort(function(a, b) {
				return a.t - b.t;
			});

			// Timeline duration is t of the last timelineEvent
			modelSvc.appState.duration = svc.timelineEvents[svc.timelineEvents.length - 1].t;

			svc.updateEventStates();

		};

		svc.updateEventStates = function() {
			// console.log("timelineSvc.updateEventStates");
			// Sets past/present/future state of every event in the timeline.  
			// TODO performance check (though this isn't done often, only on seek and inject.)

			// DO NOT check event start and end times directly; they're relative to the episode, not the timeline!
			// instead preset everything to the future, then scan the timeline events up to now and set state based on enter/exit events per the timeline
			var now = modelSvc.appState.time;
			// put everything in the future state:
			angular.forEach(svc.timelineEvents, function(tE) {
				if (tE.id !== "timeline") {
					var event = modelSvc.events[tE.id];
					event.state = "isFuture";
					event.isCurrent = false;
				}
			});
			// 2nd pass, step through all events before now:
			angular.forEach(svc.timelineEvents, function(tE) {
				if (tE.t <= now) {
					var event = modelSvc.events[tE.id];
					if (tE.action === 'enter') {
						event.state = "isCurrent";
						event.isCurrent = true;
					} else if (tE.action === 'exit') {
						event.state = "isPast";
						event.isCurrent = false;
					}
				}
			});
		};

		// supports these formats: "1:10", 1m10s", "1m", "10s", or a plain number (in seconds)
		var parseTime = function(t) {
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

		console.log("timelineSvc: ", svc);
		return svc;
	});
