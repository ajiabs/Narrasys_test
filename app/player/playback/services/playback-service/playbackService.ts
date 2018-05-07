// @npUpgrade-playback-false
/**
 * Created by githop on 10/24/16.
 */

//
// ** Updated by Curve10 (JAB/EDD)
//    Feb 2018
//

import { IPlayerManager, IUrlService, IWistiaPlayerManager } from '../../../../interfaces';

/**
 * @ngdoc service
 * @name iTT.service:playbackService
 * @description
 * playbackService exports an interface for the timelineSvc and consumes the interfaces exported from
 * the playerManagers. The exported methods of the playbackService are called by timelineSvc or ittVideo directive.
 *
 * Videos in the app (either the main video or embeds) are kept track of using the db record _id. See the this._players
 * object in the playerManagers for an example.
 *
 * Most of the exported playback methods (seek, play, pause...etc) accept an optional playerId param. If
 * left blank the playerId will be set to the id of the episode.masterAsset, aka the main video. This case is used
 * in mostly the timlineSvc, (as it syncs the main video with our episode events) and to query state of video
 * playback in the UI.
 * ```
 *  //no input parameter, will command main video.
 *  //sending a command
 *  playbackService.playVideo()
 *  //querying playback state
 *  playbackService.getMetaprop('duration');
 * ```
 * @requires $interval
 * @requires iTT.service:youTubePlayerManager
 * @requires iTT.service:html5PlayerManager
 * @requires iTT.service:ittUtils
 * @requires iTT.service:urlService
 * @requires PLAYERSTATES_WORD
 * @requires PLAYERSTATES
 */

export interface IPlaybackServices {
  handleTimelineEnd(pid: string),
  seedPlayer(mediaSrcArr, id:string, mainPlayera:boolean),
  createInstance(playerId: string),
  play( playerId: string),
  pause( playerId: string),
  seek ( time:number, playerId:string),
  allowPlayback(state:string),
  togglePlayback(pid:string, restartFn, analyticsFn?),
  pauseOtherPlayers( playerId: string),
  registerStateChangeListener(cb),
  unregisterStateChangeListener(cb),
  getCurrentTime(playerId: string),
  getPlayerDiv(playerId: string),
  getPlayerState(playerId: string),
  setSpeed(rate:number, playerId: string),
  setVolume(volume:number, playderId: string),
  getMetaProp( prop:string, id: string),
  setMetaProp( prop: string, val: string, id: string),
  getTimelineState():string,
  freezeMetaProps(playerId: string),
  unFreezeMetaProps(playerId: string),
  resetPlaybackService(),
  handle$Destroy(playerId: string),
  stop(playerId: string),
  renamePid(oldName: string, newName: string),

}

export class PlaybackServices implements IPlaybackServices {
  static Name = 'playbackService';
  static $inject = [
    '$interval',
    'youTubePlayerManager',
    'html5PlayerManager',
    'kalturaPlayerManager',
    'wistiaPlayerManager',
    'ittUtils',
    'urlService',
    'PLAYERSTATES_WORD',
    'PLAYERSTATES'
  ];


  constructor(
    private $interval,
    private youTubePlayerManager,
    private html5PlayerManager,
    private kalturaPlayerManager,
    private wistiaPlayerManager: IWistiaPlayerManager,
    private ittUtils,
    private urlService: IUrlService,
    private PLAYERSTATES_WORD,
    private PLAYERSTATES) {
    this._init();
  }

  // ******************************** initialization for the constructor ******************************* //
  private _init() {
  
    angular.forEach(this._playerManagers,  (playerManager: IPlayerManager) => {
      playerManager.registerStateChangeListener( (stateChangeEvent) => {
        this._stateChangeCB(stateChangeEvent)
      })
    });
  }


  // ********************************** private variables ********************************************** //
  private _playerInterfaces: { [id: string]: IPlayerManager } = {};
  private _mainPlayerId;
  private _stateChangeCallbacks = [];
  private _playerManagers: IPlayerManager[] = [
    this.html5PlayerManager, this.youTubePlayerManager, this.kalturaPlayerManager, this.wistiaPlayerManager
  ];
  private _timelineState = '';
  private _mainPlayerBufferingPoll;
  private _playbackServiceHasBeenReset;
  private _existy = this.ittUtils.existy;


  // **************************************  PUBLIC METHODS *************************** //

  /**
   * @ngdoc method
   * @name #handleTimelineEnd
   * @methodOf iTT.service:playbackService
   * @description
   * Used to allow flexibility between player managers when it comes to reaching the end of the timeline.
   * @param {String} pid the pid of the player
   * @returns {Void} returns void.
   */
  handleTimelineEnd(pid) {
    pid = this._setPid(pid);
    if (this._existy(this._playerInterfaces[pid])) {
      this._playerInterfaces[pid].handleTimelineEnd(pid);
    }
  }

  /**
   * @ngdoc method
   * @name #seedPlayer
   * @methodOf iTT.service:playbackService
   * @description
   * Called from ittVideo during initialization. Used to store and setup particular data relevant to creating
   * an instance of playerManager.
   * @param {String} id Main Video Asset ID or Event ID, for embeds
   * @param {Boolean} mainPlayer Determines type of player, embed or main
   * @param {Array} mediaSrcArr array of youtube URLs
   * @returns {Void} returns void.
   */
  seedPlayer(mediaSrcArr, id, mainPlayer) {
    if (mainPlayer === true) {
      if (this._existy(this._playerInterfaces[id])) {
        //bail if we have already set the main player.
        return;
      }
    }
    var parsedMedia = this.urlService.parseMediaSrcArr(mediaSrcArr);

    var pm = this._getPlayerManagerFromMediaSrc(parsedMedia);
    this._playerInterfaces[id] = pm;
    this._playbackServiceHasBeenReset = false;
    if (mainPlayer) {
      this._mainPlayerId = id;

      if( !pm) {
        return; // error, no pm loaded
      }
      if ( pm.type !== 'wistia') { // wistia doesn't provide any buffering info currently.
        this._pollBufferedPercent();
      }

    }

    pm.seedPlayerManager(id, mainPlayer, parsedMedia[0].mediaSrcArr);
  }

  /**
   * @ngdoc method
   * @name #createInstance
   * @methodOf iTT.service:playbackService
   * @description
   * Invokes the 'create' method on the playerManager with the input id, stores the entry in the
   * this._playerInterfaces map.
   * @param {String} [playerId=mainPlayerId] Optional input param.
   */
  createInstance(playerId) {
    this._playerInterfaces[playerId].create(playerId);
  }

  //called from timlineSvc -> playbackService -> playerManager
  /**
   * @ngdoc method
   * @name #play
   * @methodOf iTT.service:playbackService
   * @description
   * Invokes the 'play' method on the playerManager with the passed input id.
   * @param {String} [playerId=mainPlayerId] Optional input param.
   */
  play(playerId) {
  
    angular.forEach(this._playerManagers,  (pm) => {
      pm.pauseOtherPlayers(this._setPid(playerId));
    });

    if (this.getMetaProp('ready', this._setPid(playerId)) === true) {
      this._playerInterfaces[this._setPid(playerId)].play(this._setPid(playerId));
    }
  }

  /**
   * @ngdoc method
   * @name #pause
   * @methodOf iTT.service:playbackService
   * @description
   * Invokes the 'pause' method on the playerManager with the passed input id.
   * @param {String} [playerId=mainPlayerId] Optional input param.
   */
  pause(playerId) {
    if (this.getMetaProp('ready', this._setPid(playerId)) === true) {
      this._playerInterfaces[this._setPid(playerId)].pause(this._setPid(playerId));
    }
  }

  /**
   * @ngdoc method
   * @name #seek
   * @methodOf iTT.service:playbackService
   * @description
   * Invokes the 'seek' method on the playerManager with the passed input id.
   * @param {Number} t time to seek playback to.
   * @param {String} [playerId=mainPlayerId] Optional input param.
   */
  seek(t, playerId) {
    if (this.getMetaProp('ready', this._setPid(playerId)) === true) {
      this._playerInterfaces[this._setPid(playerId)].seekTo(this._setPid(playerId), parseFloat(t));
    }
  }

  /**
   * @ngdoc method
   * @name #allowPlayback
   * @methodOf iTT.service:playbackService
   * @description
   * static method used check playback state prior to toggling between play or pause
   * @param {String} state state to check against.
   */
  allowPlayback(state) {
    return (state === 'paused' ||
      state === 'unstarted' ||
      state === 'video cued' ||
      state === 'ended' ||
      state === 'player ready');
  }

  /**
   * @ngdoc method
   * @name #togglePlayback
   * @methodOf iTT.service:playbackService
   * @description
   * static method which is bound to play/pause buttons / video mask.
   * @param {String} pid id of the player to drive
   * @param {Function} restartFn function to call when restarting.
   */
  togglePlayback(pid, restartFn, analyticsFn?) {
    pid = this._setPid(pid);
    var state = this.getPlayerState(pid);
    var time = this.getMetaProp('time', pid);
    var duration = this.getMetaProp('duration', pid);

    if (time >= duration && pid === this._mainPlayerId) {
      return restartFn();
    }

    if (this.allowPlayback(state) === true) {
      this.play(pid);
    } else {
      this.pause(pid);
      analyticsFn('pause');
    }
  }

  /**
   * @ngdoc method
   * @name #pauseOtherPlayers
   * @methodOf iTT.service:playbackService
   * @description
   * Invokes the 'pauseOtherPlayers' method on all playerManagers with the passed input id.
   * @param {String} [playerId=mainPlayerId] Optional input param.
   */
  pauseOtherPlayers(playerId) {


    angular.forEach(this._playerManagers,  (pm) => {
      pm.pauseOtherPlayers(this._setPid(playerId));
    });

    //on emebds, be sure to set the playerState to paused if the $destroy event pre-empts pause from being
    //set naturally
    angular.forEach(this._playerInterfaces,  (pi: IWistiaPlayerManager, pid) =>{
      if (pid !== playerId && pid !== this._mainPlayerId) {
        pi.setMetaProp(pid, 'playerState', '2');
      }
    });
  }

  /**
   * @ngdoc method
   * @name #registerStateChangeListener
   * @methodOf iTT.service:playbackService
   * @description
   * Wires up a stateChangeListener to which events can be emitted from and responded to.
   * @param {Function} cb the function to invoke when on a state change.
   */
  registerStateChangeListener(cb) {
    var len = this._stateChangeCallbacks.length;

    //do not register the same listener twice
    while (len--) {
      if (cb.toString() === this._stateChangeCallbacks[len].toString()) {
        return;
      }
    }

    this._stateChangeCallbacks.push(cb);
  }

  /**
   * @ngdoc method
   * @name #unregisterStateChangeListener
   * @methodOf iTT.service:playbackService
   * @description
   * removes a stateChangeListener function from the array of listeners.
   * @param {Function} cb the function to remove.
   */
  unregisterStateChangeListener(cb) {
    this._stateChangeCallbacks = this._stateChangeCallbacks.filter(function (fn) {
      return fn.toString() !== cb.toString();
    });
  }

  /**
   * @ngdoc method
   * @name #getCurrentTime
   * @methodOf iTT.service:playbackService
   * @description
   * Invokes the 'getCurrentTime' method on all playerManagers with the passed input id.
   * @param {String} [playerId=mainPlayerId] Optional input param.
   */
  getCurrentTime(playerId) {
    if (this._existy(this._playerInterfaces[this._setPid(playerId)])) {
      return this._playerInterfaces[this._setPid(playerId)].getCurrentTime(this._setPid(playerId));
    }
  }

  /**
   * @ngdoc method
   * @name #getPlayerDiv
   * @methodOf iTT.service:playbackService
   * @description
   * Invokes the 'getPlayerDiv' method on all playerManagers with the passed input id.
   * @param {String} [playerId=mainPlayerId] Optional input param.
   */
  getPlayerDiv(playerId) {
    return this._playerInterfaces[this._setPid(playerId)].getPlayerDiv(this._setPid(playerId));
  }

  /**
   * @ngdoc method
   * @name #getPlayerState
   * @methodOf iTT.service:playbackService
   * @description
   * Invokes the 'getPlayerState' method on all playerManagers with the passed input id.
   * @param {String} [playerId=mainPlayerId] Optional input param.
   */
  getPlayerState(playerId) {
    return this._playerInterfaces[this._setPid(playerId)].getPlayerState(this._setPid(playerId));
  }

  /**
   * @ngdoc method
   * @name #setSpeed
   * @methodOf iTT.service:playbackService
   * @description
   * Invokes the 'setSpeed' method on all playerManagers with the passed input id.
   * @param {Number} playbackRate rate to set playback speed to.
   * @param {String} [playerId=mainPlayerId] Optional input param.
   */
  setSpeed(playbackRate, playerId) {
    return this._playerInterfaces[this._setPid(playerId)].setSpeed(this._setPid(playerId), playbackRate);
  }

  /**
   * @ngdoc method
   * @name #toggleMute
   * @methodOf iTT.service:playbackService
   * @description
   * Invokes the 'toggleMute' method on all playerManagers with the passed input id.
   * @param {String} [playerId=mainPlayerId] Optional input param.
   */
  toggleMute(playerId) {
    return this._playerInterfaces[this._setPid(playerId)].toggleMute(this._setPid(playerId));
  }

  /**
   * @ngdoc method
   * @name #setVolume
   * @methodOf iTT.service:playbackService
   * @description
   * Invokes the 'setVolume' method on all playerManagers with the passed input id.
   * @param {Number} vol the volume level to set.
   * @param {String} [playerId=mainPlayerId] Optional input param.
   */
  setVolume(vol, playerId) {
    this._playerInterfaces[this._setPid(playerId)].setVolume(this._setPid(playerId), vol);
  }

  /**
   * @ngdoc method
   * @name #getMetaProp
   * @methodOf iTT.service:playbackService
   * @description
   * Used to query a property of a playerManager meta Object, such as 'duration'.
   * @param {String} prop the name of the property to query.
   * @param {String} [id=mainPlayerId] Optional id.
   * @returns {String|Number|Boolean|Void} returns the value of the prop specified
   */
  getMetaProp(prop, id) {
    var pid = this._setPid(id);
    if (this._existy(this._playerInterfaces[pid])) {
      return this._playerInterfaces[pid].getMetaProp(pid, prop);
    }
  }

  /**
   * @ngdoc method
   * @name #setMetaProp
   * @methodOf iTT.service:playbackService
   * @description
   * Used to set a property on a playerManager instance's meta Object.
   * @param {String} prop the name of the property to query.
   * @param {String|Number|Boolean} val The value to set.
   * @param {String} [id=mainPlayerId] Optional id.
   * @returns {Void} no return value but does have side-effects.
   */
  setMetaProp(prop, val, id) {
    var pid = this._setPid(id);
    if (this._existy(this._playerInterfaces[pid])) {
      this._playerInterfaces[pid].setMetaProp(pid, prop, val);
    }
  }

  /**
   * @ngdoc method
   * @name #getTimelineState
   * @methodOf iTT.service:playbackService
   * @description
   * Used to query the state of the timeline.
   * @returns {String} the state of the timeline.
   */
  getTimelineState() {
    return this._timelineState;
  }

  /**
   * @ngdoc method
   * @name #setTimelineState
   * @methodOf iTT.service:playbackService
   * @description
   * Used set the state of the timeline.
   * @param {String} state the timelineState to set
   * @returns {Void} no return val but has side-effects.
   */
  setTimelineState(state) {
    this._timelineState = state;
  }

  /**
   * @ngdoc method
   * @name #freezeMetaProps
   * @methodOf iTT.service:playbackService
   * @description
   * Invokes the 'freezeMetaProps' method on all playerManagers with the passed input id.
   * @param {String} [playerId=mainPlayerId] Optional input param.
   */
  freezeMetaProps(playerId) {
    this._playerInterfaces[this._setPid(playerId)].freezeMetaProps(this._setPid(playerId));
  }

  /**
   * @ngdoc method
   * @name #unFreezeMetaProps
   * @methodOf iTT.service:playbackService
   * @description
   * Invokes the 'unFreezeMetaProps' method on all playerManagers with the passed input id.
   * @param {String} [playerId=mainPlayerId] Optional input param.
   */
  unFreezeMetaProps(playerId) {
    this._playerInterfaces[this._setPid(playerId)].unFreezeMetaProps(this._setPid(playerId));
  }

  // function getMetaObj(playerId) {
  //   if (this._existy(this._playerInterfaces[this._setPid(playerId)])) {
  //     return this._playerInterfaces[this._setPid(playerId)].getMetaObj(this._setPid(playerId));
  //   }
  // }

  /**
   * @ngdoc method
   * @name #resetPlaybackService
   * @methodOf iTT.service:playbackService
   * @description
   * used when the playbackService needs to be reset back to mostly default state. This is eventually called when
   * the main video fires its $destory event
   */
  resetPlaybackService() {
    this._playbackServiceHasBeenReset = true;
    this._playerInterfaces = {};
    angular.forEach(this._playerManagers, function (pm) {
      pm.resetPlayerManager();
    });
    this._mainPlayerId = '';
    this._timelineState = '';
    this.$interval.cancel(this._mainPlayerBufferingPoll);
  }

  /**
   * @ngdoc method
   * @name #handle$Destroy
   * @methodOf iTT.service:playbackService
   * @description
   * Handles clean up for either main player of embeds. called from ittVideo's $destroy event.
   * @param {String} playerId unique id of the player to command
   */
  handle$Destroy(playerId) {
    if (playerId !== this._mainPlayerId) {
      if (this._playbackServiceHasBeenReset === false) {
        this._handleEmbedDestroy(playerId);
      }
    } else {
      //will call resetPlaybackService from timelineSvc
      this._emitStateChange('reset');
    }
  }

  /**
   * @ngdoc method
   * @name #stop
   * @methodOf iTT.service:playbackService
   * @description
   * for calling stop for youtube videos
   * @param {String} playerId unique id of the player to command
   */
  stop(playerId) {
    this._playerInterfaces[this._setPid(playerId)].stop(this._setPid(playerId));
  }

  /**
   * @ngdoc method
   * @name renamePid
   * @methodOf iTT.service:playbackService
   * @param {String} oldName the name to find and replace
   * @param {String} newName the target name
   * @returns {Void} no return value
   */
  renamePid(oldName, newName) {
    //rename player manager
    if (this._existy(this._playerInterfaces[oldName])) {
      this._playerInterfaces[oldName].renamePid(oldName, newName);
    }
    //check if main player is being renamed.
    if (oldName === this._mainPlayerId) {
      this._mainPlayerId = newName;
    }
    //rename this._playerInterface that calls player managers
    this.ittUtils.renameKey(oldName, newName, this._playerInterfaces);
  }

  // ***********************************  PRIVATE METHODS ************************************* //

  /**
   * @ngdoc method
   * @name getBufferedPercent
   * @methodOf iTT.service:playbackService
   * @description
   * for drawing the amount of video that has buffered in the timeline.
   * @param {String} playerId unique id of the player to command
   * @private
   */
  private  _getBufferedPercent(pid) {
    pid = this._setPid(pid);
    return this._playerInterfaces[pid].getBufferedPercent(pid);
  }

  /**
   * @ngdoc method
   * @name _handleEmbedDestroy
   * @methodOf iTT.service:playbackService
   * @description
   * _handleEmbedDestroy
   * @param {String} [playerId=mainPlayerId] Optional input param.
   * @private
   */
  private _handleEmbedDestroy(playerId) {
    this.setMetaProp('startAtTime', this.getCurrentTime(playerId), playerId);
    this.setMetaProp('hasResumedFromStartAt', false, playerId);
    this.setMetaProp('ready', false, playerId);
    this.freezeMetaProps(playerId);
  }

  /**
   * @ngdoc method
   * @name _setPid
   * @methodOf iTT.service:playbackService
   * @description
   * Helper method used to set the playerId to either the input ID or the mainPlayerId if left blank.
   * @param {String} pid the ID of the player to use.
   * @returns {String} Either the input ID or the this._mainPlayerId
   * @private
   */
  private _setPid(pid) {
    if (this._existy(pid)) {
      return pid;
    }
    return this._mainPlayerId;
  }

  /**
   * @ngdoc method
   * @name _emitStateChange
   * @methodOf iTT.service:playbackService
   * @description
   * Helper method used to to emit stateChanges upstream to the timelineSvc (or anywhere else that has registered
   * a listener)
   * @param {String} state State to emit.
   * @private
   */
  private _emitStateChange(state) {
    angular.forEach(this._stateChangeCallbacks, function (cb) {
      cb(state);
    });
  }

  /**
   * @ngdoc method
   * @name _onPlayerReady
   * @methodOf iTT.service:playbackService
   * @description
   * Method that handles the 'onReady' event fired from a playerManager when the player is ready to accept
   * commands. Will seek playback to 'startAt' time which is set from either a query string parameter (for the
   * main video) or is saved on the ittVideo $destory event, for embeds. If the video was playing prior to being
   * destroyed, it will resume playback.
   * @param {String} pid playerId of player emitting 'onReady' event.
   * @private
   */
  private _onPlayerReady(pid) {
    var lastState = this.PLAYERSTATES[this.getMetaProp('playerState', pid)];
    var startAt = this.getMetaProp('startAtTime', pid);
    var hasResumed = this.getMetaProp('hasResumedFromStartAt', pid);
    var isBeingReset = this.getMetaProp('resetInProgress', pid);
    this.setMetaProp('ready', true, pid);

    if (pid === this._mainPlayerId && isBeingReset === false) {
      this.setMetaProp('playerState', '5', pid);
      this._emitStateChange('video cued');
    }

    if (startAt === 0 && this.getMetaProp('autoplay', pid) === true) {
      this.play(pid);
      this.setMetaProp('autoplay', false, pid);
    }

    if (startAt > 0) {
      if (hasResumed === false) {
        this.seek(startAt, pid);

        if (isBeingReset === true) {
          this.play(pid);
          this.setMetaProp('resetInProgress', false, pid);
          return;
        }

        if (this.getMetaProp('autoplay', pid) === true) {
          this.play(pid);
          this.setMetaProp('autoplay', false, pid);
        }

        if (pid !== this._mainPlayerId) {
          this.setMetaProp('hasResumedFromStartAt', true, pid);
          if (lastState === 'playing') {
            this.play(pid);
          }
        }
      }
    }
  }
  //respond to events emitted from playerManager
  //playerManager -> playbackSvc -> timelineSvc (if main)
  /**
   * @ngdoc method
   * @name this._stateChangeCB
   * @methodOf iTT.service:playbackService
   * @description
   * Switch statement that handles events emitted from playerManagers and will emit the event up to the
   * timelineSvc if the event came from the mainVideo.
   * @param {Object} stateChangeEvent Object with state and emitterId properties.
   * @returns {Void} returns void but has side-effects.
   * @private
   */
  private _stateChangeCB(stateChangeEvent) {
    var state = stateChangeEvent.state;
    var emitterId = stateChangeEvent.emitterId;
    // console.log('pbs#stateChangeCB', state);
    switch (state) {
      case 'unstarted':
        break;
      case 'ended':
        break;
      case 'playing':
        if (this.getMetaProp('hasBeenPlayed', emitterId) === false) {
          this.setMetaProp('hasBeenPlayed', true, emitterId);
        }
        break;
      case 'paused':
        break;
      case 'buffering':
        break;
      case 'video cued':
        break;
      case 'player ready':
        this._onPlayerReady(emitterId);
        break;

    }

    if (state !== 'player ready') {
      this.setMetaProp('playerState', this.PLAYERSTATES_WORD[state], emitterId);
    }

    if (emitterId === this._mainPlayerId) {
      this._emitStateChange(state);
    }
  }

  /**
   * @ngdoc method
   * @name this._stateChangeCB
   * @methodOf iTT.service:playbackService
   * @description
   * queries the bufferedPercent meta object prop on a 200ms interval
   * @returns {Number} returns the percent of buffering for the main video
   * @private
   */
  private _pollBufferedPercent() {
  
    this._mainPlayerBufferingPoll = this.$interval( () => {
      this.setMetaProp('bufferedPercent', this._getBufferedPercent(this._mainPlayerId), this._mainPlayerId);
    }, 200);
  }

  /**
   * @ngdoc method
   * @name _getPlayerManagerFromMediaSrc
   * @methodOf iTT.service:playbackService
   * @description
   * Loops over the input mediaSrcArr to derive the playerManager that can handle the input parsedMediaSrcArr
   * @returns {Object} returns the playerManager that can handle the input media
   * @private
   */
  private _getPlayerManagerFromMediaSrc(parsedMediaSrc): IPlayerManager {
    var len = this._playerManagers.length, pm = null;
    while (len--) {
      if (parsedMediaSrc.length > 0 && this._playerManagers[len].type === parsedMediaSrc[0].type) {
        pm = this._playerManagers[len];
        break;
      }
    }
    return pm;
  }
}
