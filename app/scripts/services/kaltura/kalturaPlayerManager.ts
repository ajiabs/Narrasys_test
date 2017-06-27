/**
 * Created by githop on 1/13/17.
 */
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


kalturaPlayerManager.$inject = ['ittUtils', 'PLAYERSTATES', 'playerManagerCommons', 'kalturaScriptLoader', 'kalturaUrlService'];

export default function kalturaPlayerManager(ittUtils, PLAYERSTATES, playerManagerCommons, kalturaScriptLoader, kalturaUrlService) {
  var _players = {};
  var _mainPlayerId;
  var _type = 'kaltura';
  var _existy = ittUtils.existy;

  var base = playerManagerCommons({players: _players, type: _type});
  var commonMetaProps = base.commonMetaProps;

  var _kalturaMetaProps = {
    ktObj: {},
    videoType: _type,
    bufferTimeout: null,
    seekTimeout: null,
    lastVol: 100
  };

  var _kalturaMetaObj = {
    instance: null,
    meta: {}
  };

  angular.extend(_kalturaMetaObj.meta, _kalturaMetaProps, commonMetaProps);
  var _validMetaKeys = Object.keys(_kalturaMetaObj.meta);

  var predicate = function (pid) {
    return (_existy(getPlayer(pid)) && getMetaProp(pid, 'ready') === true);
  };

  var kalturaEndingFn = function (pid) {
    //add logic if necessary
  };

  var getPlayer = base.getPlayer;
  var setPlayer = base.setPlayer;
  var getPlayerDiv = base.getPlayerDiv;
  var getInstance = base.getInstance(predicate);
  var createMetaObj = base.createMetaObj;
  var getMetaObj = base.getMetaObj;
  var getMetaProp = base.getMetaProp;
  var setMetaProp = base.setMetaProp(_validMetaKeys);
  var registerStateChangeListener = base.registerStateChangeListener;
  var unregisterStateChangeListener = base.unregisterStateChangeListener;
  var pauseOtherPlayers = base.pauseOtherPlayers(pause, getPlayerState);
  var resetPlayerManager = base.resetPlayerManager(_removeEventListeners);
  var renamePid = base.renamePid;
  var handleTimelineEnd = base.handleTimelineEnd(kalturaEndingFn);
  var ittTimeout = ittUtils.ngTimeout;
  var cancelIttTimeout = ittUtils.cancelNgTimeout;
  var _getStateChangeListeners = base.getStateChangeListeners;

  return {
    type: _type,
    getMetaProp: getMetaProp,
    setMetaProp: setMetaProp,
    getMetaObj: getMetaObj,
    getPlayerDiv: getPlayerDiv,
    pauseOtherPlayers: pauseOtherPlayers,
    registerStateChangeListener: registerStateChangeListener,
    unregisterStateChangeListener: unregisterStateChangeListener,
    resetPlayerManager: resetPlayerManager,
    renamePid: renamePid,
    seedPlayerManager: seedPlayerManager,
    create: create,
    getPlayerState: getPlayerState,
    play: play,
    pause: pause,
    seekTo: seekTo,
    getCurrentTime: getCurrentTime,
    getBufferedPercent: getBufferedPercent,
    toggleMute: toggleMute,
    setVolume: setVolume,
    setSpeed: setSpeed,
    freezeMetaProps: angular.noop,
    unFreezeMetaProps: angular.noop,
    stop: stop,
    handleTimelineEnd: handleTimelineEnd
  };

  function create(playerId) {

    var ktObj = getMetaProp(playerId, 'ktObj');
    var partnerId = ktObj.partnerId,
      entryId = ktObj.entryId,
      uiConfId = ktObj.uiconfId;

    _createKWidget(playerId, partnerId, entryId, uiConfId, readyCallback)
      .then(handleSuccess);


    function handleSuccess() {
    }

    function readyCallback(playerId) {
      var kdp = document.getElementById(playerId);
      getPlayer(playerId).instance = kdp;
      _attachEventListeners(kdp, playerId);
    }

  }

  function seedPlayerManager(id, mainPlayer, mediaSrcArr) {
    if (_existy(getPlayer(id)) && getMetaProp(id, 'startAtTime') > 0) {
      return;
    }

    if (mainPlayer) {
      _players = {};
      _mainPlayerId = id;
    }
    var ktObj = kalturaUrlService.getKalturaObject(mediaSrcArr[0]);
    var newProps = {
      mainPlayer: mainPlayer,
      div: _getPlayerDiv(id),
      ktObj: ktObj
    };
    setPlayer(id, createMetaObj(newProps, _kalturaMetaObj));
  }

  /*
   Event Bound functions
   */

  function onMediaReady(pid) {
    _emitStateChange(pid, 6);
    setMetaProp(pid, 'duration', _kdpEval(pid, 'duration'));
  }

  function onPlaying(pid) {
    setMetaProp(pid, 'playerState', 1);
    if (getMetaProp(pid, 'ready') === true) {
      _emitStateChange(pid);
    }
  }

  function onPaused(pid) {
    setMetaProp(pid, 'playerState', 2);
    _emitStateChange(pid);
  }

  function onBufferEnd(ev) {
    var currentState = PLAYERSTATES[getMetaProp(this.id, 'playerState')];
    var isBuffering = getMetaProp(this.id, 'bufferTimeout');

    if (_existy(isBuffering)) {
      cancelIttTimeout(isBuffering);
    }

    if (currentState === 'buffering') {
      play(this.id);
    }
  }

  function onBufferStart() {
    var pid = this.id;

    var isBuffering = ittTimeout(function () {
      console.log('stuck in buffer land', getMetaProp(pid, 'time'));
      _reset(pid);
    }, 15 * 1000);

    setMetaProp(this.id, 'bufferTimeout', isBuffering);
    setMetaProp(this.id, 'playerState', 3);
    _emitStateChange(this.id);
  }

  function onPlayerPlayEnd(pid) {
    console.log('playerState ended', getMetaProp(pid, 'playerState'));
    setMetaProp(pid, 'playerState', 0);
    _emitStateChange(pid);
  }

  function onMediaError(e) {
    console.warn('PLAYER ERROR', e);
  }

  function onUpdatedPlaybackRate(e) {
    console.log('new rate', e)
  }

  function onPlayerUpdatePlayhead(ev) {
    setMetaProp(this.id, 'time', ev);
  }

  /*
   Public Methods
   */
  function play(pid) {
    _sendKdpNotice(pid, 'doPlay');
  }

  function pause(pid) {
    _sendKdpNotice(pid, 'doPause');
  }

  function seekTo(pid, t) {
    if (t > 60 && t % 10 === 0) { //certain startAtTime values seem to lock the player up in chrome
      t -= 0.5;
    }
    _sendKdpNotice(pid, 'doSeek', t);
  }

  function stop(pid) {
    _sendKdpNotice(pid, 'doStop');
  }

  function getPlayerState(pid) {
    return PLAYERSTATES[getMetaProp(pid, 'playerState')];
  }

  function getCurrentTime(pid) {
    return _kdpEval(pid, 'video.player.currentTime') || 0;
  }

  function getBufferedPercent(pid) {
    if (getMetaProp(pid, 'ready') === true) {
      return _kdpEval(pid, 'video.buffer.percent') * 100;
    }
  }

  function toggleMute(pid) {
    var isMuted = getMetaProp(pid, 'muted');

    if (isMuted === false) {
      setMetaProp(pid, 'lastVol', getMetaProp(pid, 'volume'));
      setVolume(pid, 0);
    } else {
      setVolume(pid, getMetaProp(pid, 'lastVol'));
    }

    setMetaProp(pid, 'muted', !isMuted);
  }

  function setSpeed(pid, playbackRate) {
    console.log('setting speed to', playbackRate);
    _sendKdpNotice(pid, 'playbackRateChangeSpeed', playbackRate);
  }

  function setVolume(pid, v) {
    _sendKdpNotice(pid, 'changeVolume', v / 100);
    setMetaProp(pid, 'volume', v);
  }

  /*
   Private methods
   */


  function _reset(pid, t) {
    var currentTime = t || getMetaProp(pid, 'time');
    //changeMedia will emit a 'onMediaReady' event after the media has been successfully changed
    //when handling the 'onMediaReady' event, the playbackService will seek to the startAtTime
    console.log('about to reset to t=', currentTime);
    setMetaProp(pid, 'startAtTime', currentTime);
    setMetaProp(pid, 'hasResumedFromStartAt', false);
    setMetaProp(pid, 'resetInProgress', true);
    var entryId = getMetaProp(pid, 'ktObj').entryId;
    _sendKdpNotice(pid, 'changeMedia', {'entryId': entryId});
    setMetaProp(pid, 'ready', false);
  }

  function _sendKdpNotice(pid, notice, val) {
    var kdp = getInstance(pid);

    try {
      if (_existy(val)) {
        kdp.sendNotification(notice, val);
      } else {
        kdp.sendNotification(notice);
      }
    } catch (e) {
      console.log('error sending', notice);
    }
  }

  function _createKWidget(divId, partnerID, entryID, uiConfId, onReadyCB) {

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

    if (divId !== _mainPlayerId) {
      angular.extend(embedObj.flashvars, embedControls);
    }

    return kalturaScriptLoader.load(partnerID, uiConfId).then(function () {
      KWidget.embed(embedObj);
    });
  }

  function _getPlayerDiv(id) {
    return '<div id="' + id + '"></div>';
  }

  function _attachEventListeners(kdp, pid) {
    var kMap = {
      'playerPlayed': onPlaying,
      'playerPaused': onPaused,
      'bufferStartEvent': onBufferStart,
      'bufferEndEvent': onBufferEnd,
      'playerPlayEnd': onPlayerPlayEnd,
      'mediaError': onMediaError,
      'mediaReady': onMediaReady,
      'updatedPlaybackRate': onUpdatedPlaybackRate,
      'playerUpdatePlayhead': onPlayerUpdatePlayhead
    };
    Object.keys(kMap).forEach(function (evtName) {
      (function (evtName) {
        kdp.kBind(evtName + '.' + pid, kMap[evtName]);
      })(evtName)
    });
  }

  function _removeEventListeners(pid) {
    var kdp = getInstance(pid);
    kdp.kUnbind('.' + pid);
  }

  function _emitStateChange(pid, forceState?) {
    var state;

    if (forceState) {
      state = forceState
    } else {
      state = getMetaProp(pid, 'playerState');
    }

    _getStateChangeListeners().forEach(function (cb) {
      cb(_formatPlayerStateChangeEvent(state, pid));
    });
  }

  function _kdpEval(pid, prop) {
    var instance = getInstance(pid);
    if (_existy(instance)) {
      return instance.evaluate('{' + prop + '}');
    }
  }

  function _formatPlayerStateChangeEvent(state, pid) {
    return {
      emitterId: pid,
      state: PLAYERSTATES[state]
    };
  }

}

