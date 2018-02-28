import { BasePlayerManager } from '../../../services/base-player-manager/basePlayerManager';
import { IMetaProps, IPlayerManager, IScriptLoader } from '../../../../../interfaces';
import { PlayerManagerCommons } from "../../../services/player-manager-commons/playerManagerCommons";
import { existy } from '../../../../../shared/services/ittUtils';

// @npUpgrade-html5-false
/**
 * Created by githop on 1/18/16.
 */

 /***********************************
 **** Updated by Curve10 (JAB/EDD)
 **** Feb 2018
 ***********************************/

/**
 * @ngdoc service
 * @name iTT.service:html5PlayerManager
 * @description
 * Implements the PlayerManager interface, wraps HTML5 videos
 * @property {String} type the type of playerManager
 * @requires $interval
 * @requires PLAYERSTATES
 * @requires ittUtils
 */
// var readyStates = {
// 	0: 'HAVE_NOTHING',
// 	1: 'HAVE_METADATA',
// 	2: 'HAVE_CURRENT_DATA',
// 	3: 'HAVE_FUTURE_DATA',
// 	4: 'HAVE_ENOUGH_DATA'
// }

export interface IHtml5PlayerManager {
  create(divID);
  freezeMetaProps(pid);
  unFreezeMetaProps(pid);
  seedPlayerManager(id, mainPlayer, mediaSrcArr);
  // onSeeked(ev);
  // onEnded();
  // onCanPlay();
  // onPlaying();
  // onPause();
  // onBuffering(pid);
  play(pid);
  pause(pid);
  stop(pid);
  getCurrentTime(pid);
  getPlayerState(pid);
  seek(pid, t);
  setSpeed(pid, playbackRate);
  toggleMute(pid);
  setVolume(pid, vol);
  getBufferedPercent(pid);
  type:string;
}

export class Html5PlayerManager extends BasePlayerManager implements IHtml5PlayerManager {
  static Name = 'html5PlayerManager'; // tslint:disable-line
  static $inject = ['$interval', 'PLAYERSTATES', 'ittUtils', 'appState', 'playerManagerCommons'];

  constructor (
    private $interval,
    private PLAYERSTATES,
    private ittUtils,
    private appState,
    private playerManagerCommons) {
      super();

      // Initialization
      angular.extend(this._html5MetaObj.meta, this._html5MetaProps, this.commonMetaProps);
    }

  private _players = {};
  private _mainPlayerId;
  // private _checkInterval = 50.0;
  private _ignoreNextEventIfPause = false;
  public type = 'html5';
  private _existy = this.ittUtils.existy;
  // private base = playerManagerCommons({players: _players, type: _type});
  private base = new PlayerManagerCommons( this.ittUtils,{players: this._players, type: this.type} );
  private commonMetaProps = this.base.commonMetaProps;

  private _html5MetaProps = {
    videoObj: {},
    videoType: this.type
  };

  private _html5MetaObj = {
    instance: null,
    meta: {}
  };

  private _validMetaKeys = Object.keys(this._html5MetaObj.meta);
  predicate(pid) {
    return (this._existy(this.getPlayer(pid)) && this._existy(this.getPlayer(pid).instance))
  };

  private html5Ending(pid) {
    this.stop(pid);
    const instance = this.getInstance(pid);
    this.onEnded.call(instance);
  }

  // private getPlayer = this.base.getPlayer;
  // private setPlayer = this.base.setPlayer;
  // private getPlayerDiv = this.base.getPlayerDiv;
  // var getInstance = base.getInstance(predicate);
  private createMetaObj = this.base.createMetaObj;
  private getMetaObj = this.base.getMetaObj;
  // private getMetaProp = this.base.getMetaProp;
  // private setMetaProp = this.base.setMetaProp(this._validMetaKeys);
  // private registerStateChangeListener = this.base.registerStateChangeListener;
  // private unregisterStateChangeListener = this.base.unregisterStateChangeListener;
  // private pauseOtherPlayers = this.base.pauseOtherPlayers(this.pause, this.getPlayerState);
  // private resetPlayerManager = this.base.resetPlayerManager(this._removeEventListeners);
  // private renamePid = this.base.renamePid;
  // private handleTimelineEnd = this.base.handleTimelineEnd(this.html5Ending);
  private _getStateChangeListeners = this.base.getStateChangeListeners;

  // return {
  //   type: _type,
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
  //   seekTo: seek,
  //   getCurrentTime: getCurrentTime,
  //   getBufferedPercent: getBufferedPercent,
  //   toggleMute: toggleMute,
  //   setVolume: setVolume,
  //   setSpeed: setSpeed,
  //   freezeMetaProps: freezeMetaProps,
  //   unFreezeMetaProps: unFreezeMetaProps,
  //   stop: stop,
  //   handleTimelineEnd: handleTimelineEnd
  // };

  //public methods
  /**
   * @ngdoc method
   * @name #create
   * @methodOf iTT.service:html5PlayerManager
   * @param {string} divID unique ID of video tag
   * @returns {Void} no return value
   */
  create(divID) {

    if (Object.isFrozen(this.getPlayer(divID).meta)) {
      this.unFreezeMetaProps(divID);
    }

    var plr = document.getElementById(divID);
    this._attachEventListeners(plr);

    plr.onStateChange = this._onStateChange;
    plr.controls = true;

    if (this._mainPlayerId === divID) {
      this._mainPlayerId = divID;
      plr.controls = false;
    }

    plr.load();
    // _players[divID].instance = plr;
    this.getPlayer(divID).instance = plr;

    // console.log('check', getPlayer(divID));
    // temp to test out video source change.
    // $timeout(function() {
    // 	console.info('BEGIN QUALITY CHANGE!');
    // 	_changeVideoQuality(divID, 1);
    // 	_players[divID].meta.playerState = 2;
    // 	_emitStateChange(plr);
    // }, 8 * 1000);

    // var checkBuffering = _checkBuffering(plr);

    // var interval = $interval(checkBuffering, _checkInterval);
  }

  /**
   * @ngdoc method
   * @name #freezeMetaProps
   * @methodOf iTT.service:html5PlayerManager
   * @description Freezes the player's meta data object
   * @param {String} pid the pid of the player to freeze.
   * @returns {Void} returns void
   */
  freezeMetaProps(pid) {
    Object.freeze(this.getMetaObj(pid));
  }

  /**
   * @ngdoc method
   * @name #unFreezeMetaProps
   * @methodOf iTT.service:html5PlayerManager
   * @description
   * Unfreeze metaObj by copying (shallow) all of the props into a new object.
   * @param {String} pid the pid of the player to unfreeze
   * @returns {Void} returns void.
   */
  unFreezeMetaProps(pid) {
    var newMeta, prop, frozenMeta;
    frozenMeta = this.getMetaObj(pid);
    newMeta = {};

    for (prop in frozenMeta) {
      if (frozenMeta.hasOwnProperty(prop)) {
        newMeta[prop] = frozenMeta[prop];
      }
    }

    //If this is a Safari browser, there will be a pause event that gets emitted after this unfreeze happens.
    //This would cause the state to be recorded as paused and would therefore break the automatic resumption of the html5 video.
    //Therefore, we will suppress that pause event.
    if (/Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)) {
      this._ignoreNextEventIfPause = true;
    }

    this.getPlayer(pid).meta = newMeta;
  }

  /**
   * @ngdoc method
   * @name #seedPlayerManager
   * @methodOf iTT.service:html5PlayerManager
   * @description
   * Used to set the PID / divID for a html5 video element, is called prior to create()
   * @param {String} id Main Video Asset ID or Event ID (for embeds)
   * @param {Boolean} mainPlayer Determines type of player, embed or main
   * @param {Array} mediaSrcArr array of youtube URLs
   * @returns {Void} returns void.
   */
  seedPlayerManager(id, mainPlayer, mediaSrcArr) {

    //bail if we were frozen prior to attempting to re-init player.
    if (this._existy(this.getPlayer(id)) && this.getMetaProp(id, 'startAtTime') > 0) {
      return;
    }

    if (mainPlayer) {
      this._players = {};
      this._mainPlayerId = id;
    }

    var plrInfo = this._initPlayerDiv(id, mediaSrcArr);
    //store relevant info the particular player in the 'meta' obj.
    var newProps = {
      mainPlayer: mainPlayer,
      videoObj: plrInfo.videoObj,
      div: plrInfo.videoElm
    };

    this.setPlayer(id, this.createMetaObj(newProps, this._html5MetaObj));
  }

  /*
   HTML5 media event handlers
   */
  private onSeeked(ev) {
    // DOM element has class context and player id set inside
    var context = this.npContext;
    var pid = this.pid;
    var state = context.getPlayerState(pid);
    if (state === 'playing' || state === 'buffering' && context.appState.isIEOrEdge === true) {
      //manually fire onPlaying for IE/Edge only as to avoid duplicate onplaying events.
      context.onPlaying.call(context);
    }

    const {currentTime, duration} = ev.target;
    const padding = 0.5;

    if (Math.floor(duration - currentTime) <= padding) {
      context.onEnded.call(context);
    }
  }

  /**
   * @ngdoc method
   * @name onEnded
   * @methodOf iTT.service:html5PlayerManager
   * @description
   * HTML5 media event handler bound to HTML5 video element,
   * used to handle appropriate side effects and pipe events up stream
   * @private
   * @returns {Void} Returns void but will emit a 'ended' event as side-effect
   * Curve10 - added pid to parameters, changed this.id to pid
   */
  private onEnded() {
    // DOM element has class context and player id set inside
    var context = this.npContext;
    var pid = this.pid;
    var instance = context.getInstance(pid);
    context.setMetaProp(pid, 'playerState', 0);
    context._emitStateChange(instance);
  }

  /**
   * @ngdoc method
   * @name onCanPlay
   * @methodOf iTT.service:html5PlayerManager
   * @description
   * Used to determine when the video can be played for the first time
   * @private
   * @returns {Void} Returns void but will emit a 'player ready' evetn as side-effect.
   * Curve10 - added pid to parameters, changed this.id to pid
   */
  private onCanPlay() {
    // DOM element has class context and player id set inside
    var context = this.npContext;
    var pid = this.pid;
    var instance = context.getInstance(pid);
    if (context.getMetaProp(pid, 'ready') === false) {
      context._emitStateChange(instance, 6);
      context.setMetaProp(pid, 'duration', instance.duration);
    }
  }

  /**
   * @ngdoc method
   * @private
   * @name onPlaying
   * @methodOf iTT.service:html5PlayerManager
   * @description
   * Event handler that responds to a 'playing' HTML5 media event.
   * @returns {Void} returns void but will emit a 'playing' event.
   * Curve10 - added pid to parameters, changed this.id to pid
   */
  private onPlaying() {
    // DOM element has class context and player id set inside
    var context = this.npContext;
    var pid = this.pid;
    var instance = context.getInstance(pid);
    context.setMetaProp(pid, 'playerState', 1);
    context._emitStateChange(instance);
  }

  /**
   * @ngdoc method
   * @private
   * @name onPause
   * @methodOf iTT.service:html5PlayerManager
   * @description
   * Event handler for 'pause' event.
   * @returns {Void} returns void but will emit a 'paused' event
   * Curve10 - added pid to parameters, changed this.id to pid
   */
  private onPause() {
    // DOM element has class context and player id set inside
    var context = this.npContext;
    var pid = this.pid;
    var instance = context.getInstance(pid);
    //Bail out if we are ignoring the next pause event
    if (context._ignoreNextEventIfPause === true) {
      context._ignoreNextEventIfPause = false;
      return;
    }
    context.setMetaProp(pid, 'playerState', 2);
    context._emitStateChange(instance);
  }

  /**
   * @ngdoc method
   * @name onBuffering
   * @methodOf iTT.service:html5PlayerManager
   * @description
   * Event handler for 'buffering' event, note that HTML5 media api does not have a 'buffering' event, this is
   * bound to the 'onWaiting' event.
   * @returns {Void} returns void but will emit a 'buffering' event.
   * @private
   * Curve10 - added pid to parameters, changed this.id to pid
   */
  private onBuffering() {
    // DOM element has class context and player id set inside
    var context = this.npContext;
    var pid = this.pid;
    var instance = context.getInstance(pid);
    context.setMetaProp(pid, 'playerState', 3);
    context._emitStateChange(instance);
  }

  /*
   Playback exported methods
   */

  /**
   * @ngdoc method
   * @name #play
   * @methodOf iTT.service:html5PlayerManager
   * @description
   * Will play the video.
   * @param {String} pid the PID of the video to play
   * @returns {Void} returns void.
   */
  play(pid) {
    var instance = this.getInstance(pid);
    var timestamp = this.getMetaProp(pid, 'time');
    var playerRendered = this.getMetaProp(pid, 'ready');
    var waitUntilReady = this.$interval( () => {
      var delay;
      //make sure the player is in a state to accept commands
      if (this._existy(instance) && instance.readyState === 4 && playerRendered === true) {
        delay = this.getMetaProp(pid, 'time');
        //check for a drift then seek to original time to fix.
        //only for main player, otherwise embed players will attempt
        //to resume playback according to the timeline time.
        if (pid === this._mainPlayerId && timestamp <= delay) {
          instance.currentTime = timestamp;
        }
        instance.play();
        this.$interval.cancel(waitUntilReady);
      }
    }, 10);
  }

  /**
   * @ngdoc method
   * @name #pause
   * @methodOf iTT.service:html5PlayerManager
   * @description
   * used to pause the player
   * @param {String} pid the pid of the player
   * @returns {Void} returns void.
   */
  pause(pid) {
    var instance = this.getInstance(pid);
    instance.pause();
  }

  stop(pid) {
    this.setMetaProp(pid, 'time', this.getMetaProp(pid, 'duration'));
    console.log('stopped!');
    this.pause(pid);
  }

  /**
   * @ngdoc method
   * @name #getCurrentTime
   * @methodOf iTT.service:html5PlayerManager
   * @description
   * reports the current time of video playback.
   * @param {String} pid the pid of the player
   * @returns {Number} the time of playback.
   */
  getCurrentTime(pid) {
    var instance = this.getInstance(pid);
    if (instance !== undefined) {
      return instance.currentTime;
    }
  }

  /**
   * @ngdoc method
   * @name #getPlayerState
   * @methodOf iTT.service:html5PlayerManager
   * @description returns the current state of the player
   * @param {String} pid the player to query for state
   * @returns {String} the player state
   */
  getPlayerState(pid) {
    // var instance = _getInstance(pid);
    var player = this.getPlayer(pid);

    if (this._existy(player)) {
      return this.PLAYERSTATES[player.meta.playerState];
    }
  }

  /**
   * @ngdoc method
   * @name #seek
   * @methodOf iTT.service:html5PlayerManager
   * @description
   * will seek the video to the input time
   * @param {String} pid the player to seek
   * @param {Number} t the time to seek to.
   * @returns {Void} returns void.
   */
  seek(pid, t) {
    var instance = this.getInstance(pid);
    instance.currentTime = t;
  }

  /**
   * @ngdoc method
   * @name #setSpeed
   * @methodOf iTT.service:html5PlayerManager
   * @description
   * used to speed up / slow down the rate of video playback.
   * @param {String} pid the pid of the player
   * @param {Number} playbackRate the rate of playback to set
   * @returns {Void} returns void.
   */
  setSpeed(pid, playbackRate) {
    var instance = this.getInstance(pid);
    instance.playbackRate = playbackRate;
  }

  /**
   * @ngdoc method
   * @name #toggleMute
   * @methodOf iTT.service:html5PlayerManager
   * @description
   * toggles the mute on / off
   * @param {String} pid the pid of the player
   * @returns {Void} returns void.
   */
  toggleMute(pid) {
    var instance = this.getInstance(pid);
    instance.muted = !instance.muted;
    this.setMetaProp(pid, 'muted', instance.muted);
  }

  /**
   * @ngdoc method
   * @name #setVolume
   * @methodOf iTT.service:html5PlayerManager
   * @description
   * used to set the volume.
   * @param {String} pid the pid of the player
   * @param {Number} vol the value to set the volume to
   * @returns {Void} returns void.
   */
  setVolume(pid, vol) {
    var instance = this.getInstance(pid);
    instance.volume = (vol / 100);
    this.setMetaProp(pid, 'volume', vol);
  }

  /**
   * @ngdoc method
   * @name #getBufferedPercent
   * @methodOf iTT.service:html5PlayerManager
   * @description
   * Used to determine the percent of buffered video
   * @param {String} pid The ID of the YT instance
   * @returns {Number} Numerical value representing
   * percent of video that is currently buffered
   */
  getBufferedPercent(pid) {
    var instance = this.getInstance(pid);
    if (instance && this.getMetaProp(pid, 'playerState') !== -1) {
      if (instance.buffered.length > 0) {
        var bufLen = instance.buffered.length;
        var bufStart = instance.buffered.start(bufLen - 1);
        var bufEnd = instance.buffered.end(bufLen - 1);

        if (bufEnd < 0) {
          bufEnd = bufEnd - bufStart;
          bufStart = 0;
        }
        return bufEnd / this.getMetaProp(pid, 'duration') * 100;
      }
    }

  }

  /*
   private methods
   */

  private getInstance(pid: string): any {
    if (existy(this.getPlayer(pid)) && this.getMetaProp(pid, 'ready') === true) {
      return this.getPlayer(pid).instance;
    }
  }


  /**
   * @private
   * @ngdoc method
   * @name _initPlayerDiv
   * @methodOf iTT.service:html5PlayerManager
   * @description
   * Used to create a HTML video tag with the src tags mapped to the URLs in the input array.
   * @param {String} id the unique id
   * @param {Array} mediaSrcArr array of URLs that could contain .mp4, .webm or .m3u8 files
   * @returns {Object} Object with videoObj and videoElm properties
   */
  private _initPlayerDiv(id, mediaSrcArr) {
    var videoObj = this._getHtml5VideoObject(mediaSrcArr);
    var videoElm = this._drawPlayerDiv(id, videoObj, 0);
    return {videoObj: videoObj, videoElm: videoElm};
  }

  /**
   * @ngdoc method
   * @name _drawPlayerDiv
   * @methodOf iTT.service:html5PlayerManager
   * @description
   * Helper method that abstracts the functionality of creating a HTML5 video tag
   * @param {String} id unique id
   * @param {Object} videoObj Object with array of source URLs by file type
   * @param {Number} quality index to select the proper source out of the availble sources
   * @returns {string} returns HTML5 video element
   * @private
   */
  private _drawPlayerDiv(pid, videoObj, quality) {
    var videoElement = document.createElement('video');
    // Saving pid in DOM element
    videoElement.pid = pid;
    videoElement.id = pid;

    Object.keys(videoObj).forEach( (fileType) => {
      var classAttr, srcAttr, typeAttr, srcElement;

      classAttr = fileType;

      if (classAttr === 'mp4') {
        classAttr = 'mpeg4';
      }

      srcAttr = videoObj[fileType][quality];

      if (!this._existy(srcAttr)) {
        return;
      }

      if (fileType === 'm3u8') {
        typeAttr = 'application/x-mpegURL';
      } else {
        typeAttr = 'video/' + fileType;
      }

      srcElement = document.createElement('source');
      srcElement.setAttribute('type', typeAttr);
      srcElement.setAttribute('src', srcAttr);
      srcElement.setAttribute('class', classAttr);
      videoElement.appendChild(srcElement);
    });

    var fallback = document.createElement('p');
    fallback.innerText = 'Oh no! Your browser does not support the HTML5 Video element.';
    videoElement.appendChild(fallback);
    return videoElement.outerHTML;
  }

  /**
   * @ngdoc method
   * @name _formatPlayerStateChangeEvent
   * @methodOf iTT.service:html5PlayerManager
   * @description
   * Helper method for creating an object that conforms to our message API between
   * the timelineSvc, playbackService, and individual playerManagers
   * @param {Number} event Interger that corresponds to a playerStateChange
   * @param {String} pid Unique ID of player
   * @returns {Object} Object with emitterID String and state String props
   * @private
   */
  private _formatPlayerStateChangeEvent(event, pid) {
    return {
      emitterId: pid,
      state: this.PLAYERSTATES[event]
    };
  }

  /**
   * @ngdoc method
   * @name _emitStateChange
   * @methodOf iTT.service:html5PlayerManager
   * @param {Object} instance HTML5 Video element
   * @param {Boolean} [forceState] optional Boolean if you want to send a message without setting the playerState
   * on the meta object.
   * @private
   */
  private _emitStateChange(instance, forceState?) {
    var player = this.getPlayer(instance.id);
    var state;

    //for emitting a state but not setting it on the player.
    if (forceState) {
      state = forceState;
    } else {
      state = player.meta.playerState;
    }

    instance.onStateChange(this._formatPlayerStateChangeEvent(state, instance.id));
  }

  /**
   * @ngdoc method
   * @name _onStateChange
   * @methodOf iTT.service:html5PlayerManager
   * @description
   * Method bound to each instance of _player[id] to invoke the stateChangeCallback for any listeners
   * @param {Object} event the message to send
   * @private
   */
  private _onStateChange(event) {
    angular.forEach(this._getStateChangeListeners(), function (cb) {
      cb(event);
    });
  }

  /**
   * @ngdoc method
   * @name _getHtml5VideoObject
   * @methodOf iTT.service:html5PlayerManager
   * @description
   * reduces an array of URLs into an Object used in other helper methods ultimately to format a
   * string of HTML with the provided input URLS as source tags.
   * @param {Array} mediaSrcArr array of URLS
   * @returns {Object} Object with mp4, webm, and m3u8 props, array of strings
   * @private
   */
  private _getHtml5VideoObject(mediaSrcArr) {
    var extensionMatch = /(mp4|m3u8|webm)/;

    return mediaSrcArr.reduce( (videoObject, mediaSrc) => {
      var fileTypeKey = mediaSrc.match(extensionMatch)[1];
      videoObject[fileTypeKey].push(mediaSrc);
      return videoObject;
    }, {mp4: [], webm: [], m3u8: []});
  }

  /**
   * @ngdoc method
   * @name _attachEventListeners
   * @methodOf iTT.service:html5PlayerManager
   * @description
   * helper method to abstract attaching of event listeners to the necessary events and wiring up the relevant
   * function
   * @param {Object} videoElement HTML5 video element
   * @private
   */
  private _attachEventListeners(videoElement) {
    var evMap = {
      'pause': this.onPause,
      'playing': this.onPlaying,
      'waiting': this.onBuffering,
      'seeked': this.onSeeked,
      'canplay': this.onCanPlay,
      'ended': this.onEnded
    };

    // Adding context to the DOM element for the callbacks
    videoElement.npContext = this;

    Object.keys(evMap).forEach( (evtName) => {
      ( (evtName) => {
        videoElement.addEventListener(evtName, evMap[evtName], this);
      })(evtName);
    });
  }

  /**
   * @ngdoc method
   * @name _attachEventListeners
   * @methodOf iTT.service:html5PlayerManager
   * @description
   * helper method to remove attached event listeners.
   * function
   * @param {String} pid id of element to remove listeners from.
   * @private
   */
  private _removeEventListeners(pid) {
    var videoElement;
    var instance = this.getInstance(pid);
    if (this._existy(instance)) {
      videoElement = instance;
      videoElement.removeEventListener('pause', this.onPause);
      videoElement.removeEventListener('playing', this.onPlaying);
      videoElement.removeEventListener('waiting', this.onBuffering);
      videoElement.removeEventListener('seeked', this.onSeeked);
      videoElement.removeEventListener('canplay', this.onCanPlay);
      videoElement.removeEventListener('ended', this.onEnded);
    }
  }


  // function _changeVideoQuality(id, quality) {
  // 	var player = getPlayer(id);
  // 	var videoObj = player.meta.videoObj;
  // 	var videoChildren = player.instance.childNodes;
  //
  // 	angular.forEach(videoChildren, function(elm) {
  // 		var fileType = '';
  // 		if (elm.nodeName === 'SOURCE') {
  // 			fileType = elm.className;
  // 			elm.setAttribute('src', videoObj[fileType][quality]);
  // 		}
  // 	});
  //
  // 	var wasPlaying = player.meta.playerState === 1;
  //
  // 	//load new element into DOM.
  // 	player.instance.load();
  // 	if (wasPlaying) {
  // 		play(id);
  // 	}
  // }

  //seems not to work very well.
  // function _checkBuffering(player) {
  // 	return function() {
  // 		player.meta.currentPlayPos = player.currentTime;
  // 		var offset = 1 / _checkInterval;
  //
  // 		if (player.meta.playerState !== 3 &&
  // 			player.meta.currentPlayPos < (player.meta.lastPlayPos + offset) &&
  // 			!player.paused) {
  // 			player.meta.playerState = 3;
  // 			_emitStateChange(player);
  // 		}
  // 		// if (player.meta.playerState === 3 &&
  // 		// 	player.meta.currentPlayPos > (player.meta.lastPlayPos + offset) &&
  // 		// 	!player.paused) {
  // 		// }
  // 		player.meta.lastPlayPos = player.meta.currentPlayPos;
  // 	}
  // }
}
