'use strict';

/*
Son of cuePointScheduler.  

keeps an sorted-by-time array of timed events.
	Events are (item/scene id) enter or exit, (timeline) pause or play

There are two separate loops here:
clock() just updates appState.time on a tight interval, purely for time display.
stepEvent() sets a timeout to trigger the next event in svc.timelineEvents and handles the actual event.

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


stepEvent(): 
	find the next event in the event list, set a timeout to (its start - now) -- allowing for the multiplier -- to:
		handle that event (make an item enter, exit)
		handle any simultaneous 
		(future?) handle events that are within some fraction of a second later (so we don't lose events between $digests)
		iterate


init resets everything

injectEvents(events, t) receives a list of timed events (i.e. an episode) to be injected into the timeline at a given point.
For now that point has to be zero. In future this will support injecting episodes inside of other episodes.

deleteEvent(...) TODO

TODO: have a way to delete a portion of the timeline (so sXs users can skip scenes)

*/

angular.module('com.inthetelling.player')
	.factory('timelineSvc', function ($timeout, $interval, modelSvc) {

		var svc = {};

		svc.timelineEvents = []; // each entry consists of {t:n, id:eventID|timeline, action:enter|exit|pause|play}. Keep sorted by t.

		var clock;
		var videoScope;
		var videoNode;
		var videoSynchronizer;

		var timeMultiplier;

		svc.registerVideo = function (vScope, vNode) {
			console.log("timelineSvc.registerVideo", videoScope, videoNode);
			if (videoNode !== undefined) {
				// Route changes weren't always seeking to the correct time; this forces it on next $digest:
				$timeout(function () {
					svc.seek(modelSvc.appState.time);
				});
			}
			videoScope = vScope;
			videoNode = vNode;

			console.log(videoScope, videoNode);
		};

		svc.setSpeed = function (speed) {
			console.log("timelineSvc.setSpeed");
			timeMultiplier = speed;
			modelSvc.appState.timeMultiplier = timeMultiplier; // here, and only here, make this public (this is the untweaked, user-selected speed.)
			videoScope.setSpeed(videoNode, speed);
			stepEvent();
		};

		svc.play = function () {
			console.log("timelineSvc.play");
			if (angular.isDefined(clock)) {
				return; // we're already playing
			}
			modelSvc.appState.timelineState = "playing";
			videoScope.play(videoNode);
			videoSynchronizer = $interval(synchronize, 1000); // if you change this interval you must also change the target adjustment rate inside synchronise()
			_tick();
			clock = $interval(_tick, 20);
			stepEvent();
		};

		svc.pause = function (n) {
			console.log("timelineSvc.pause");
			$interval.cancel(clock);
			$interval.cancel(videoSynchronizer);
			$timeout.cancel(eventTimeout);
			clock = undefined;
			lastTick = undefined;
			videoSynchronizer = undefined;
			modelSvc.appState.timelineState = "paused";
			videoScope.pause(videoNode);
			if (n) {
				$timeout(svc.play, (n * 1000 * Math.abs(timeMultiplier)));
			}
		};

		svc.seek = function (t) {
			//console.log("timelineSvc.seek ", t);
			$timeout.cancel(eventTimeout);
			if (modelSvc.appState.duration === 0) {
				// if duration = 0, we're trying to seek to a time from a url param before the events 
				// have loaded.  Just poll until events load, that's good enough for now.
				//console.log('duration 0; poll');
				$timeout(function () {
					svc.seek(t);
				}, 300);
				return;
			}
			var oldT = modelSvc.appState.time;
			t = parseTime(t);
			if (t < 0) {
				t = 0;
			}
			if (t > modelSvc.appState.duration) {
				t = modelSvc.appState.duration;
			}
			modelSvc.appState.time = t;
			if (t > oldT) {
				svc.updateEventStates(oldT, t);
			} else {
				svc.updateEventStates(t, oldT);
			}
			videoScope.seek(videoNode, t);
			stepEvent(); // sets timeout for next event, if we're playing. (Clock just keeps running uninterrupted by seek.)
		};

		var eventTimeout;
		var stepEvent = function (nextEventIndex) {
			//console.log("stepEvent ", nextEventIndex);
			$timeout.cancel(eventTimeout);
			if (modelSvc.appState.timelineState !== 'playing') {
				return;
			}
			var now = modelSvc.appState.time;
			if (!nextEventIndex) {
				// scan timelineEvents for the next event
				var i;
				for (i = 0; i < svc.timelineEvents.length; i++) {
					if (svc.timelineEvents[i].t > now) {
						nextEventIndex = i;
						break;
					}
				}
			}
			if (nextEventIndex === undefined || nextEventIndex < 0 || nextEventIndex > svc.timelineEvents.length) {
				return; // no more events
			}
			var delta = Math.abs(svc.timelineEvents[nextEventIndex].t - now) / Math.abs(timeMultiplier) * 1000;
			// console.log("Next event in ", delta, "ms");
			eventTimeout = $timeout(function () {
				var t = svc.timelineEvents[nextEventIndex].t;
				modelSvc.appState.time = t; // prevent drift
				// Handle all events with the same t:
				while (svc.timelineEvents[nextEventIndex].t === t) {
					handleEvent(svc.timelineEvents[nextEventIndex]);
					nextEventIndex = nextEventIndex + 1;
				}
				stepEvent(nextEventIndex);
			}, delta);
		};

		var handleEvent = function (event) {
			//console.log("handle event: ", event);
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
		var _tick = function () {
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

		/*
		svc.debugClockDrift = function() {
		// There is indeed some clock drift -- it's slow by a fraction of a millisecond per second on my laptop.
		// stepEvent also updates appState.time, so this small drift shouldn't be noticeable.
			var start = new Date();
			svc.play();
			$timeout(function() {
				var end = new Date();
				console.log("Actual: "+(end-start)/1000);
				console.log("Calculated: " + modelSvc.appState.time);
				console.log("Drift is "+(( (modelSvc.appState.time)-((end-start)/1000) )/50)+" per second");
				svc.pause();
			},50000);
		};
		*/

		svc.init = function (episodeId) {
			console.log("timelineSvc.init");
			svc.timelineEvents = [];
			modelSvc.appState.time = 0;
			timeMultiplier = 1;
			modelSvc.appState.duration = 0;
			modelSvc.appState.timelineState = 'paused';
			stepEvent();
			svc.injectEvents(modelSvc.episodeEvents(episodeId), 0);
		};

		// for now only supports a single episode starting at injectionTime=0
		// in future will be able to inject episode events at injectionTime=whatever, shifting any later events
		// to their new time (based on the total duration of the injected group)
		// (which we'll need to get probably by passing in episode.duration along with the events?)

		// TODO: ensure scenes are contiguous and non-overlapping

		svc.injectEvents = function (events, injectionTime) {
			if (events.length === 0) {
				return;
			}
			console.log("timelineSvc.injectEvents");
			angular.forEach(events, function (event) {
				// add start and end to timelineEvents array
				if (event.stop) {
					svc.timelineEvents.push({
						t: event.start_time,
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
						t: (event.start_time + 0.01),
						id: event._id,
						action: "exit"
					});
				} else {
					// not a stop event.

					// TEMP hack to allow landing screen:
					if (event.start_time === 0) {
						event.start_time = 0.01;
					}
					svc.timelineEvents.push({
						t: event.start_time,
						id: event._id,
						action: "enter"
					});
					if (event.end_time || event.end_time === 0) {
						svc.timelineEvents.push({
							t: event.end_time,
							id: event._id,
							action: "exit"
						});
					} else {
						// TODO: handle missing end times.  For transcript items, create an end time matching the start of the next transcript or the end of the scene or the duration (whichever comes first)
						// For other items, create an end time matching the next scene start or the duration, whichever comes first
						// For scenes, create an end time matching the start of the next scene or the duration, whichever comes first.
						// That's complex logic, may be better handled in a second pass....
						console.warn("Missing end_time on event ", event);
					}
				}
			});

			//keep events sorted by time
			svc.timelineEvents = svc.timelineEvents.sort(function (a, b) {
				return a.t > b.t;
			});

			// Timeline duration is t of the last timelineEvent
			modelSvc.appState.duration = svc.timelineEvents[svc.timelineEvents.length - 1].t;

			svc.updateEventStates(0, modelSvc.appState.duration);

		};

		svc.updateEventStates = function (startT, endT) {
			console.log("timelineSvc.updateEventStates");
			// for now just bruteforcing the state of every event in the timeline.  
			// Possible future optimization if necessary: only update those between startT and endT
			// But this isn't run very often (only on seek, resynch, or injecting new events) so that's probably unnecessary
			var now = modelSvc.appState.time;
			angular.forEach(svc.timelineEvents, function (tE) {
				if (tE.id === 'timeline') {
					return;
				}
				var event = modelSvc.events[tE.id];
				if (event.end_time < now) {
					event.state = "isPast";
					event.isCurrent = false;
				} else if (event.start_time > now) {
					event.state = "isFuture";
					event.isCurrent = false;
				} else {
					event.state = "isCurrent";
					event.isCurrent = true;
				}
			});
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

		// called on slowish interval to keep the video and timeline in synch.
		// (Video sometimes lags, is slow to respond to clicks, etc.) We still want our UI to respond immediately, 
		// but if they have drifted a bit apart, adjust the timeline to match the video.

		var synchronize = function () {
			var vidTime = videoScope.currentTime(videoNode);
			var ourTime = modelSvc.appState.time;
			var delta = vidTime - ourTime;
			if (Math.abs(delta) > 1) {
				//console.log("Video more than one second off synch");
				// We're way off, so force it.  This will cause a video stutter, but if we're this far off already
				// that's probably already happening
				svc.seek(vidTime);
			} else if (Math.abs(delta) > 0.1) {
				console.log("Video is ", delta, " seconds ahead of timeline; correcting");
				timeMultiplier = (delta / modelSvc.appState.timeMultiplier) + modelSvc.appState.timeMultiplier;
				if (timeMultiplier < 0) {
					timeMultiplier = 0;
				}
				//console.log("Adjusted speed is ", timeMultiplier);
			} else {
				timeMultiplier = modelSvc.appState.timeMultiplier;
			}
			stepEvent();
		};

		console.log("timelineSvc: ", svc);
		return svc;
	});
