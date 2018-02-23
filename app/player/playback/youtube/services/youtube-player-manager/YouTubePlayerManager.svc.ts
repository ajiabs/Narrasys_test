import { BasePlayerManager } from '../../../services/base-player-manager/basePlayerManager';
import { IMetaProps, IPlayerManager, IScriptLoader } from '../../../../../interfaces';
import { PlayerManagerCommons } from "../../../services/player-manager-commons/playerManagerCommons";
import { existy } from '../../../../../shared/services/ittUtils';

// @npUpgrade-youtube-false
/**
 * Created by githop on 12/3/15.
 */

/***********************************
 **** Updated by Curve10 (JAB/EDD)
 **** Feb 2018
 **** YT is not defined, it is a global, possibly defined by YouTube loader...
 ***********************************/

/**
 * @ngdoc service
 * @name iTT.service:youTubePlayerManager
 * @description
 * A service for working with youtube iframes
 * {@link https://github.com/InTheTelling/client/blob/master/app/scripts/services/YouTubePlayerManager.svc.js source}
 * @requires $location
 * @requires YoutubePlayerApi
 * @requires errorSvc
 * @requires PLAYERSTATES
 * @requires youtubeUrlService
 */

 export interface IYouTubePlayerManager {
  setSpeed(pid, playbackRate);
  play(pid);
  pause(pid);
  stop(pid);
  setPlaybackQuality(pid, size);
  getBufferedPercent(pid),
  seekTo(pid, t);
  toggleMute(pid);
  setVolume(pid, v);
  type:string;
 }


export class YouTubePlayerManager extends BasePlayerManager implements IYouTubePlayerManager {
  static Name = 'youTubePlayerManager'; // tslint:disable-line
  static $inject = ['$location', 'ittUtils', 'YTScriptLoader', 'errorSvc', 'PLAYERSTATES', 'youtubeUrlService', 'playerManagerCommons'];

  constructor (
    private $location,
    private ittUtils,
    private YTScriptLoader,
    private errorSvc,
    private PLAYERSTATES,
    private youtubeUrlService,
    private playerManagerCommons) {
      super();

      // Initialization
      angular.extend(this._youtubeMetaObj.meta, this._youtubeMetaProps, this.commonMetaProps);

      // must be done after the line above in the constructor or else the variables aren't set.
      // var _validMetaKeys = Object.keys(this._youtubeMetaObj.meta);
      // this.setMetaProp = this.setMetaProp(_validMetaKeys);
 
  }

  // private _youTubePlayerManager;
  private _players = {};
  private _mainPlayerId;
  type = 'youtube';
 

  
  private cancelBuffering = this.ittUtils.cancelNgTimeout;
  private waitForBuffering = this.ittUtils.ngTimeout;



  private _youtubeMetaProps = {
    ytId: '',
    videoType: this.type,
    bufferInterval: null
  };

  private _youtubeMetaObj = {
    instance: null,
    meta: {}
  };



  // as we cannot rely on the constructors to use the injection with custom variables when instantiating a class, re-include the ittUtils
 // private base =  new PlayerManagerCommons(this.ittUtils, {players: this._players, type: this.type});
 // private getPlayer = this.getPlayer;
 //private setPlayer = this.setPlayer;
 // private commonMetaProps = this.commonMetaProps;
       // this.getInstance = this.getInstance(this.predicate);
  // private createMetaObj = this.createMetaObj;
   //    private getMetaObj = this.getMetaObj;
   //    private getMetaProp = this.getMetaProp;
   //    private registerStateChangeListener = this.registerStateChangeListener;
   //    private unregisterStateChangeListener = this.unregisterStateChangeListener;
   //    private pauseOtherPlayers = this.pauseOtherPlayers(this.pause, this.playerState);
   //    private getPlayerDiv = this.getPlayerDiv;
   //    private resetPlayerManager = this.resetPlayerManager(this.destroyFn);
   //    private renamePid = this.renamePid;
    //   private handleTimelineEnd = this.handleTimelineEnd(this.youtubeEnding);
  // private _getStateChangeListeners = this.base.getStateChangeListeners; 
   //
   // setMetaProp = this.setMetaProp; 


  predicate(pid) {
    return (this._existy(this.getPlayer(pid)) && this.getMetaProp(pid, 'ready') === true);
  };

  private destroyFn(pid) {
    var p = this.getInstance(pid);
    this._tryCommand(p, 'destroy');
  };

  private youtubeEnding(pid) {
    this.setMetaProp(pid, 'time', this.getMetaProp(pid, 'duration'));
    this.ittUtils.ngTimeout( () => {
      if (this.playerState(pid) !== 'ended') {
        console.log('on ended state', this.playerState(pid));
        this.stop(pid);
      }
    }, 500);
  };


  //public methods
  /**
   * @ngdoc method
   * @name #seedPlayerManager
   * @methodOf iTT.service:youTubePlayerManager
   * @description
   * Used to set the PID / divID for a YT instance, is called prior to create()
   * @param {String} id Main Video Asset ID or Event ID, for embeds
   * @param {Boolean} mainPlayer Determines type of player, embed or main
   * @param {Array} mediaSrcArr array of youtube URLs
   * @returns {Void} returns void.
   */
  seedPlayerManager(id, mainPlayer, mediaSrcArr) {

    //bail if we already have set the instance in the _players map.
    if (this._existy(this.getPlayer(id)) && this.getMetaProp(id, 'startAtTime') > 0) {
      return;
    }

    if (mainPlayer) {
      // setPlayer(id, {});
      this._players = {};
      this._mainPlayerId = id;
    }

    var newProps = {
      mainPlayer: mainPlayer,
      div: this._getPlayerDiv(id),
      ytId: this.youtubeUrlService.extractYoutubeId(mediaSrcArr[0])
    };

    this.setPlayer(id, YouTubePlayerManager.createMetaObj(newProps));
  }

      /**
     * @private
     * @ngdoc method
     * @name onReady
     * @methodOf iTT.service:youTubePlayerManager
     * @description
     * Event Handler called when YT instance is ready
     * @param {Object} event an object with target and data properties with metadata regarding the event and
     * player that emitted it.
     * @returns {Void} has no return value
     */

   private onReady(event, context) {

    var pid = context._getPidFromInstance(event.target);

    var playerReadyEv = context._formatPlayerStateChangeEvent({data: '6'}, pid);
    context.setMetaProp(pid, 'duration', event.target.getDuration());
    context._emitStateChange(playerReadyEv);
  }

     /**
     * @private
     * @ngdoc method
     * @name onPlayerStateChange
     * @methodOf iTT.service:youTubePlayerManager
     * @description
     * Event handler responsible responsible for handling events emitted from a youtube player instance
     * Responsible for interaction between our app and youtube iframes. Toggles playback
     * between main and embedded videos
     * @param {Object} event an object with target and data properties with metadata regarding the event and
     * player that emitted it.
     * @returns {Void} has no return value
     */
    private onPlayerStateChange(event, context) {
      var pid = context._getPidFromInstance(event.target);
      context.setMetaProp(pid, 'playerState', event.data);
      var stateChangeEvent = context._formatPlayerStateChangeEvent(event, pid);
      var isBuffering = context.getMetaProp(pid, 'bufferInterval');
      // console.log('YT PlayerState', PLAYERSTATES[event.data]);

      if (event.data === YT.PlayerState.ENDED) {
        event.target.stopVideo();
      }

      if (event.data === YT.PlayerState.BUFFERING) {
        isBuffering = context.waitForBuffering( () => {
          if (event.target.getPlayerState() === YT.PlayerState.BUFFERING) {
            context._reset(pid);
          }
        }, 7 * 1000);
        context.setMetaProp(pid, 'bufferInterval', isBuffering);
      } else {
        context.cancelBuffering(isBuffering)
      }

      context._emitStateChange(stateChangeEvent);
    }

    /**
     * @private
     * @ngdoc method
     * @name onPlayerQualityChange
     * @methodOf iTT.service:youTubePlayerManager
     * @description
     * Event Handler called when changing playback quality
     * @param {Object} event an object with target and data properties with metadata regarding the event and
     * player that emitted it.
     * @returns {Void} has no return value
     */
    private onPlayerQualityChange(event, context ) {
      var pid = context._getPidFromInstance(event.target);
      if (event.data === 'medium' && /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)) {
        context.setPlaybackQuality(pid, 'large');
      }

      // qualityChangeCB(event);

    }

    /**
     * @private
     * @ngdoc method
     * @name onError
     * @methodOf iTT.service:youTubePlayerManager
     * @description
     * Error Handler for youtube iframe API errors
     * @param {Object} event an object with target and data properties with metadata regarding the event and
     * player that emitted it.
     * @returns {Void} has no return value
     */
    private onError(event, context) {
      var brokePlayerPID = this._getPidFromInstance(event.target);
      if (event.data === 5) {
        //only _reset for HTML5 player errors
        console.warn('resetting for chrome!!!');
        context._reset(brokePlayerPID);
      }
    }
  
    /**
   * @ngdoc method
   * @name #create
   * @methodOf iTT.service:youTubePlayerManager
   * @param {String} playerId unique ID of player.
   * @description
   * Used to create an instance of the YT object which is necessary to
   * interface with the youtube Iframe API
   * @returns {void} has no return value
   */

  create(playerId) {
    var ytId = this.getMetaProp(playerId, 'ytId');
    this._createInstance(playerId, ytId, this.onPlayerStateChange, this.onPlayerQualityChange, this.onReady, this.onError)
      .then((ytInstance) => {
        this.getPlayer(playerId).instance = ytInstance;
        this.setMetaProp(playerId, 'ytId', ytId);
      })
      .catch(_ => {
          // try again...
          return this._createInstance(playerId, ytId, onPlayerStateChange, onPlayerQualityChange, onReady, onError)
          .then((ytInstance) => {
            this.getPlayer(playerId).instance = ytInstance;
            this.setMetaProp(playerId, 'ytId', ytId);
          })
          .catch(_ => {
            // 2nd try.. call it a fail...
            var errorMsg = 'Network timeout initializing video player. Please try again.';
            this.errorSvc.error({data: errorMsg}, e);
          });
      });

      /*
      function handleSuccess(ytInstance) {
        this.getPlayer(playerId).instance = ytInstance;
        this.setMetaProp(playerId, 'ytId', ytId);
      }

    function tryAgain() {
      return this._createInstance(playerId, ytId, onPlayerStateChange, onPlayerQualityChange, onReady, onError)
        .then(_ =>handleSuccess)
        .catch(_ =>handleFail);
    }

    function handleFail(e) {
      var errorMsg = 'Network timeout initializing video player. Please try again.';
      this.errorSvc.error({data: errorMsg}, e);
    }
    */


    //available 'states'
    //YT.PlayerState.ENDED
    //YT.PlayerState.PLAYING
    //YT.PlayerState.PAUSED
    //YT.PlayerState.BUFFERING
    //YT.PlayerState.CUED



   
  }

  /**
   * @ngdoc method
   * @name #setSpeed
   * @methodOf iTT.service:youTubePlayerManager
   * @description
   * used to speed up / slow down the rate of video playback.
   * @param {String} pid pid of player
   * @param {Number} playbackRate the rate to set playback to.
   * @returns {Void} returns void.
   */
  setSpeed(pid, playbackRate) {
    var p = this.getInstance(pid);
    // getAvailablePlayBackRates returns an array of numbers, with at least 1 element; i.e. the default playback rate
    if (this._existy(p) && p.getAvailablePlaybackRates().length > 1) {
      p.setPlaybackRate(playbackRate);
    }
  }

  /**
   * @ngdoc method
   * @name #getCurrentTime
   * @methodOf iTT.service:youTubePlayerManager
   * @description
   * Used to get the current time of youtube video.
   * @param {String} pid The ID of the YT instance
   * @returns {Number} The current time of video in seconds.
   */
  getCurrentTime(pid) {
    var p = this.getInstance(pid);
    if (this._existy(p)) {
      return this._tryCommand(p, 'getCurrentTime');
    }
  }

  /**
   * @ngdoc method
   * @name #playerState
   * @methodOf iTT.service:youTubePlayerManager
   * @description
   * Used to get the playerState of a YT instance. Possible states:
   * -1 = unstarted
   * 0 = ended,
   * 1 = playing,
   * 2 = paused,
   * 3 = buffering,
   * 5 = video cued
   * @param {String} pid The ID of the YT instance
   * @returns {Number} Int representing current player state.
   */
  playerState(pid) {
    //  var p = this.getInstance(pid);
    var p = null;
    if (this.predicate(pid) === true) {
      p = this.getPlayer(pid).instance;
    }
    if (this._existy(p)) {
      return this.PLAYERSTATES[this._tryCommand(p, 'getPlayerState')];
    }
  }

  /*
  getPlayerState(pid) {
    // var p = this.getInstance(pid);
    var p = null;
    if (this.predicate(pid) === true) {
        p = this.getPlayer(pid).instance;
    }
    if (this._existy(p)) {
      return this.PLAYERSTATES[this._tryCommand(p, 'getPlayerState')];
    }
  }
  */
 private getInstance(pid: string): any {
  if (existy(this.getPlayer(pid)) && this.getMetaProp(pid, 'ready') === true) {
    return this.getPlayer(pid).instance;
  }
}
 getPlayerState(pid: string): string {
  const instance = this.getInstance(pid);
  if (instance) {

    return this.PLAYERSTATES[this._tryCommand(instance, 'getPlayerState')];
  }
}

  /**
   * @ngdoc method
   * @name #play
   * @methodOf iTT.service:youTubePlayerManager
   * @description
   * Used to resume playback
   * @param {String} pid The ID of the YT instance
   * @returns {Void} no return value
   */
  play(pid) {
    var p = this.getInstance(pid);
    if (this._existy(p)) {
      this._tryCommand(p, 'playVideo');
    }
  }

  /**
   * @ngdoc method
   * @name #pause
   * @methodOf iTT.service:youTubePlayerManager
   * @description
   * Used to pause playback
   * @param {String} pid The ID of the YT instance
   * @returns {Void} no return value
   */
  pause(pid) {
    var p = this.getInstance(pid);

    // console.log('pause instance?', p);
    if (this._existy(p)) {
      this._tryCommand(p, 'pauseVideo');
    }
  }

  /**
   * @ngdoc method
   * @name #stop
   * @methodOf iTT.service:youTubePlayerManager
   * @description
   * Stops video playback and download of video stream
   * @params pid The id of the player
   * @returns {Void} no return value
   */
  stop(pid) {
    var p = this.getInstance(pid);
    if (this._existy(p)) {
      this._tryCommand(p, 'stopVideo');
    }
  }

  /**
   * @ngdoc method
   * @name #setPlaybackQuality
   * @methodOf iTT.service:youTubePlayerManager
   * @description
   * Used to pick a desired video quality
   * @param {String} pid The ID of the YT instance
   * @returns {Void} no return value
   */
  setPlaybackQuality(pid, size) {
    var p = this.getInstance(pid);
    if (this._existy(p)) {
      p.setPlaybackQuality(size);
    }
  }

  /**
   * @ngdoc method
   * @name #getVideoLoadedFraction
   * @methodOf iTT.service:youTubePlayerManager
   * @description
   * Used to determine the percent of buffered video
   * @param {String} pid The ID of the YT instance
   * @returns {Number} Numerical value representing
   * percent of video that is currently buffered
   */
  // this is a private method.. no apparent reason for this to be separated from the public method.
  private getVideoLoadedFraction(pid) {
    var p = this.getInstance(pid);
    if (this._existy(p)) {
      return p.getVideoLoadedFraction() * 100;
    }
  }

  // this is the method that is called by the player manager
 getBufferedPercent = this.getVideoLoadedFraction;

  /**
   * @ngdoc method
   * @name #seekTo
   * @methodOf iTT.service:youTubePlayerManager
   * @description
   * Used to seek the video to a desired time in seconds. Note: On safari, if seekTo is called with a time where
   * the video data is already available (i.e. we seek within our buffered range), the onStateChange event will
   * not fire a 'buffering' event, or a 'playing' event after the seek has completed and the playback resumes.
   *
   * Since a seeking will stop our event clock from running, and a 'playing' event will not be fired when the seek
   * operation is finished, we need to manually restart the event clock, which is done in the timelineSvc _tick
   * function.
   * @param {String} pid The ID of the YT instance
   * @param {Number} t The desired time to seek to
   * the server if the t (seconds) parameter specifies a time outside of the currently
   * buffered video data
   * @returns {Void} no return value
   */
  seekTo(pid, t) {
    var p = this.getInstance(pid);
    var ytId = this.getMetaProp(pid, 'ytId');
    var lastState = this.PLAYERSTATES[this.getMetaProp(pid, 'playerState')];
    var currentState = this.playerState(pid);

    if (this._existy(p)) {
      if (currentState === 'video cued') {
        switch (lastState) {
          case 'paused':
          case 'playing':
            /* falls through */
            p.cueVideoById(ytId, t);
            break;
          case 'video cued':
            if (pid === this._mainPlayerId) {
              //if we're in video cued and we are not restarting, e.g. seeking in the paused state
              //then we want to immediately pause after playback resumes.
              // (to get the correct frame of video visible)
              if (t > 0.1 && this.getMetaProp(pid, 'autoplay') === false) {
                //to ignore next play to not generate a false playing analytics
                this.registerStateChangeListener(this._seekPauseListener);
              }
              this._tryCommand(p, 'seekTo', t);
            } else {
              p.cueVideoById(ytId, t);
            }
            break;
        }
      } else {
        this._tryCommand(p, 'seekTo', t, true);
      }

    }
  }

  /**
   * @ngdoc method
   * @name #toggleMute
   * @methodOf iTT.service:youTubePlayerManager
   * @description
   * toggles the mute on / off
   * @param {String} pid the pid of the player
   * @returns {Void} returns void.
   */
  toggleMute(pid) {
    var p = this.getInstance(pid);
    if (p.isMuted()) {
      p.unMute();
      this.setMetaProp(pid, 'muted', false);
    } else {
      p.mute();
      this.setMetaProp(pid, 'muted', true);
    }
  }

  /**
   * @ngdoc method
   * @name #setVolume
   * @methodOf iTT.service:youTubePlayerManager
   * @description
   * Setter for volume level
   * @param {String} pid The ID of the YT instance
   * @param {Number} v Number between 1 and 100
   * @returns {Void} No return value.
   */
  setVolume(pid, v) {
    var p = this.getInstance(pid);

    if (this._existy(p)) {
      p.setVolume(v);
      this.setMetaProp(pid, 'volume', v);
    }
  }

  //private methods

  private _seekPauseListener(event) {
    if (event.state === 'playing') {
      this.unregisterStateChangeListener(this._seekPauseListener);
      this.pause(event.emitterId);
    }
  }

  /**
   * @ngdoc method
   * @name _reset
   * @methodOf iTT.service:youTubePlayerManager
   * @description
   * Used to _reset the player after detecting
   * onError event.
   * @params pid The id of the player
   * @returns {Void} no return value
   * @private
   */
  private _reset(pid) {
    var instance = this.getInstance(pid);
    var isMainPlayer = this.getMetaProp(pid, 'mainPlayer');

    if (this._existy(instance)) {
      console.log('debug info', instance.getDebugText());
      var videoId = instance.getVideoData().video_id;
      var lastTime = instance.getCurrentTime();

      if (isMainPlayer === true) {
        instance.cueVideoById(videoId, lastTime);
      } else {
        instance.loadVideoById(videoId, lastTime);
      }

    }
  }

  /**
   * @private
   * @ngdoc method
   * @methodOf iTT.service:youTubePlayerManager
   * @name _createInstance
   * @param {string} divId the unique ID of the element on the DOM
   * @param {string} videoID the youtube video ID
   * @param {Function} stateChangeCB callback to register to youtube's 'onStateChange' playerVar
   * @param {Function} qualityChangeCB callback to register to youtube's 'onQualityChange' playerVar
   * @param {Function} onReadyCB callback to register to youtube's 'onReady' playerVar
   * @param {Function} onError callback to register to youtube's 'onError' playerVar
   * @returns {Object} instance of YT.Player
   * @private
   */
  private _createInstance(divId, videoID, stateChangeCB, qualityChangeCB, onReadyCB, onError) {

    var _controls = 1;
    if (divId === this._mainPlayerId) {
      _controls = 0;
    }

    var host = this.$location.host();
    return this.YTScriptLoader.load().then( () => {
      return new YT.Player(divId, {
        videoId: videoID,
        //enablejsapi=1&controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&wmode=transparent
        playerVars: {
          'controls': _controls,
          'fs': _controls,
          'enablejsapi': 1,
          'modestbranding': 1,
          'showinfo': 0,
          'rel': 0,
          'iv_load_policy': 3,
          'origin': host,
          'wmode': 'transparent'
        },
        events: {
          onReady: (event) => onReadyCB(event, this),
          onStateChange: (event) => stateChangeCB(event, this),
          onPlaybackQualityChange: (event) => qualityChangeCB(event, this),
          onError: (event) => onError(event,this)
        }
      });
    });
  }

  private _existy(x) {
    return x != null;  // jshint ignore:line
  }

  /**
   * @private
   * @ngdoc method
   * @name _getPidFromInstance
   * @methodOf iTT.service:youTubePlayerManager
   * @description
   * Used to retrieve a PID from a YT Instance
   * @params {Object} ytInstance
   * @returns {String} PID of YT Instance
   */
  private _getPidFromInstance(ytInstance) {
    return ytInstance.getIframe().id;
  }

  /**
   * @private
   * @ngdoc method
   * @name _formatPlayerStateChange
   * @methodOf iTT.service:youTubePlayerManager
   * @param {Object} event youtube's state change event object. has target and data props.
   * @param {string} pid the PID of the player
   * @returns {Object} Object with emiiterId and state props
   * @private
   */
  private _formatPlayerStateChangeEvent(event, pid) {
    return {
      emitterId: pid,
      state: this.PLAYERSTATES[event.data]
    };
  }

  /**
   * @private
   * @ngdoc method
   * @name _emitStateChange
   * @methodOf iTT.service:youTubePlayerManager
   * @param {Function} playerStateChange callback to fire
   *@returns {Void} returns void 0.
   */
  private _emitStateChange(playerStateChange) {
    this.getStateChangeListeners().forEach( (cb) =>  {
      cb(playerStateChange);
    });
  }

  /**
   * @private
   * @ngdoc method
   * @name _getPlayerDiv
   * @methodOf iTT.service:youTubePlayerManager
   * @param {string } id of the player
   * @returns {string} HTML div with ID of player
   */
  private _getPlayerDiv(id) {
    return '<div id="' + id + '"></div>';
  }

  /**
   * @private
   * @ngdoc method
   * @name _tryCommand
   * @methodOf iTT.service:youTubePlayerManager
   * @param {Object} instance of YT.Player
   * @param {String} command string representation of method to invoke
   * @param {String | Number} val the val to set
   * @returns {Void |String | Number} returns void, or the getter value.
   */
  private _tryCommand(instance, command, val?, bool?) {
    var returnVal;
    try {
      if (this._existy(val) && this._existy(bool)) {
        instance[command](val, bool);
      } else if (this._existy(val)) {
        instance[command](val);
      } else {
        //some getters return a value, i.e. getPlayerState
        // console.log('hmm', instance, command);
        returnVal = instance[command]();
      }
    } catch (err) {
      console.warn('error trying', command, 'with', instance[command], 'full error:', err);
    }

    if (this._existy(returnVal)) {
      return returnVal;
    }
  }

  // return _youTubePlayerManager;

}
