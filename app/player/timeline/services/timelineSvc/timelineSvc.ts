// @npUpgrade-timeline-false
/* tslint:disable */

/***********************************
 **** Updated by Curve10 (JAB/EDD)
 **** Feb 2018
 ***********************************/

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

 timeline ending sequence:
 -do no wait for video to emit and 'ended' event
 -manually signal an ending sequence upon entering the endingscreen's enter event detected in stepEvent
 sequence

 -> ending screen entered -> timelineSvc#_doEndingSequence -> on 'ended' event emitted from player, set time to the duration

 note: ending screen can be entered naturally as the video progresses or from seeking,
 either from the timeline or the next scene arrow
 */
/* tslint:enable */
import {IEvent} from '../../../../models';
import { config } from '../../../../config';
interface ITimelineEvent {
  t: number;
  id: string;
  eventId?: string;
  action: 'enter' | 'exit' | 'pause' | 'play' | 'preload';
}

interface IDisplayMarkedEvent {
  events: ITimelineEvent[];
  layoutChange: boolean;
  multiStop: boolean;
  start_time: string;
  stop: boolean;
  toolTipText: string;
}

export interface ITimelineSvc {
  // timelineEvents: ITimelineEvent[];
  // markedEvents: IEvent[];
  // displayMarkedEvents: IDisplayMarkedEvent[];
  // enforceSingletonPauseListener: boolean;
  setSpeed(speed: number): void;
  restartEpisode(): void;
  play(): void;
  pause(nocapture?: boolean): void;
  startAtSpecificTime(t: number): void;
  seek(t: number, method?: string, eventId?: string): void;
  nextScene(): void;
  handleScene(index: number, action: string): void;
  prevScene(): void;
  toggleMute(): void;
  setVolume(vol: number): void;
  init(episodeId: string): void;
  injectEvents(events: any[], injectionTime?: number): void;
  removeEvent(removeId: string): void;
  updateEventTimes(event: any): void;
  updateSceneTimes(episodeId: string): void;
  sortTimeline(): void;
  updateEventStates(): void;
}
/* tslint:disable */

export class TimelineSvc implements ITimelineSvc {
  /* tslint:enable */
  /* tslint:disable:prefer-const */
  static Name = 'timelineSvc'; // tslint:disable-line
  static $inject = ['$window', '$timeout', '$interval', '$filter', 'modelSvc', 'appState', 'analyticsSvc', 'playbackService', 'ittUtils'];

  constructor (
    private $window,
    private $timeout,
    private $interval,
    private $filter,
    private modelSvc,
    private appState,
    private analyticsSvc,
    private playbackService,
    private ittUtils) {

      // *************************** initialization here ************************************* //
      if (!this.enforceSingletonPauseListener) {
        this.$window.addEventListener('message', function (e) {
          if (e.data === 'pauseEpisodePlayback') {
            this.pause();
          }
        }, false);
      }

      if (config.debugInBrowser) {
        console.log('timelineSvc: ', this.svc);
      }
    
    }

  private svc: ITimelineSvc = Object.create(null);

  private timelineEvents = [];
  // each entry consists of {t:n, id:eventID|timeline, action:enter|exit|pause|play}. Keep sorted by t.
  private markedEvents = [];
  private displayMarkedEvents = [];
  // time, title of marked events (scenes, currently)

  private enforceSingletonPauseListener = true; // this is probably unnecessary paranoia
  private clock;
  private eventTimeout;
  private timeMultiplier;
  private parseTime = this.ittUtils.parseTime;

  //player states
  // '-1': 'unstarted',
  // '0': 'ended',
  // '1': 'playing',
  // '2': 'paused',
  // '3': 'buffering',
  // '5': 'video cued'
  // '5': player ready

  private _onPlayerStateChange(state?) {

    // console.info('state from player', state, 'timelineState', playbackService.getTimelineState());

    if (this.playbackService.getTimelineState() === 'ended' && (state === 'unstarted' || state === 'video cued')) {
      return;
    }

    this.playbackService.setTimelineState(state);

    switch (state) {
      case 'reset':
        this._resetClocks();
        this.playbackService.resetPlaybackService();
        break;
      case 'unstarted':

        break;
      case 'ended':
        // console.log('timelineSvc#ended event!');
        this.playbackService.setMetaProp('time', this.playbackService.getMetaProp('duration'));
        const episode = this.modelSvc.episodes[this.appState.episodeId];
        const endingScreen = episode.scenes[episode.scenes.length - 1];
        episode.setCurrentScene(endingScreen);
        break;
      case 'playing':
        var currentTime = this.playbackService.getCurrentTime();
        var ourTime = this.playbackService.getMetaProp('time');
        var isBeingReset = this.playbackService.getMetaProp('resetInProgress');
        if (Math.abs(ourTime - currentTime) > 0.75 && isBeingReset === false) {
          this.playbackService.setMetaProp('time', currentTime);
          this.stepEvent(true);
        }
        this.startTimelineClock();
        this.startEventClock();
        this.appState.videoControlsActive = true;
        this.appState.show.navPanel = false;
        // For episodes embedded within episodes:
        if (this.$window.parent !== this.$window) {
          this.$window.parent.postMessage('pauseEpisodePlayback', '*'); // negligible risk in using a global here
        }
        this.analyticsSvc.captureEpisodeActivity('play');
        break;
      case 'paused':
        this._resetClocks();
        break;
      case 'buffering':
        this._resetClocks();
        break;
      case 'video cued':
        var startAt = this.playbackService.getMetaProp('startAtTime');
        var hasResumed = this.playbackService.getMetaProp('hasResumedFromStartAt');

        if (startAt > 0 && hasResumed === false) {
          // console.log('about to call startAtSpecificTime');
          this.startAtSpecificTime(startAt);
        }
        break;
      case 'player ready':
        this.updateEventStates();
        break;
    }
  }

  private _resetClocks() {
    this.$interval.cancel(this.clock);
    this.appState.videoControlsActive = true;
    this.stopEventClock();
    this.clock = undefined;
    this.lastTick = undefined;
  }

  private _doEndingSequence() {
    this._resetClocks();
    this.playbackService.handleTimelineEnd();
    this.analyticsSvc.captureEpisodeActivity('pause');
  }

  setSpeed(speed) {
    // console.log("timelineSvc.setSpeed", speed);
    this.timeMultiplier = speed;
    //here, and only here, make this public. (an earlier version of this tweaked the private timeMultiplier
    // variable if the video and timeline fell out of synch.  Fancy.  Too fancy.  Didn't work. Stopped doing it.)
    this.playbackService.setMetaProp('timeMultiplier', this.timeMultiplier);
    this.playbackService.setSpeed(this.timeMultiplier);
    this.stepEvent();
  };

  // svc.restartEpisode = restartEpisode;
  restartEpisode() {
    console.log('restarting!');
    this.seek(0.01);
    this.play();
  }

  play() {
    // console.log("timelineSvc.play");
    // On first play, we need to check if we need to show help menu instead; if so, don't play the video:
    // (WARN this is a bit of a sloppy mixture of concerns.)

    var duration = this.playbackService.getMetaProp('duration');

    if (!duration || duration < 0.1) {
      console.error('This episode has no duration');
      return;
    }

    this.playbackService.play();
  };

  pause(nocapture?) {
    this._resetClocks();
    this.playbackService.pause();

    if (!nocapture) {
      this.analyticsSvc.captureEpisodeActivity('pause');
    }
  };

  startAtSpecificTime(t) {

    // Youtube on touchscreens can't auto-seek to the correct time,
    // we have to wait for the user to init youtube manually.
    if (this.appState.isTouchDevice && this.playbackService.getMetaProp('hasBeenPlayed') === false &&
    this.playbackService.getMetaProp('videoType') === 'youtube') {
      //TODO in future it might be possible to trick YT into starting at the correct time even
      return;
    }

    t = this.parseTime(t);
    if (t < 0) {
      t = 0;
    }
    if (t > this.playbackService.getMetaProp('duration')) {
      this.playbackService.setMetaProp('duration', t);
    }

    this.playbackService.setMetaProp('time', t);
    this.playbackService.setMetaProp('hasResumedFromStartAt', true);
    this.updateEventStates();

    this.analyticsSvc.captureEpisodeActivity('seek', {
      method: 'URLParameter'
    });

  };

  seek(t, method?, eventID?) {
    if (this.playbackService.getMetaProp('ready') !== true) {
      return;
    }
    this.playbackService.pauseOtherPlayers();
    var duration = this.playbackService.getMetaProp('duration');

    var timelineState = this.playbackService.getTimelineState();

    if (timelineState === 'ended') {
      //to avoid restarting the video after the video has ended when the user initiates a seek
      this.playbackService.setTimelineState('paused');
    }

    if (duration === 0) {
      // if duration = 0, we're trying to seek to a time from a url param before the events
      // have loaded.  Just poll until events load, that's good enough for now.
      // TODO throw error and stop looping if this goes on too long
      this.$timeout(function () {
        // console.log("waiting for video to be ready");
        this.seek(t);
      }, 300);
      return;
    }

    interface ICaptureData {
      method: string;
      seekStart: number;
      event_id?: string;
    }

    var captureData: ICaptureData = {method: '', seekStart: this.playbackService.getMetaProp('time')};

    t = this.parseTime(t);
    if (t < 0) {
      t = 0;
    }
    if (t > duration) {
      this.playbackService.setMetaProp('duration', t);
    }

    this.stopEventClock();

    this.playbackService.setMetaProp('time', t);
    // youtube depends on an accurate appState.timelineState here,
    // so don't modify that by calling svc.stall() before the seek:

    this.playbackService.seek(t);
    this.updateEventStates();

    //capture analytics

    if (this.ittUtils.existy(method)) {
      captureData.method = method;

      if (this.ittUtils.existy(eventID)) {

        captureData.event_id = eventID;
      }

      this.analyticsSvc.captureEpisodeActivity('seek', captureData);
    }
  };

  // svc.nextScene = nextScene;
  nextScene() {
    var found = false;
    var currentTime = this.playbackService.getMetaProp('time');
    var currentDuration = this.playbackService.getMetaProp('duration');
    var len = this.markedEvents.length;
    var i = 0;
    for (; i < len; i++) {
      if (this.markedEvents[i].start_time > currentTime) {
        console.log('Seeking to ', this.markedEvents[i].start_time);
        //scope.enableAutoscroll(); // TODO in playerController
        this.handleScene(i, 'nextScene');
        found = true;
        break;
      }
    }
    if (!found) {
      this.pause();
      this.seek(currentDuration - 0.01, 'nextScene');
      //scope.enableAutoscroll(); // in playerController
    }
  }

  // svc.handleScene = handleScene;
  handleScene(index, action) {
    var s = this.markedEvents[index];
    var t = s.start_time;

    if (t === 0.01 && action !== 'prevScene') {
      // to allow seekPauseListener to pause if using nextScene arrow on unstarted episode
      t += 0.1;
    }

    this.seek(t, action);
    if (s.stop === true) {
      this.pause();
    }
  }

  // svc.prevScene = prevScene;
  prevScene() {
    var now = this.playbackService.getMetaProp('time');
    var timelineState = this.playbackService.getTimelineState();
    if (timelineState === 'playing') {
      now = now - 3; // leave a bit of fudge when skipping backwards in a video that's currently playing
    }
    var len = this.markedEvents.length - 1;
    var i = len;
    for (; i >= 0; i--) {
      if (this.markedEvents[i].start_time < now) {
        this.seek(this.markedEvents[i].start_time, 'prevScene');

        if (i === len) { //allow user to seek to event just prior to ending screen.
          --i;
        }

        this.handleScene(i, 'prevScene');
        break;
      }
    }
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - -

  // WHY IS THIS AUDIO CHOCOLATE IN MY TIMELINE PEANUT BUTTER?
  // to make it easier to maintain state for these across multiple videos, when there are multiple videos.
  // Also because there isn't an obviously better place for it.  If this is dumb, TODO: be less dumb

  toggleMute() {
    this.playbackService.toggleMute();
  };
  setVolume(vol) { // 0..100
    this.playbackService.setVolume(vol);
  };

  // - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Event clock

  /*
   If timeline is playing,
   TODO
   1. find out how long since last checked, compare videotime delta to timeline delta, adjust timeline if necessary)
   2. check for timeline events since the last time stepEvent ran, handle them in order
   3. if any were stop events,
   rewind the timeline and the video to that time (and stop handling events)
   otherwise
   set a timeout for a bit after the next event in the queue, up to some maximum amount of time, to run again
   (the 'up to some maximum' bit is for 1., so the timeline and video time don't fall out of synch)
   */

  private eventClockData;

  resetEventClock() {
    // console.log('RESET EVENT CLOCK');
    this.eventClockData = {
      lastTimelineTime: 0,
      lastVideoTime: 0,
      running: false
    };
  };
  // resetEventClock();

  startEventClock() {
    // console.log('START EVENT CLOCK');
    if (this.eventClockData.running) {
      return;
    }
    this.eventClockData.running = true;
    this.eventClockData.lastTimelineTime = this.playbackService.getMetaProp('time');
    this.eventClockData.lastVideoTime = this.playbackService.getMetaProp('time');
    // TODO this should be relative to episode, not timeline ^
    this.stepEvent();
  };

  stopEventClock() {
    // console.log('STOP EVENT CLOCK', playbackService.getCurrentTime());
    // playbackService.setMetaProp('time', playbackService.getCurrentTime() || 0);
    this.$timeout.cancel(this.eventTimeout);
    this.resetEventClock();
  };

  stepEvent(ignoreStopEvents?) {
    this.$timeout.cancel(this.eventTimeout);
    var vidTime = this.playbackService.getCurrentTime();
    var ourTime = this.playbackService.getMetaProp('time');

    // TODO check video time delta, adjust ourTime as needed (most likely case is that video stalled
    // and timeline has run ahead, so we'll be backtracking the timeline to match the video before we handle the events.
    // find timeline events since last time stepEvent ran, handle them in order until one is a stop or a seek
    for (var i = 0; i < this.timelineEvents.length; i++) {
      var evt = this.timelineEvents[i];

      if (evt.t >= this.eventClockData.lastTimelineTime) {
        if (evt.t > ourTime) {
          break; // NOTE! next event should be this one; let i fall through as is
        }
        // Don't let stop events stop us before we even start.
        // (if the stop event and lastTimelineTime match, that stop event is what stopped us in the first place)
        if (evt.action === 'pause' && (ignoreStopEvents || evt.t === this.eventClockData.lastTimelineTime)) {
          // console.log("Skipping pause event");
        } else {
          this.handleEvent(evt);
          if (evt.action === 'pause') {
            // TODO: check for multiple simultaneous pause actions, skip to the last one
            i++;
            break; //NOTE! next event should be the one AFTER the stop event, so let i++ fall through
          }
        }
      }
    }

    var nextEvent = this.timelineEvents[i]; // i falls through from the break statements above
    var lastEvent = this.timelineEvents[this.timelineEvents.length - 1];

    if (!this.ittUtils.existy(nextEvent) && this.ittUtils.existy(lastEvent) && /internal:endingscreen/.test(lastEvent.id)) {
      this._doEndingSequence();
    }

    this.eventClockData.lastVideoTime = vidTime;
    this.eventClockData.lastTimelineTime = ourTime;

    if (nextEvent && this.playbackService.getTimelineState() === 'playing') {
      // need to check timelineState in case there were stop events above
      // Find out how long until the next event, and aim for just a bit after it.
      var timeToNextEvent = (this.timelineEvents[i].t - ourTime) * 1000 / this.timeMultiplier;
      // console.log("next event in ", timeToNextEvent);
      this.eventTimeout = this.$timeout(this.stepEvent, timeToNextEvent + 10);
    }
  };

  // "event" here refers to a timelineEvents event, not the modelSvc.event:
  handleEvent(event) {
    if (event.id === 'timeline') {
      //console.log("TIMELINE EVENT");
      if (event.action === 'pause') {
        this.playbackService.setMetaProp('time', event.t);
        console.log('handle stop event');
        this.pause(); // TODO handle pause with duration too
      } else {
        this.play();
      }
    } else {
      if (event.action === 'enter') {
        this.modelSvc.events[event.id].state = 'isCurrent';
        this.modelSvc.events[event.id].isCurrent = true;
      } else if (event.action === 'exit') {
        this.modelSvc.events[event.id].state = 'isPast';
        this.modelSvc.events[event.id].isCurrent = false;
      } else if (event.action === 'preload') {
        this.preloadImageAsset(this.modelSvc.events[event.id]);
      } else {
        console.warn('Unknown event action: ', event, event.action);
      }
    }
  };

  // This is ONLY used to update appState.time in "real" time.  Events are handled by stepEvent.
  private lastTick: number | undefined;
  startTimelineClock() {
    // console.log('START TIMELINE CLOCK');
    this.lastTick = undefined;
    this.$interval.cancel(this.clock); // safety belt, in case we're out of synch
    this.clock = this.$interval(this._tick, 20);
  };

  private _tick() {
    var thisTick: any = new Date();
    var delta = (Number.isNaN(thisTick - this.lastTick)) ? 0 : (thisTick - this.lastTick);

    //in the event that the timelineClock is running but the eventClock is not, start the eventClock.
    if (!this.eventClockData.running) {
      this.startEventClock();
    }

    var newTime = parseFloat(this.playbackService.getMetaProp('time')) + (delta / 1000 * this.timeMultiplier);
    // check for out of bounds:
    if (newTime < 0) {
      newTime = 0;
      this.pause();
    }

    var currentDuration = this.playbackService.getMetaProp('duration');
    if (newTime > currentDuration) {
      newTime = currentDuration;
      // svc.pause();
      // _resetClocks();
    }

    this.playbackService.setMetaProp('time', newTime);
    this.lastTick = thisTick;
  };

  init(episodeId) {
    // console.log('timelineSvc#init', episodeId);
    this.timelineEvents = [];
    this.markedEvents = [];
    this.displayMarkedEvents = [];
    this.timeMultiplier = 1;
    var episode = this.modelSvc.episode(episodeId);
    this.playbackService.seedPlayer(episode.masterAsset.mediaSrcArr, episode.masterAsset._id, true);
    this.playbackService.setTimelineState('unstarted');
    this.playbackService.setMetaProp('duration', 0);
    this.injectEvents(this.modelSvc.episodeEvents(episodeId), 0);

    var context = this;
    this.playbackService.registerStateChangeListener( function () {
      context._onPlayerStateChange(); 
    });

    this.$interval.cancel(this.clock);
    this.stopEventClock();
  };

  injectEvents(events, injectionTime) {

    // console.log("timelineSvc.injectEvents: has ", svc.timelineEvents.length, " adding ", events.length);
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

    var context = this;
    angular.forEach(events, function (event) {
      event.start_time = Number(event.start_time);
      event.end_time = Number(event.end_time);
      // add scenes to markedEvents[]:
      if (event._type === 'Scene') {
        if (context.appState.product === 'producer') {
          // producer gets all scenes, even 'hidden' ones (which are now not 'hidden' but they indicate
          //change in layout).
          context.addMarkedEvent(event);
        }

        if (/internal:(landing|ending)screen/.test(event._id)) {
          context.addMarkedEvent(event);
        }
      }
      if (event._type === 'Chapter' || event.chapter_marker === true) {
        context.addMarkedEvent(event);
      }
      if (event.start_time === 0 && !event._id.match('internal')) {
        event.start_time = 0.01;
        context.modelSvc.events[event._id].start_time = 0.01;
      }
      // add start and end to timelineEvents array
      if (event.stop) {
        context.addMarkedEvent(event); // give all stop items a timeline marker

        context.timelineEvents.push({
          t: event.start_time + injectionTime,
          id: 'timeline',
          eventId: event._id, //Need to store the event id in case this event needs to get removed from the timeline
          action: 'pause'
        });
        context.timelineEvents.push({
          t: event.start_time + injectionTime,
          id: event._id,
          action: 'enter'
        });
        // For now, ignore end_time on stop events; they always end immediately after user hits play again.
        // In future we may allow durations on stop events so the
        // video will start automatically after that elapses.
        context.timelineEvents.push({
          t: (event.start_time + injectionTime + 0.01),
          id: event._id,
          action: 'exit'
        });
      } else {
        // not a stop event.
        context.timelineEvents.push({
          t: event.start_time + injectionTime,
          id: event._id,
          action: 'enter'
        });

        if (event.end_time || event.end_time === 0) {
          if (/internal:endingscreen/.test(event._id)) {
            // console.log('do not add exit event for ending screen.');
            return;
          }
          context.timelineEvents.push({
            t: event.end_time + injectionTime,
            id: event._id,
            action: 'exit'
          });
        } else {
          // TODO: handle missing end times.
          // For transcript items, create an end time matching the start of the next transcript or the end of the scene
          // or the duration (whichever comes first)
          // For other items, create an end time matching the next scene start or the duration, whichever comes first
          // For scenes, create an end time matching the start of the next scene or the duration, whichever comes first.
          // That's complex logic, may be better handled in a second pass.... or, duh,  during authoring
          console.warn('Missing end_time on event ', event);
        }
      }

      // allow preload of event assets:
      if (event.asset_id || event.annotation_image_id || event.link_image_id) {
        context.timelineEvents.push({
          t: (event.start_time < 3) ? 0 : event.start_time - 3, // 3 seconds early
          id: event._id,
          action: 'preload'
        });
      }

    });

    this.sortTimeline();
    var groupedEvents = this.groupByStartTime(this.markedEvents);
    this.displayMarkedEvents = this.prepGroupedEvents(groupedEvents);
  };

  groupByStartTime(array) {
    return array.reduce(function (map, event) {
      if (map.hasOwnProperty(event.start_time)) {
        map[event.start_time].push(event);
      } else {
        map[event.start_time] = [event];
      }
      return map;
    }, {});
  }

  prepGroupedEvents(map) {
    var displayArr = [];
    angular.forEach(map, function (val, key) {
      var obj = {
        events: val,
        stop: false,
        multiStop: false,
        start_time: key,
        //null over '' because empty strings are truthy in JS :(
        toolTipText: null,
        layoutChange: false
      };
      var foundStop = false, chapters = [], foundScene = false, foundInternalScene = false;
      angular.forEach(val, function (event) {
        if (/internal:endingscreen|internal:landingscreen/.test(event._id)) {
          foundInternalScene = true;
        }
        if (event.stop) {
          foundStop = true;
        }
        if (event.type === 'Scene') {
          foundScene = true;
        }

        if (event.type === 'Chapter' || event.chapter_marker === true) {
          chapters.push(event);
        }

      });

      if (chapters.length === 0 && !foundScene && foundStop) {
        obj.toolTipText = 'Stop item';
      }

      if (foundStop) {
        obj.stop = true;
      }

      if (obj.events.length > 1 && foundStop) {
        obj.multiStop = true;
      }

      if (foundScene && chapters.length === 0) {
        obj.layoutChange = true;
        obj.toolTipText = '(Layout Change)';
      }

      if (chapters.length > 0) {
        angular.forEach(chapters, function (chap, $index) {
          if ($index === 0) {
            obj.toolTipText = chap.display_annotation || chap.display_title;
          } else {
            obj.toolTipText += ' / ' + (chap.display_annotation || chap.display_title);
          }
        });

        if (foundScene) {
          obj.toolTipText += ' (Layout Change)';
        }

        if (obj.multiStop) {
          obj.toolTipText += ' / (Stop item)';
        }
      }
      if (!foundInternalScene) {
        displayArr.push(obj);
      }
    });

    return displayArr;
  }

  addMarkedEvent(newEvent: IEvent) {
    // scan through existing markedEvents; if the new event is already there, replace it; otherwise add it
    var wasFound = false;
    for (var i = 0; i < this.markedEvents.length; i++) {
      if (this.markedEvents[i]._id === newEvent._id) {
        // replace existing event
        this.markedEvents[i] = angular.copy(newEvent);
        wasFound = true;
      }
    }

    // wasn't found, so add it:
    if (!wasFound) {
      this.markedEvents.push(newEvent);
    }

    // console.log(svc.markedEvents);
  };

  removeEvent(removeId) {
    // delete anything corresponding to this id from the timeline:
    // console.log("timelineSvc.removeEvent");
    this.timelineEvents = this.$filter('filter')(this.timelineEvents, function (timelineEvent) {
      //Remove the timeline event if it's _id or eventId  equal the removeId
      if (timelineEvent.id === removeId || timelineEvent.eventId === removeId) {
        return false;
      }
      return true;
    });
    this.markedEvents = this.markedEvents.filter((e: any) => e._id !== removeId);
    //TS-1154 - remove the event from the displayMarkedEvents
    var groupedEvents = this.groupByStartTime(this.markedEvents);
    this.displayMarkedEvents = this.prepGroupedEvents(groupedEvents);
    this.updateEventStates();
  };

  updateEventTimes(event) {
    // remove old references, as in removeEvent, then re-add it with new times
    // (not calling removeEvent here since it would do a redundant updateEventStates)
    this.timelineEvents = this.$filter('filter')(this.timelineEvents, function (timelineEvent) {
      //Remove the timeline event if it's _id or eventId  equal the removeId
      if (timelineEvent.id === event._id || timelineEvent.eventId === event._id) {
        return false;
      }
      return true;
    });
    this.injectEvents([event], 0);
  };

  updateSceneTimes(episodeId) {
    // HACK(ish): since editing a scene's timing has side effects on other scenes,
    // need to updateEventTimes for each scene in the episode when one changes

    var context = this;
    angular.forEach(this.modelSvc.episodes[episodeId].scenes, function (scene) {
      context.updateEventTimes(scene);
    });
  };

  sortTimeline() {

    // keep events sorted by time.
    // Simultaneous events should be sorted as exit, then enter, then stop.
    // (sort order of 'preload' events doesn't matter.)
    this.timelineEvents = this.timelineEvents.sort(function (a, b) {
      if (a.t === b.t) {
        if (a.action === b.action) {
          return 0;
        }
        // This is overly verbose, but I keep running into differences in
        // how Safari and FF sort when I try to simplify it:
        if (a.action === 'enter') {
          if (b.action === 'pause') {
            return -1;
          }
          if (b.action === 'exit') {
            return 1;
          }
        }
        if (a.action === 'exit') {
          return -1;
        }
        if (a.action === 'pause') {
          return 1;
        }
        return 0;
      } else {
        return a.t - b.t;
      }
    });

    this.markedEvents = this.markedEvents.sort(function (a, b) {
      return a.start_time - b.start_time;
    });

    // for (var i = 0; i < svc.timelineEvents.length; i++) {
    // 	console.log(svc.timelineEvents[i].t, svc.timelineEvents[i].action);
    // }

    // Find the latest end_time in the timeline, set that as the duration.
    // TODO this will need to change when we support multiple episodes in one timeline

    if (this.timelineEvents.length > 0) {
      this.playbackService.setMetaProp('duration', this.timelineEvents[this.timelineEvents.length - 1].t);
    }
    this.updateEventStates();
  };

  updateEventStates() {
    // Sets past/present/future state of every event in the timeline.
    // TODO performance check (though this isn't done often, only on seek and inject.)

    // DO NOT check event start and end times directly; they're relative to the episode, not the timeline!
    // instead preset everything to the future, then scan the timeline events up to now
    // and set state based on enter/exit events per the timeline

    var context = this;
    var now = this.playbackService.getMetaProp('time');
    // put everything in the future state:
    angular.forEach(this.timelineEvents, function (tE) {
      if (tE.id !== 'timeline') {
        var event = context.modelSvc.events[tE.id];
        if (event) { // cancelling adding an event can leave "internal:editing" in the event list;
          // TODO keep that from happening but for now just ignore it if it doesn't exist
          event.setFuture();
        }
      }
    });

    // 2nd pass, step through all events before now:
    angular.forEach(this.timelineEvents, function (tE) {
      if (tE.t <= now) {
        var event = context.modelSvc.events[tE.id];
        if (event) {
          if (tE.action === 'enter') {
            event.setCurrent();
          } else if (tE.action === 'exit') {
            event.setPast();
          }
        }
      }
    });
    // console.count('updateEventState called');
    // console.trace('updateEventStates');
    // console.log('tlEvents', modelSvc.episodes[appState.episodeId].scenes);
  };

  private alreadyPreloadedImages = {};
  preloadImageAsset(event) {
    if (event.asset && event.asset._type === 'Asset::Image') {
      if (!this.alreadyPreloadedImages[event.asset.url]) {
        // console.log("Preloading ", event.asset.url);
        this.alreadyPreloadedImages[event.asset.url] = new Image();
        this.alreadyPreloadedImages[event.asset.url].src = event.asset.url;
      }
    }
  };

}
