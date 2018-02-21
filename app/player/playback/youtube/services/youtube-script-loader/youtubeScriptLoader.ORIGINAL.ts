// @npUpgrade-youtube-false
/**
 * Created by githop on 12/1/15.
 */

/**
 * @ngdoc service
 * @name iTT.service:YTScriptLoader
 * @description
 * A service for downloading youtube player scripts
 * @requires $q
 * @requires $timeout
 */
YTScriptLoader.$inject = ['$q', '$timeout'];

export default function YTScriptLoader($q, $timeout) {
  //allow 2 seconds download time per each try
  //4 seconds total, as on first error, we retry
  //see YoutubePlayerManager#create
  var TIMEOUT = 2 * 1000;
  return {
    load: load
  };

  /**
   * @ngdoc method
   * @name #load
   * @methodOf iTT.service:YTScriptLoader
   * @description
   * for injecting the youtube.com/iframe_api script which in turn async downloads
   * www-widgetapi script
   * @returns {Promise} returns Promise<Void>
   */
  function load() {
    var doReject;
    return $q(function (resolve, reject) {

      doReject = $timeout(reject, TIMEOUT);

      //check for YT global
      if (typeof(YT) == 'undefined' || typeof(YT.Player) == 'undefined') { //jshint ignore:line
        var url = '//www.youtube.com/iframe_api';
        var tag = document.createElement('script');
        tag.src = url;
        tag.id = 'yt-iframe-api';
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        //we have already fired onYoutubeIframeAPIReady
        $timeout.cancel(doReject);
        resolve();
      }

      window.onYouTubeIframeAPIReady = function () {
        //youtube.com/iframe_api script will invoke
        //this function after it downloads www-widgetapi script.
        $timeout.cancel(doReject);
        resolve();
      };
    });
  }
}
