/*
 Stash for shared information, to save us a lot of $watching and $emitting.
 It's convenient.  Maybe -too- convenient.

 I have a sinking feeling this is probably an elaborate wheel-reinvention of $rootScope, but hey, it works

 */

const noAvatarImg = require('../../images/no-avatar.gif');
/**
 * @ngdoc service
 * @name iTT.service:appState
 * @description
 * POJO designed to store application state during app runtime. All values are initiazed as boolean and set to false.
 * Values are then updated in place by injecting the appState into the relevant destination and overwriting the initial values
 * @requires $interval
 * @requires config
 * @property {Object} user whatever authSvc gets back from getAccessToken
 * @property {String} episodeId ID of current episode (Initialized as bool set to false).
 * @property {String} episodeSegmentId ID of current episode segment (only relevant in narratives)
 * @property {String} narrativeId also only relevant in narratives
 * @property {String} timelineId ID of timeline
 * @property {Boolean} isFramed are we inside an iframe?  Don't use !== because IE8 gets it wrong
 * @property {Boolean} isTouchDevice Determines whether or not client is touch enabled via user agent
 * @property {Boolean} isIphone iPhone has weird video handling, see  timelineSvc
 * @property {Number} windowWidth width of content pane, updated every 50ms
 * @property {Number} windowHeight height of content pane, updated every 50ms
 * @property {String} viewMode Sets view mode based upon window width
 * @property {Number} producerEditLayer a bit hacky, this.  Only has an effect in producer in discover mode; 0 is default, -1 is background layers only, 1 is foreground layers only
 * @property {Number} time current playhead position (in seconds) relative to timeline NOT TO EPISODE!
 * @property {Number} bufferedPercent portion of video that has been buffered (as pct instead of time because that's how youtube reports it, and that's what we end up displaying anyway)
 * @property {Number} timeMultiplier sets player speed (0.5 = half speed; 2=double;etc)
 * @property {Number} duration duration of timeline (in seconds)
 * @property {String} timelineState "playing", "paused", or "buffering" (set by timelineSvc). Future = "locked" (by stop question or etc)
 * @property {Boolean} hasBeenPlayed set to true after first time the video plays (used so we can interrupt that first play with a helpful help)
 * @property {Number} volume Audio for main video
 * @property {Boolean} muted audio for main video
 * @property {Boolean} hideCaptions visibility of "closed captions" in watch mode
 * @property {Object} show Object with SearchPanel and NavPanel properties which are booleans
 * @property {Boolean} videoControlsActive whether bottom toolbar is visible
 * @property {Boolean} videoControlsLocked force bottom toolbar to stay in its current visible/hidden state
 * @property {Object} itemDetail Put item data here to show it as a modal overlay
 * @property {Boolean} autoscroll scroll window to make current items visible (in relevant modes)
 * @property {Boolean} autoscrollBlocked User has disabled autoscroll
 * @property {String} product "player", "sxs", or "producer"
 * @property {String} productLoadedAs same as product but only set on initial load, this lets producer toggle back to player preview temporarily
 * @property {Object} editEvent Scene or item currently being edited by user.
 * @property {Object} editEpisode Episode currently being edited by user. yes I did kind of paint myself into a corner here
 * @property {Object} lang set to false so the episode default knows when to override it
 */
// appState.$inject = ['$interval', 'config'];

const INITIAL_APP_STATE = {
  user: {}, // whatever authSvc gets back from getAccessToken
  episodeId: false, // ID of current episode
  episodeSegmentId: false, // ID of current episode segment (only relevant in narratives)
  narrativeId: false, // also only relevant in narratives
  timelineId: false, // ditto
  isFramed: (window.parent != window), // are we inside an iframe?  Don't use !== because IE8 gets it wrong
  isTouchDevice: (/iPad|iPod|iPhone/.test(navigator.platform) || /Android/.test(navigator.userAgent)),
  isIEOrEdge: (/Trident|Edge/.test(navigator.userAgent) || /Trident|Edge/.test(navigator.platform)),
  isIPhone: (navigator.platform.match(/iPod|iPhone/)), // iPhone has weird video handling, see  timelineSvc
  iOSVersion: '',
  noAvatarImg: noAvatarImg,
  windowWidth: 0,
  windowHeight: 0,
  viewMode: ($(window).width() > 480) ? 'discover' : 'review', // default view mode
  producerEditLayer: 0, // a bit hacky, this.  Only has an effect in producer in discover mode, 0 is default, -1 is background layers only, 1 is foreground layers only
  hideCaptions: false, // visibility of "closed captions" in watch mode
  show: {
    searchPanel: false,
    // helpPanel: false,
    navPanel: false
  },
  videoControlsActive: false, // whether bottom toolbar is visible
  videoControlsLocked: false, // force bottom toolbar to stay in its current visible/hidden state
  itemDetail: false, // Put item data here to show it as a modal overlay
  autoscroll: false, //scroll window to make current items visible (in relevant modes)
  autoscrollBlocked: false, // User has disabled autoscroll
  crossEpisodePath: '',
  product: '',
  productLoadedAs: '', // same as product but only set on initial load, this lets producer toggle back to player preview temporarily
  editEvent: false, // Scene or item currently being edited by user
  editEpisode: false, // Episode currently being edited by user. yes I did kind of paint myself into a corner here
// svc.youtubeIsReady: false, // Set to true when youtube API finishes loading.  DO NOT set this to false on init, otherwise navigating from episode to episode breaks (we reinit on new episode but that won't trigger youtube's ready event)
  lang: false, // set to false
};

export class AppState {
  static $inject = ['$interval', 'config'];
  user;
  episodeId;
  episodeSegmentId;
  narrativeId;
  timelineId;
  isFramed;
  isTouchDevice;
  isIEOrEdge;
  isIPhone;
  iOSVersion;
  noAvatarImg;
  windowWidth;
  windowHeight;
  viewMode;
  producerEditLayer;
  volume;
  muted;
  hideCaptions;
  show;
  videoControlsActive;
  videoControlsLocked;
  itemDetail;
  autoscroll;
  autoscrollBlocked;
  crossEpisodePath;
  product: 'player' | 'sxs' | 'producer';
  productLoadedAs;
  editEvent;
  editEpisode;
  lang;

  static getIOSVersion(navigator): number[] | void {
    const iOSDeviceRe = /iP(hone|od|ad)/;
    const versionRe = /OS (\d+)_(\d+)_?(\d+)?/;
    if (iOSDeviceRe.test(navigator.platform) || iOSDeviceRe.test(navigator.userAgent)) {
      const v = (navigator.appVersion).match(versionRe);
      return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
    }
  }

  constructor(private $interval, private config) {
    this.initService();
  }

  init() {
    let crossEpisodePath;
    if (this.product === 'sxs' || this.product === 'producer') {
      crossEpisodePath = this.product;
    } else {
      crossEpisodePath = "episode"; // yeah, that was kind of a dumb decision to switch from episode to "player"
    }
    const overrides = {
      iOSVersion: AppState.getIOSVersion(navigator),
      crossEpisodePath,
      product: this.product,
      productLoadedAs: this.productLoadedAs,
      user: this.user || {}
    };

    Object.assign(this, INITIAL_APP_STATE, overrides);
  }

  initService() {
    this.init();
    this.watchWidth();
  }

  watchWidth() {
    this.$interval(() => {
      this.windowHeight = angular.element(window).height();
      this.windowWidth = angular.element(window).width();
    }, 50, 0, false);

    if (this.config.debugInBrowser) {
      console.log('appState:', this);
    }
  }
}
