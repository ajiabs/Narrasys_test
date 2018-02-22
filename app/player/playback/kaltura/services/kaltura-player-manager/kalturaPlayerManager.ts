// @npUpgrade-kaltura-false
/**
 * Created by githop on 1/13/17.
 */

/***********************************
 **** Updated by Curve10 (JAB/EDD)
 **** Feb 2018
 ***********************************/

/**
 * @ngdoc service
 * @name iTT.service:kalturaPlayerManager
 * @description
 * Implements the PlayerManager interface, wraps kaltura videos
 * @property {String} type the type of playerManager
 * @requires playerManagerCommons
 * @requires kalturaScriptLoader
 * @requires kalturaUrlService
 * @requires PLAYERSTATES
 * @requires ittUtils
 */

 export interface IKalturaPlayerManager {
  create(playerId);
  seedPlayerManager(id, mainPlayer, mediaSrcArr);
  onMediaReady(pid);
  onPlaying(pid);
  onPaused(pid);
  onBufferEnd(ev);
  onBufferStart();
  onPlayerPlayEnd(pid);
  onMediaError(e);
  onUpdatedPlaybackRate(e);
  onPlayerUpdatePlayhead(ev);
  play(pid);
  pause(pid);
  seekTo(pid, t);
  stop(pid);
  getPlayerState(pid);
  getCurrentTime(pid);
  getBufferedPercent(pid);
  toggleMute(pid);
  setSpeed(pid, playbackRate);
  setVolume(pid, v);
  type:string;
 }

export class KalturaPlayerManager implements IKalturaPlayerManager {
  static Name = 'kalturaPlayerManager'; // tslint:disable-line
  static $inject = ['ittUtils', 'PLAYERSTATES', 'playerManagerCommons', 'kalturaScriptLoader', 'kalturaUrlService'];

  constructor (
    private ittUtils,
    private PLAYERSTATES,
    private playerManagerCommons,
    private kalturaScriptLoader,
    private kalturaUrlService) {
      /* Initialization */
      angular.extend(this._kalturaMetaObj.meta, this._kalturaMetaProps, this.commonMetaProps);
    }

  private _players = {};
  private _mainPlayerId;
  type = 'kaltura';
  private _existy = this.ittUtils.existy;

  private base = this.playerManagerCommons({players: this._players, type: this.type});
  private commonMetaProps = this.base.commonMetaProps;

  private _kalturaMetaProps = {
    ktObj: {},
    videoType: this.type,
    bufferTimeout: null,
    seekTimeout: null,
    lastVol: 100
  };

  private _kalturaMetaObj = {
    instance: null,
    meta: {}
  };

  private _validMetaKeys = Object.keys(this._kalturaMetaObj.meta);

  private predicate = function (pid) {
    return (this._existy(this.getPlayer(pid)) && this.getMetaProp(pid, 'ready') === true);
  };

  private kalturaEndingFn = function (pid) {
    //add logic if necessary
  };

  private getPlayer = this.base.getPlayer;
  private setPlayer = this.base.setPlayer;
  private getPlayerDiv = this.base.getPlayerDiv;
  private getInstance = this.base.getInstance(this.predicate);
  private createMetaObj = this.base.createMetaObj;
  private getMetaObj = this.base.getMetaObj;
  private getMetaProp = this.base.getMetaProp;
  private setMetaProp = this.base.setMetaProp(this._validMetaKeys);
  private registerStateChangeListener = this.base.registerStateChangeListener;
  private unregisterStateChangeListener = this.base.unregisterStateChangeListener;
  private pauseOtherPlayers = this.base.pauseOtherPlayers(this.pause, this.getPlayerState);
  private resetPlayerManager = this.base.resetPlayerManager(this._removeEventListeners);
  private renamePid = this.base.renamePid;
  private handleTimelineEnd = this.base.handleTimelineEnd(this.kalturaEndingFn);
  private ittTimeout = this.ittUtils.ngTimeout;
  private cancelIttTimeout = this.ittUtils.cancelNgTimeout;
  private _getStateChangeListeners = this.base.getStateChangeListeners;

  // return {
  //   type: type,
  //   getMetaProp: getMetaProp,
  //   setMetaProp: setMetaProp,
  //   getMetaObj: getMetaObj,
  //   getPlayerDiv: getPlayerDiv,
  //   pauseOtherPlayers: pauseOtherPlayers,
  //   registerStateChangeListener: registerStateChangeListener,
  //   unregisterStateChangeListener: unregisterStateChangeListener,
  //   resetPlayerManager: resetPlayerManager,
  //   renamePid: renamePid,
  //   seedPlayerManager: seedPlayerManager,
  //   create: create,
  //   getPlayerState: getPlayerState,
  //   play: play,
  //   pause: pause,
  //   seekTo: seekTo,
  //   getCurrentTime: getCurrentTime,
  //   getBufferedPercent: getBufferedPercent,
  //   toggleMute: toggleMute,
  //   setVolume: setVolume,
  //   setSpeed: setSpeed,
  //   freezeMetaProps: angular.noop,
  //   unFreezeMetaProps: angular.noop,
  //   stop: stop,
  //   handleTimelineEnd: handleTimelineEnd
  // };

  create(playerId) {

    var ktObj = this.getMetaProp(playerId, 'ktObj');
    var partnerId = ktObj.partnerId,
      entryId = ktObj.entryId,
      uiConfId = ktObj.uiconfId;

      this._createKWidget(playerId, partnerId, entryId, uiConfId, readyCallback)
      .then(handleSuccess);


    function handleSuccess() {
      // noop
    }

    function readyCallback(playerId) {
      var kdp = document.getElementById(playerId);
      this.getPlayer(playerId).instance = kdp;
      this._attachEventListeners(kdp, playerId);
    }

  }

  seedPlayerManager(id, mainPlayer, mediaSrcArr) {
    if (this._existy(this.getPlayer(id)) && this.getMetaProp(id, 'startAtTime') > 0) {
      return;
    }

    if (mainPlayer) {
      this._players = {};
      this._mainPlayerId = id;
    }
    var ktObj = this.kalturaUrlService.getKalturaObject(mediaSrcArr[0]);
    var newProps = {
      mainPlayer: mainPlayer,
      div: this._getPlayerDiv(id),
      ktObj: ktObj
    };
    this.setPlayer(id, this.createMetaObj(newProps, this._kalturaMetaObj));
  }

  /*
   Event Bound functions
   */

  onMediaReady(pid) {
    this._emitStateChange(pid, 6);
    this.setMetaProp(pid, 'duration', this._kdpEval(pid, 'duration'));
  }

  onPlaying(pid) {
    this.setMetaProp(pid, 'playerState', 1);
    if (this.getMetaProp(pid, 'ready') === true) {
      this._emitStateChange(pid);
    }
  }

  onPaused(pid) {
    this.setMetaProp(pid, 'playerState', 2);
    this._emitStateChange(pid);
  }

  onBufferEnd(ev) {
    var currentState = this.PLAYERSTATES[this.getMetaProp(this.id, 'playerState')];
    var isBuffering = this.getMetaProp(this.id, 'bufferTimeout');

    if (this._existy(isBuffering)) {
      this.cancelIttTimeout(isBuffering);
    }

    if (currentState === 'buffering') {
      this.play(this.id);
    }
  }

  onBufferStart() {
    var pid = this.id;

    var isBuffering = this.ittTimeout(function () {
      console.log('stuck in buffer land', this.getMetaProp(pid, 'time'));
      this._reset(pid);
    }, 15 * 1000);

    this.setMetaProp(this.id, 'bufferTimeout', isBuffering);
    this.setMetaProp(this.id, 'playerState', 3);
    this._emitStateChange(this.id);
  }

  onPlayerPlayEnd(pid) {
    console.log('playerState ended', this.getMetaProp(pid, 'playerState'));
    this.setMetaProp(pid, 'playerState', 0);
    this._emitStateChange(pid);
  }

  onMediaError(e) {
    console.warn('PLAYER ERROR', e);
  }

  onUpdatedPlaybackRate(e) {
    console.log('new rate', e);
  }

  onPlayerUpdatePlayhead(ev) {
    this.setMetaProp(this.id, 'time', ev);
  }

  /*
   Public Methods
   */
  play(pid) {
    this._sendKdpNotice(pid, 'doPlay');
  }

  pause(pid) {
    this._sendKdpNotice(pid, 'doPause');
  }

  seekTo(pid, t) {
    if (t > 60 && t % 10 === 0) { //certain startAtTime values seem to lock the player up in chrome
      t -= 0.5;
    }
    this._sendKdpNotice(pid, 'doSeek', t);
  }

  stop(pid) {
    this._sendKdpNotice(pid, 'doStop');
  }

  getPlayerState(pid) {
    return this.PLAYERSTATES[this.getMetaProp(pid, 'playerState')];
  }

  getCurrentTime(pid) {
    return this._kdpEval(pid, 'video.player.currentTime') || 0;
  }

  getBufferedPercent(pid) {
    if (this.getMetaProp(pid, 'ready') === true) {
      return this._kdpEval(pid, 'video.buffer.percent') * 100;
    }
  }

  toggleMute(pid) {
    var isMuted = this.getMetaProp(pid, 'muted');

    if (isMuted === false) {
      this.setMetaProp(pid, 'lastVol', this.getMetaProp(pid, 'volume'));
      this.setVolume(pid, 0);
    } else {
      this.setVolume(pid, this.getMetaProp(pid, 'lastVol'));
    }

    this.setMetaProp(pid, 'muted', !isMuted);
  }

  setSpeed(pid, playbackRate) {
    console.log('setting speed to', playbackRate);
    this._sendKdpNotice(pid, 'playbackRateChangeSpeed', playbackRate);
  }

  setVolume(pid, v) {
    this._sendKdpNotice(pid, 'changeVolume', v / 100);
    this.setMetaProp(pid, 'volume', v);
  }

  /*
   Private methods
   */
  private _reset(pid, t?) {
    var currentTime = t || this.getMetaProp(pid, 'time');
    //changeMedia will emit a 'onMediaReady' event after the media has been successfully changed
    //when handling the 'onMediaReady' event, the playbackService will seek to the startAtTime
    console.log('about to reset to t=', currentTime);
    this.setMetaProp(pid, 'startAtTime', currentTime);
    this.setMetaProp(pid, 'hasResumedFromStartAt', false);
    this.setMetaProp(pid, 'resetInProgress', true);
    var entryId = this.getMetaProp(pid, 'ktObj').entryId;
    this._sendKdpNotice(pid, 'changeMedia', {'entryId': entryId});
    this.setMetaProp(pid, 'ready', false);
  }

  private _sendKdpNotice(pid, notice, val?) {
    var kdp = this.getInstance(pid);

    try {
      if (this._existy(val)) {
        kdp.sendNotification(notice, val);
      } else {
        kdp.sendNotification(notice);
      }
    } catch (e) {
      console.log('error sending', notice);
    }
  }

  private _createKWidget(divId, partnerID, entryID, uiConfId, onReadyCB) {

    var embedObj = {
      'targetId': divId,
      'wid': '_' + partnerID,
      'uiconf_id': uiConfId,
      'readyCallback': onReadyCB,
      'entry_id': entryID,
      'flashvars': {
        'playbackRateSelector.plugin': true,
        'controlBarContainer.plugin': false,
        'largePlayBtn.plugin': false,
        'loadingSpinner.plugin': true,
        'closedCaptions.displayCaptions': false
      }
    };

    var embedControls = {
      'EmbedPlayer.NativeControls': true,
      'EmbedPlayer.DisableHTML5FlashFallback': true
    };

    if (divId !== this._mainPlayerId) {
      angular.extend(embedObj.flashvars, embedControls);
    }

    return this.kalturaScriptLoader.load(partnerID, uiConfId).then(function () {
      this.KWidget.embed(embedObj);
    });
  }

  private _getPlayerDiv(id) {
    return '<div id="' + id + '"></div>';
  }

  private _attachEventListeners(kdp, pid) {
    var kMap = {
      'playerPlayed': this.onPlaying,
      'playerPaused': this.onPaused,
      'bufferStartEvent': this.onBufferStart,
      'bufferEndEvent': this.onBufferEnd,
      'playerPlayEnd': this.onPlayerPlayEnd,
      'mediaError': this.onMediaError,
      'mediaReady': this.onMediaReady,
      'updatedPlaybackRate': this.onUpdatedPlaybackRate,
      'playerUpdatePlayhead': this.onPlayerUpdatePlayhead
    };
    Object.keys(kMap).forEach(function (evtName) {
      (function (evtName) {
        kdp.kBind(evtName + '.' + pid, kMap[evtName]);
      })(evtName);
    });
  }

  private _removeEventListeners(pid) {
    var kdp = this.getInstance(pid);
    kdp.kUnbind('.' + pid);
  }

  private _emitStateChange(pid, forceState?) {
    var state;

    if (forceState) {
      state = forceState;
    } else {
      state = this.getMetaProp(pid, 'playerState');
    }

    this._getStateChangeListeners().forEach(function (cb) {
      cb(this._formatPlayerStateChangeEvent(state, pid));
    });
  }

  private _kdpEval(pid, prop) {
    var instance = this.getInstance(pid);
    if (this._existy(instance)) {
      return instance.evaluate('{' + prop + '}');
    }
  }

  private _formatPlayerStateChangeEvent(state, pid) {
    return {
      emitterId: pid,
      state: this.PLAYERSTATES[state]
    };
  }

}

