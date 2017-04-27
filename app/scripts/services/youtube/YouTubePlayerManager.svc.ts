/**
 * Created by githop on 12/3/15.
 */
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


youTubePlayerManager.$inject = ['$location', 'ittUtils', 'YTScriptLoader', 'errorSvc', 'PLAYERSTATES', 'youtubeUrlService', 'playerManagerCommons'];

export default function youTubePlayerManager($location, ittUtils, YTScriptLoader, errorSvc, PLAYERSTATES, youtubeUrlService, playerManagerCommons) {

  var _youTubePlayerManager;
  var _players = {};
  var _mainPlayerId;
  var _type = 'youtube';

  var base = playerManagerCommons({players: _players, type: _type});
  var commonMetaProps = base.commonMetaProps;

  var _youtubeMetaProps = {
    ytId: '',
    videoType: _type,
    bufferInterval: null
  };

  var _youtubeMetaObj = {
    instance: null,
    meta: {}
  };

  angular.extend(_youtubeMetaObj.meta, _youtubeMetaProps, commonMetaProps);
  var _validMetaKeys = Object.keys(_youtubeMetaObj.meta);

  var predicate = function (pid) {
    return (_existy(getPlayer(pid)) && getMetaProp(pid, 'ready') === true);
  };

  var destroyFn = function (pid) {
    var p = getInstance(pid);
    _tryCommand(p, 'destroy');
  };

  var youtubeEnding = function (pid) {
    setMetaProp(pid, 'time', getMetaProp(pid, 'duration'));
    ittUtils.ngTimeout(function () {
      if (playerState(pid) !== 'ended') {
        console.log('on ended state', playerState(pid));
        stop(pid);
      }
    }, 500);
  };

  var getPlayer = base.getPlayer;
  var setPlayer = base.setPlayer;
  var getInstance = base.getInstance(predicate);
  var createMetaObj = base.createMetaObj;
  var getMetaObj = base.getMetaObj;
  var getMetaProp = base.getMetaProp;
  var setMetaProp = base.setMetaProp(_validMetaKeys);
  var registerStateChangeListener = base.registerStateChangeListener;
  var unregisterStateChangeListener = base.unregisterStateChangeListener;
  var pauseOtherPlayers = base.pauseOtherPlayers(pause, playerState);
  var getPlayerDiv = base.getPlayerDiv;
  var resetPlayerManager = base.resetPlayerManager(destroyFn);
  var renamePid = base.renamePid;
  var handleTimelineEnd = base.handleTimelineEnd(youtubeEnding);
  var waitForBuffering = ittUtils.ngTimeout;
  var cancelBuffering = ittUtils.cancelNgTimeout;
  var _getStateChangeListeners = base.getStateChangeListeners;

  _youTubePlayerManager = {
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
    play: play,
    pause: pause,
    seekTo: seekTo,
    getCurrentTime: getCurrentTime,
    getPlayerState: playerState,
    getBufferedPercent: getVideoLoadedFraction,
    toggleMute: toggleMute,
    setVolume: setVolume,
    setSpeed: setSpeed,
    setPlaybackQuality: setPlaybackQuality,
    freezeMetaProps: angular.noop,
    unFreezeMetaProps: angular.noop,
    stop: stop,
    handleTimelineEnd: handleTimelineEnd
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
   * @returns {Vofid} returns void.
   */
  function seedPlayerManager(id, mainPlayer, mediaSrcArr) {

    //bail if we already have set the instance in the _players map.
    if (_existy(getPlayer(id)) && getMetaProp(id, 'startAtTime') > 0) {
      return;
    }

    if (mainPlayer) {
      // setPlayer(id, {});
      _players = {};
      _mainPlayerId = id;
    }

    var newProps = {
      mainPlayer: mainPlayer,
      div: _getPlayerDiv(id),
      ytId: youtubeUrlService.extractYoutubeId(mediaSrcArr[0])
    };

    setPlayer(id, createMetaObj(newProps, _youtubeMetaObj));
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
  function create(playerId) {
    var ytId = getMetaProp(playerId, 'ytId');
    _createInstance(playerId, ytId, onPlayerStateChange, onPlayerQualityChange, onReady, onError)
      .then(handleSuccess)
      .catch(tryAgain);

    function handleSuccess(ytInstance) {
      getPlayer(playerId).instance = ytInstance;
      setMetaProp(playerId, 'ytId', ytId);
    }

    function tryAgain() {
      return _createInstance(playerId, ytId, onPlayerStateChange, onPlayerQualityChange, onReady, onError)
        .then(handleSuccess)
        .catch(handleFail);
    }

    function handleFail(e) {
      var errorMsg = 'Network timeout initializing video player. Please try again.';
      errorSvc.error({data: errorMsg}, e);
    }

    //available 'states'
    //YT.PlayerState.ENDED
    //YT.PlayerState.PLAYING
    //YT.PlayerState.PAUSED
    //YT.PlayerState.BUFFERING
    //YT.PlayerState.CUED


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
    function onPlayerStateChange(event) {
      var pid = _getPidFromInstance(event.target);
      setMetaProp(pid, 'playerState', event.data);
      var stateChangeEvent = _formatPlayerStateChangeEvent(event, pid);
      var isBuffering = getMetaProp(pid, 'bufferInterval');
      // console.log('YT PlayerState', PLAYERSTATES[event.data]);

      if (event.data === YT.PlayerState.ENDED) {
        event.target.stopVideo();
      }

      if (event.data === YT.PlayerState.BUFFERING) {
        isBuffering = waitForBuffering(function () {
          if (event.target.getPlayerState() === YT.PlayerState.BUFFERING) {
            _reset(pid);
          }
        }, 7 * 1000);
        setMetaProp(pid, 'bufferInterval', isBuffering);
      } else {
        cancelBuffering(isBuffering)
      }

      _emitStateChange(stateChangeEvent);
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
    function onReady(event) {
      var pid = _getPidFromInstance(event.target);

      var playerReadyEv = _formatPlayerStateChangeEvent({data: '6'}, pid);
      setMetaProp(pid, 'duration', event.target.getDuration());
      console.log('_reset duration!');
      _emitStateChange(playerReadyEv);
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
    function onPlayerQualityChange(event) {
      var pid = _getPidFromInstance(event.target);
      if (event.data === 'medium' && /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)) {
        setPlaybackQuality(pid, 'large');
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
    function onError(event) {
      var brokePlayerPID = _getPidFromInstance(event.target);
      if (event.data === 5) {
        //only _reset for HTML5 player errors
        console.warn('resetting for chrome!!!');
        _reset(brokePlayerPID);
      }
    }
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
  function setSpeed(pid, playbackRate) {
    var p = getInstance(pid);
    // getAvailablePlayBackRates returns an array of numbers, with at least 1 element; i.e. the default playback rate
    if (_existy(p) && p.getAvailablePlaybackRates().length > 1) {
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
  function getCurrentTime(pid) {
    var p = getInstance(pid);
    if (_existy(p)) {
      return _tryCommand(p, 'getCurrentTime');
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
  function playerState(pid) {
    var p = getInstance(pid);
    if (_existy(p)) {
      return PLAYERSTATES[_tryCommand(p, 'getPlayerState')];
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
  function play(pid) {
    var p = getInstance(pid);
    if (_existy(p)) {
      _tryCommand(p, 'playVideo');
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
  function pause(pid) {
    var p = getInstance(pid);

    // console.log('pause instance?', p);
    if (_existy(p)) {
      _tryCommand(p, 'pauseVideo');
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
  function stop(pid) {
    var p = getInstance(pid);
    if (_existy(p)) {
      _tryCommand(p, 'stopVideo');
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
  function setPlaybackQuality(pid, size) {
    var p = getInstance(pid);
    if (_existy(p)) {
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
  function getVideoLoadedFraction(pid) {
    var p = getInstance(pid);
    if (_existy(p)) {
      return p.getVideoLoadedFraction() * 100;
    }
  }

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
  function seekTo(pid, t) {
    var p = getInstance(pid);
    var ytId = getMetaProp(pid, 'ytId');
    var lastState = PLAYERSTATES[getMetaProp(pid, 'playerState')];
    var currentState = playerState(pid);

    if (_existy(p)) {
      if (currentState === 'video cued') {
        switch (lastState) {
          case 'paused':
          case 'playing':
            /* falls through */
            p.cueVideoById(ytId, t);
            break;
          case 'video cued':
            if (pid === _mainPlayerId) {
              //if we're in video cued and we are not restarting, e.g. seeking in the paused state
              //then we want to immediately pause after playback resumes.
              // (to get the correct frame of video visible)
              if (t > 0.1 && getMetaProp(pid, 'autoplay') === false) {
                //to ignore next play to not generate a false playing analytics
                registerStateChangeListener(_seekPauseListener);
              }
              _tryCommand(p, 'seekTo', t);
            } else {
              p.cueVideoById(ytId, t);
            }
            break;
        }
      } else {
        _tryCommand(p, 'seekTo', t, true);
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
  function toggleMute(pid) {
    var p = getInstance(pid);
    if (p.isMuted()) {
      p.unMute();
    } else {
      p.mute();
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
  function setVolume(pid, v) {
    var p = getInstance(pid);

    if (_existy(p)) {
      p.setVolume(v);
    }
  }

  //private methods

  function _seekPauseListener(event) {
    if (event.state === 'playing') {
      unregisterStateChangeListener(_seekPauseListener);
      pause(event.emitterId);
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
  function _reset(pid) {
    var instance = getInstance(pid);
    var isMainPlayer = getMetaProp(pid, 'mainPlayer');

    if (_existy(instance)) {
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
  function _createInstance(divId, videoID, stateChangeCB, qualityChangeCB, onReadyCB, onError) {

    var _controls = 1;
    if (divId === _mainPlayerId) {
      _controls = 0;
    }

    var host = $location.host();
    return YTScriptLoader.load().then(function () {
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
          onReady: onReadyCB,
          onStateChange: stateChangeCB,
          onPlaybackQualityChange: qualityChangeCB,
          onError: onError
        }
      });
    });
  }

  function _existy(x) {
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
  function _getPidFromInstance(ytInstance) {
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
  function _formatPlayerStateChangeEvent(event, pid) {
    return {
      emitterId: pid,
      state: PLAYERSTATES[event.data]
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
  function _emitStateChange(playerStateChange) {
    _getStateChangeListeners().forEach(function (cb) {
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
  function _getPlayerDiv(id) {
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
  function _tryCommand(instance, command, val, bool) {
    var returnVal;
    try {
      if (_existy(val) && _existy(bool)) {
        instance[command](val, bool);
      } else if (_existy(val)) {
        instance[command](val);
      } else {
        //some getters return a value, i.e. getPlayerState
        // console.log('hmm', instance, command);
        returnVal = instance[command]();
      }
    } catch (err) {
      console.warn('error trying', command, 'with', instance[command], 'full error:', err);
    }

    if (_existy(returnVal)) {
      return returnVal;
    }
  }

  return _youTubePlayerManager;

}
