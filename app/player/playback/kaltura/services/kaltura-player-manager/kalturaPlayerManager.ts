import { BasePlayerManager } from '../../../services/base-player-manager/basePlayerManager';
import { IMetaProps, IPlayerManager, IScriptLoader } from '../../../../../interfaces';
import { PlayerManagerCommons } from "../../../services/player-manager-commons/playerManagerCommons";
import { existy } from '../../../../../shared/services/ittUtils';

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

export class KalturaPlayerManager extends BasePlayerManager implements IKalturaPlayerManager {
  static Name = 'kalturaPlayerManager'; // tslint:disable-line
  static $inject = ['ittUtils', 'PLAYERSTATES', 'playerManagerCommons', 'kalturaScriptLoader', 'kalturaUrlService'];

  constructor (
    private ittUtils,
    private PLAYERSTATES,
    private playerManagerCommons,
    private kalturaScriptLoader,
    private kalturaUrlService) {
      super();

      /* Initialization */
      let cmp = this.getCommonMetaProps();
      angular.extend(this._kalturaMetaObj.meta, this._kalturaMetaProps, cmp);
    }

  private _players = {};
  private _mainPlayerId;
  type = 'kaltura';
  private _existy = this.ittUtils.existy;

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

  private ittTimeout = this.ittUtils.ngTimeout;
  private cancelIttTimeout = this.ittUtils.cancelNgTimeout;


  create(playerId) {

    var ktObj = this.getMetaProp(playerId, 'ktObj');
    var partnerId = ktObj.partnerId,
      entryId = ktObj.entryId,
      uiConfId = ktObj.uiconfId;

      this._createKWidget(playerId, partnerId, entryId, uiConfId, readyCallback)
      .then(_ => {
        // don't need to do anything in this case
      });

      const context = this;
      function readyCallback(playerId) {
        var kdp = document.getElementById(playerId);
        context.getPlayer(playerId).instance = kdp;
        context._attachEventListeners(kdp, playerId);
        kdp.npContext = context;
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
    this.setPlayer(id, KalturaPlayerManager.createMetaObj(newProps));
  }

  /*
   Event Bound functions
   */

  private onMediaReady(pid) {
    let context = this.npContext;
    context._emitStateChange(pid, 6);
    context.setMetaProp(pid, 'duration', this._kdpEval(pid, 'duration'));
   // context.setMetaProp(pid, 'ready', true);
  }

  private onPlaying(pid) {
    this.setMetaProp(pid, 'playerState', 1);
    if (this.getMetaProp(pid, 'ready') === true) {
      this._emitStateChange(pid);
    }
  }

  private onPaused(pid) {
    this.setMetaProp(pid, 'playerState', 2);
    this._emitStateChange(pid);
  }

  private onBufferEnd(ev) {
    var currentState = this.PLAYERSTATES[this.getMetaProp(this.id, 'playerState')];
    var isBuffering = this.getMetaProp(this.id, 'bufferTimeout');

    if (this._existy(isBuffering)) {
      this.cancelIttTimeout(isBuffering);
    }

    if (currentState === 'buffering') {
      this.play(this.id);
    }
  }

  private onBufferStart() {
    var pid = this.id;

    var isBuffering = this.ittTimeout( () => {
      console.log('stuck in buffer land', this.getMetaProp(pid, 'time'));
      this._reset(pid);
    }, 15 * 1000);

    this.setMetaProp(this.id, 'bufferTimeout', isBuffering);
    this.setMetaProp(this.id, 'playerState', 3);
    this._emitStateChange(this.id);
  }

  private onPlayerPlayEnd(pid) {
    console.log('playerState ended', this.getMetaProp(pid, 'playerState'));
    this.setMetaProp(pid, 'playerState', 0);
    this._emitStateChange(pid);
  }

  private onMediaError(e) {
    console.warn('PLAYER ERROR', e);
  }

  private onUpdatedPlaybackRate(e) {
    console.log('new rate', e);
  }

  private onPlayerUpdatePlayhead(ev) {
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
  private getInstance(pid: string): any {
    if (existy(this.getPlayer(pid)) && this.getMetaProp(pid, 'ready') === true) {
      return this.getPlayer(pid).instance;
    }
  }

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


    /// need to drag the context of this object around for readyCallback
    var kdp = document.getElementById(divId);
    kdp.npContext = this;
 
    return this.kalturaScriptLoader.load(partnerID, uiConfId).then(_ => {
      // load function creates the GLOBAL VARIABLE KWidget...
      KWidget.embed(embedObj);
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
    Object.keys(kMap).forEach( (evtName) => {
      ( (evtName) => {
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

    let context = this;
    this.getStateChangeListeners().forEach( (cb) => {
      cb(context._formatPlayerStateChangeEvent(state, pid));
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

