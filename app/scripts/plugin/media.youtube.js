/* MODIFIED: doesn't try to inject css anymore (failed in IE8; we just put it in the css ourselves instead) */
/* MODIFIED: ripped out quality menu (buggy in IE, not that useful anyway) */
/* TODO: addEventListener on iframeblocker is failing in IE */
/* god this code is a disaster */


/**
 * @fileoverview YouTube Media Controller - Wrapper for YouTube Media API
 */

/**
 * YouTube Media Controller - Wrapper for YouTube Media API
 * @param {videojs.Player|Object} player
 * @param {Object=} options
 * @param {Function=} ready
 * @constructor
 */
videojs.Youtube = videojs.MediaTechController.extend({
  /** @constructor */
  init: function(player, options, ready){
    videojs.MediaTechController.call(this, player, options, ready);
    
    // No event is triggering this for YouTube
    this.features['progressEvents'] = false;
    this.features['timeupdateEvents'] = false;

    // Copy the JavaScript options if they exists
    if (typeof options['source'] != 'undefined') {
      for (var key in options['source']) {
        player.options()[key] = options['source'][key];
      }
    }

    // Save those for internal usage
    this.player_ = player;
    this.player_el_ = document.getElementById(player.id());
    this.player_el_.className += ' vjs-youtube';

    // Mobile devices are using their own native players
    if (!!navigator.userAgent.match(/iPhone/i) || !!navigator.userAgent.match(/iPad/i) || !!navigator.userAgent.match(/iPod/i) || !!navigator.userAgent.match(/Android.*AppleWebKit/i)) {
      player.options()['ytcontrols'] = true;
    }

    this.id_ = this.player_.id() + '_youtube_api';

    this.el_ = videojs.Component.prototype.createEl('iframe', {
      id: this.id_,
      className: 'vjs-tech',
      scrolling: 'no',
      marginWidth: 0,
      marginHeight: 0,
      frameBorder: 0,
      webkitAllowFullScreen: 'true',
      mozallowfullscreen: 'true',
      allowFullScreen: 'true'
    });

    // This makes sure the mousemove is not lost within the iframe
    // Only way to make sure the control bar shows when we come back in the video player
    this.iframeblocker = videojs.Component.prototype.createEl('div', {
      className: 'iframeblocker'
    });

    // Make sure to not block the play or pause
    var self = this;
    var toggleThis = function() {
      if (self.paused()) {
        self.play();
      } else {
        self.pause();
      }
    };

    this.iframeblocker.addEventListener('click', toggleThis);
    this.iframeblocker.addEventListener('mousemove', function(e) {
      if (!self.player_.userActive()) {
        self.player_.userActive(true);
      }
      
      e.stopPropagation();
      e.preventDefault();
    });

    if (!this.player_.options()['ytcontrols']) {
      // Before the tech is ready, we have to take care of the play action
      this.iframeblocker.style.display = 'block';
    }

    this.player_el_.insertBefore(this.iframeblocker, this.player_el_.firstChild);
    this.player_el_.insertBefore(this.el_, this.iframeblocker);

    this.parseSrc(player.options()['src']);

    this.playOnReady = this.player_.options()['autoplay'] || false;

    var params = {
      enablejsapi: 1,
      iv_load_policy: 3,
      playerapiid: this.id(),
      disablekb: 1,
      wmode: 'transparent',
      controls: (this.player_.options()['ytcontrols'])?1:0,
      showinfo: 0,
      modestbranding: 1,
      rel: 0,
      autoplay: (this.playOnReady)?1:0,
      loop: (this.player_.options()['loop'])?1:0,
      list: this.playlistId,
    };

    if (typeof params.list == 'undefined') {
      delete params.list;
    }

    // If we are not on a server, don't specify the origin (it will crash)
    if (window.location.protocol != 'file:'){
      params.origin = window.location.protocol + '//' + window.location.host;
      this.el_.src = window.location.protocol + '//www.youtube.com/embed/' + this.videoId + '?' + videojs.Youtube.makeQueryString(params);
    } else {
      this.el_.src = 'https://www.youtube.com/embed/' + this.videoId + '?' + videojs.Youtube.makeQueryString(params);
    }

    var self = this;
    player.ready(function(){
      var controlBar = self.player_el_.getElementsByClassName('vjs-control-bar')[0];

      if (self.playOnReady && !self.player_.options()['ytcontrols']) {
        self.player_.loadingSpinner.show();
        self.player_.bigPlayButton.hide();
      }
    });

    if (this.player_.options()['ytcontrols']){
      // Disable the video.js controls if we use the YouTube controls
      this.player_.controls(false);
    } else {
      // Show the YouTube poster if their is no custom poster
      if (!this.player_.poster()) {
        if (this.videoId == null) {
          // Set the black background if their is no video initially
          this.iframeblocker.style.backgroundColor = 'black';
        } else {
          this.player_.poster('https://img.youtube.com/vi/' + this.videoId + '/0.jpg');
        }
      }
    }

    if (videojs.Youtube.apiReady){
      this.loadYoutube();
    } else {
      // Add to the queue because the YouTube API is not ready
      videojs.Youtube.loadingQueue.push(this);

      // Load the YouTube API if it is the first YouTube video
      if(!videojs.Youtube.apiLoading){
        var tag = document.createElement('script');
        tag.src = '//www.youtube.com/iframe_api';
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        videojs.Youtube.apiLoading = true;
      }
    }
    
    this.on('dispose', function() {
      // Get rid of the created DOM elements
      this.el_.parentNode.removeChild(this.el_);
      this.iframeblocker.parentNode.removeChild(this.iframeblocker);
      
      this.player_.loadingSpinner.hide();
      this.player_.bigPlayButton.hide();
    });
  }
});

videojs.Youtube.prototype.parseSrc = function(src){
  this.srcVal = src;
  
  if (src) {
    // Regex to parse the video ID
    var regId = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = src.match(regId);
    
    if (match && match[2].length == 11){
      this.videoId = match[2];
    } else {
      this.videoId = null;
    }
    
    // Regex to parse the playlist ID
    var regPlaylist = /[?&]list=([^#\&\?]+)/;
    match = src.match(regPlaylist);
    
    if (match != null && match.length > 1) {
      this.playlistId = match[1];
    } else {
      // Make sure their is no playlist
      if (this.playlistId) {
        delete this.playlistId;
      }
    }

  }
};

videojs.Youtube.prototype.src = function(src){
  if (src) {
    this.parseSrc(src);

    if (this.videoId == null) {
      // Set the black background if the URL isn't valid
      this.iframeblocker.style.backgroundColor = 'black';
      this.iframeblocker.style.display = 'block';
    } else {
      this.ytplayer.loadVideoById({
        videoId: this.videoId
      });

      // Update the poster
      this.player_el_.getElementsByClassName('vjs-poster')[0].style.backgroundImage = 'url(https://img.youtube.com/vi/' + this.videoId + '/0.jpg)';
      this.iframeblocker.style.backgroundColor = '';
      this.iframeblocker.style.display = '';
      this.player_.poster('https://img.youtube.com/vi/' + this.videoId + '/0.jpg');
    }
  }

  return this.srcVal;
};

videojs.Youtube.prototype.load = function(){};

videojs.Youtube.prototype.play = function(){
  if (this.videoId != null) {
    // Make sure to not display the spinner for mobile
    if (!this.player_.options()['ytcontrols']) {
      // Display the spinner until the video is playing by YouTube
      this.player_.trigger('waiting');
    }
    
    if (this.isReady_){
      this.ytplayer.playVideo();
    } else {
      this.playOnReady = true;
    }
  }
};

videojs.Youtube.prototype.pause = function(){ this.ytplayer.pauseVideo(); };
videojs.Youtube.prototype.paused = function(){ return (this.ytplayer)?(this.lastState !== YT.PlayerState.PLAYING && this.lastState !== YT.PlayerState.BUFFERING):true; };
videojs.Youtube.prototype.currentTime = function(){ return (this.ytplayer && this.ytplayer.getCurrentTime)?this.ytplayer.getCurrentTime():0; };
videojs.Youtube.prototype.setCurrentTime = function(seconds){ this.ytplayer.seekTo(seconds, true); this.player_.trigger('timeupdate'); };
videojs.Youtube.prototype.duration = function(){ return (this.ytplayer && this.ytplayer.getDuration)?this.ytplayer.getDuration():0; };

videojs.Youtube.prototype.volume = function() {
  if (this.ytplayer && isNaN(this.volumeVal)) {
    this.volumeVal = this.ytplayer.getVolume() / 100.0;
  }

  return this.volumeVal;
};

videojs.Youtube.prototype.setVolume = function(percentAsDecimal){
  if (percentAsDecimal && percentAsDecimal != this.volumeVal) {
    this.ytplayer.setVolume(percentAsDecimal * 100.0);
    this.volumeVal = percentAsDecimal;
    this.player_.trigger('volumechange');
  }
};

videojs.Youtube.prototype.muted = function() { return this.mutedVal; };
videojs.Youtube.prototype.setMuted = function(muted) {
  if (muted) {
    this.ytplayer.mute();
  } else {
    this.ytplayer.unMute();
  }

  this.mutedVal = muted;
  this.player_.trigger('volumechange');
};

videojs.Youtube.prototype.buffered = function(){
  if (this.ytplayer && this.ytplayer.getVideoBytesLoaded) {
    var loadedBytes = this.ytplayer.getVideoBytesLoaded();
    var totalBytes = this.ytplayer.getVideoBytesTotal();
    if (!loadedBytes || !totalBytes) return 0;

    var duration = this.ytplayer.getDuration();
    var secondsBuffered = (loadedBytes / totalBytes) * duration;
    var secondsOffset = (this.ytplayer.getVideoStartBytes() / totalBytes) * duration;

    return videojs.createTimeRange(secondsOffset, secondsOffset + secondsBuffered);
  } else {
    return videojs.createTimeRange(0, 0);
  }
};

videojs.Youtube.prototype.supportsFullScreen = function(){ return true; };

// YouTube is supported on all platforms
videojs.Youtube.isSupported = function(){ return true; };

// You can use video/youtube as a media in your HTML5 video to specify the source
videojs.Youtube.canPlaySource = function(srcObj){
  return (srcObj.type == 'video/youtube');
};

// Always can control the volume
videojs.Youtube.canControlVolume = function(){ return true; };

////////////////////////////// YouTube specific functions //////////////////////////////

// All videos created before YouTube API is loaded
videojs.Youtube.loadingQueue = [];

// Create the YouTube player
videojs.Youtube.prototype.loadYoutube = function(){
  this.ytplayer = new YT.Player(this.id_, {
    events: {
      onReady: function(e) { e.target.vjsTech.onReady(); },
      onStateChange: function(e) { e.target.vjsTech.onStateChange(e.data); },
      onError: function(e){ e.target.vjsTech.onError(e.data); }
    }
  });

  this.ytplayer.vjsTech = this;
};

// Transform a JavaScript object into URL params
videojs.Youtube.makeQueryString = function(args){
  var array = [];
  for (var key in args){
    if (args.hasOwnProperty(key)){
      array.push(encodeURIComponent(key) + '=' + encodeURIComponent(args[key]));
    }
  }

  return array.join('&');
};

// Called when YouTube API is ready to be used
window.onYouTubeIframeAPIReady = function(){
  var yt;
  while ((yt = videojs.Youtube.loadingQueue.shift())){
    yt.loadYoutube();
  }
  videojs.Youtube.loadingQueue = [];
  videojs.Youtube.apiReady = true;
};

videojs.Youtube.prototype.onReady = function(){
  this.isReady_ = true;
  this.triggerReady();

  // Let the player take care of itself as soon as the YouTube is ready
  // The loading spinner while waiting for the tech would be impossible otherwise
  this.iframeblocker.style.display = '';
  this.player_.loadingSpinner.hide();

  if (this.player_.options()['muted']) {
    this.setMuted(true);
  }

  // Play ASAP if they clicked play before it's ready
  if (this.playOnReady) {
    this.playOnReady = false;
    this.play();
  }
};

videojs.Youtube.prototype.onStateChange = function(state){
  if (state != this.lastState){
    switch(state){
      case -1:
        this.player_.trigger('durationchange');
        break;

      case YT.PlayerState.ENDED:
        // Replace YouTube play button by our own
        if (!this.player_.options()['ytcontrols']) {
          this.player_el_.getElementsByClassName('vjs-poster')[0].style.display = 'block';
          this.player_.bigPlayButton.show();
        }

        this.player_.trigger('ended');
        break;

      case YT.PlayerState.PLAYING:
        // Make sure the big play is not there
        this.player_.bigPlayButton.hide();
        
        // TODO hack:  having this true during init makes the video unplayable(?!) but we want to see our toolbar.
        // Haven't figured out a way to not have the native controls wihtout breakign the video altogether
        this.player_.controls(true);

        this.player_.trigger('timeupdate');
        this.player_.trigger('durationchange');
        this.player_.trigger('playing');
        this.player_.trigger('play');
        break;

      case YT.PlayerState.PAUSED:
        this.player_.trigger('pause');
        break;

      case YT.PlayerState.BUFFERING:
        this.player_.trigger('timeupdate');
        
        // Make sure to not display the spinner for mobile
        if (!this.player_.options()['ytcontrols']) {
          this.player_.trigger('waiting');
        }
        break;

      case YT.PlayerState.CUED:
        break;
    }

    this.lastState = state;
  }
};



videojs.Youtube.prototype.onError = function(error){
  this.player_.error = error;
  this.player_.trigger('error');
};

