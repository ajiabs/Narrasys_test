// @npUpgrade-player-true
/*
 There are two separate types of user activity to capture, which go to separate API endpoints.
 Some types must contain additional info in a "data" object:

 episode activity:
 episodeLoad					triggered immediately when episode is loaded
 episodeUnload        triggered immediately when episode is navigated away from.
 episodeEnd					triggered when user reaches end of episode
 play								triggered when user hits play
 pause								triggered when user hits pause
 seek								triggered whenever user changes the playhead position.
 seekFrom:	timestamp of origin
 method:		"scrubTimeline", "sceneMenu", "nextScene", "prevScene", "clickedOnEvent".
 eventID:	include if method was "clickedOnEvent"
 modeChange					triggered when episode is loaded (since default isn't always the same), and on user changes of mode
 mode: "watch","discover","review"
 playbackRateChange	triggered when user changes the playback speed
 playbackRate: 1
 stall								triggered when video playback stalls unintentionally
 lowBandwidth				triggered when we switch to a lower-bandwidth video stream due to too many stall events
 search (TODO)				(search is incremental, so will have to think about how/when to capture this)

 event activity: captures interaction with specific transmedia items ("events").
 Different types of event can define their own interactions, but the core ones will be
 viewed							player reached the event's start_time by any method
 interacted					user clicked a transmedia link, for example
 completed						up to the transmedia item to define what constitutes "completion"
 question-answered		for quiz questions.  Data field should be {answer: 'answer text', correct: t/f}
 */

import { config } from '../../../config';

export interface IAnalyticsSvc {
  captureEpisodeActivity(name: AnalyticType, data?): void;
  captureEventActivity(name: AnalyticType, eventID, data?: IAnalyticData, force?): void;
  forceCaptureEventActivityWithPromise(name: AnalyticType, eventID, data: IAnalyticData): ng.IPromise<void>;
  captureEventActivityWithPromise?(name: AnalyticType, eventID, data): ng.IPromise<void>;
  readEpisodeActivity(epId: string): ng.IPromise<any>;
  readEventActivity(eventId, activityType): ng.IPromise<any>;
  startPolling(): void;
  stopPolling(): void;
}

import { AppState } from '../../../shared/services/appState';
import { ILangForm } from '../../../interfaces';

type AnalyticType = 'episodeLoad' | 'episodeUnload' | 'play' | 'pause' | 'seek' | 'modeChange' | 'question-answered';

interface IAnalytic {
  name: AnalyticType;
  walltime: Date;
  age?: any;
  event_id?: string;
  timestamp?: number;
  data?: IAnalyticData;
}

interface IAnalyticData {
  method?: 'scrubTimeline' | 'sceneMenu' | 'nextScene' | 'prevScene' | 'clickedOnEvent';
  mode?: 'discover' | 'review' | 'watch';
  seekStart?: number;
  answer?: ILangForm | string;
  index?: number;
  correct?: boolean;
}


export class AnalyticsService implements IAnalyticsSvc {
  private activityQueue: IAnalytic[] = [];
  private pollInterval: any;
  private pollLength: number = 10 * 1000;
  static Name = 'analyticsSvc'; // tslint:disable-line
  static $inject = ['$q', '$http', '$routeParams', '$interval', 'appState', 'playbackService'];

  constructor(private $q: ng.IQService,
              private $http: ng.IHttpService,
              private $routeParams,
              private $interval: ng.IIntervalService,
              private appState: AppState,
              private playbackService) {
  }

  startPolling() {
    this.pollInterval = this.$interval(() => this.flushActivityQueue(), this.pollLength);
  }

  stopPolling() {
    // send any pending metrics
    this.flushActivityQueue();
    this.$interval.cancel(this.pollInterval);
  }

  captureEpisodeActivity(name: AnalyticType, data?) {
    if ((this.appState.user && this.appState.user._id) && (!this.appState.user.track_episode_metrics)) {
      return;
    }

    const userActivity: IAnalytic = {
      'name': name,
      'walltime': new Date(),
      //if metaProps time hasn't been set,
      'timestamp': this.playbackService.getMetaProp('time') || 0 // TODO this is timeline time, we want episode time!
    };

    if (data) {
      userActivity.data = data;
    }

    this.activityQueue.push(userActivity);
  }

  captureEventActivity(name: AnalyticType, eventID, data?, force?) {
    if (!force) {
      if (config.disableAnalytics || (this.appState.user._id && !this.appState.user.track_event_actions)) {
        return;
      }
    }
    if (data === undefined) {
      console.warn('captureEventActivity called with no data for event ', eventID);
    }
    // console.log(data);
    this.activityQueue.push({
      'name': name,
      'event_id': eventID,
      'walltime': new Date(),
      'data': data
    });
  }

  readEpisodeActivity(epId) {
    return this.$http.get(`${config.apiDataBaseUrl}/v2/episodes/${epId}/episode_user_metrics`)
      .then((respData) => respData)
      .catch(err => console.log('error'));
  }

  readEventActivity(eventId, activityType) {
    return this.$http.get(`${config.apiDataBaseUrl}/v2/events/${eventId}/event_user_actions`)
      .then(resp => resp.data)
      .then((respData: IAnalytic[]) => {
        if (activityType) {
          for (let i = 0; i < respData.length; i++) { // tslint:disable-line
            const activity = respData[i];
            if (activity.name === activityType) {
              return true;
            }
          }
        } else {
          return respData;
        }
      });
  }

  forceCaptureEventActivityWithPromise(name, eventId, data) {
    this.captureEventActivity(name, eventId, data, true);
    return this.flushActivityQueue();
  }

  private flushActivityQueue(): ng.IPromise<any> {

    return this.$q((resolve) => {

      if (this.activityQueue.length === 0) {
        return resolve('');
      }

      if (!this.appState.episodeId) {
        resolve();
      }

      const actions = angular.copy(this.activityQueue);
      this.activityQueue = [];

      const now = new Date();
      let episodeUserMetrics = [];
      const eventUserActions = [];

      angular.forEach(actions, (action) => {
        action.age = (+now - +action.walltime) / 1000;
        delete action.walltime;
        if (action.event_id) {
          eventUserActions.push(action);
        } else {
          episodeUserMetrics.push(action);
        }
      });
      episodeUserMetrics = this.dejitter(episodeUserMetrics);

      const posts = [];
      if (eventUserActions.length > 0) {
        const euaPath = config.apiDataBaseUrl + '/v2/episodes/' + this.appState.episodeId + '/event_user_actions';
        posts.push(
          this.$http.post(euaPath,
            {
              'event_user_actions': eventUserActions
            })
        );
      }
      if (episodeUserMetrics.length > 0) {
        posts.push(this.$http.post(
          config.apiDataBaseUrl + '/v2/episodes/' + this.appState.episodeId + '/episode_user_metrics',
          {
            'episode_user_metrics': episodeUserMetrics
          })
        );
      }

      // console.log('flushing queue!', eventUserActions, episodeUserMetrics);

      return this.$q.all(posts);
    });
  }

  private dejitter(events) {
    // Consolidate repeated seek events into one single seek event before sending to API.
    // TODO prevent this happening in the first place :)
    if (events.length === 0) {
      return [];
    }
    const ret = [];
    for (let i = 0; i < events.length - 1; i++) {
      // if this event and the next one are both seek events, and this event's timestamp matches
      // the next event's seekStart, skip this event and set the next event's seekStart to this one's.
      // otherwise just put it into the queue.
      const a = events[i];
      const b = events[i + 1];
      if (a.name === 'seek' && b.name === 'seek' &&
        (a.timestamp === b.data.seekStart)) {
        b.data.seekStart = a.data.seekStart;
      } else {
        ret.push(events[i]);
      }
    }
    ret.push(events[events.length - 1]);
    return ret;
  }
}

