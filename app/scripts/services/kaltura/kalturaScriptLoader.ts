/**
 * Created by githop on 1/13/17.
 */

/*
 Kaltura script loading strategy:
 - check for KWidget in global scope
 -- if KWidget is not present, load script tag with partnerID and uIConfId, store loaded script in _scriptsMap
 -- if KWidget is present, check _scriptsMap to see if we have already created a script for this partnerID + uiConfId,
 if we haven't, load script and store result in _scriptsMap
 */

kalturaScriptLoader.$inject = ['$q', 'ittUtils'];

export default function kalturaScriptLoader($q, ittUtils) {
  var _scriptsMap = {};
  var _existy = ittUtils.existy;

  return {
    load: load
  };

  /**
   *
   * @param partnerId
   * @param uiConfId
   * @returns {*}
   */
  function load(partnerId, uiConfId) {
    return $q(function (resolve) {

      var scriptKey = uiConfId + partnerId;

      if (!_existy(_scriptsMap[scriptKey])) {
        _scriptsMap[scriptKey] = 'ready';
      }

      if (typeof(KWidget) == 'undefined') {
        _loadScript(partnerId, uiConfId, _scriptsMap, resolve);
      } else if (_scriptsMap[scriptKey] === 'ready') {
        _loadScript(partnerId, uiConfId, _scriptsMap, resolve);
      } else {
        resolve();
      }
    });
  }

  function _loadScript(partnerId, uiConfId, history, onDone) {
    var tagSrc = _getScriptTagSrc(partnerId, uiConfId);
    var tag = _appendScript(tagSrc, partnerId);
    tag.onload = onDone;
    history[uiConfId + partnerId] = tag;
  }

  function _getScriptTagSrc(partnerId, uiConfId) {
    return 'https://cdnapisec.kaltura.com/p/' + partnerId + '/sp/' + partnerId + '00/embedIframeJs/uiconf_id/' + uiConfId + '/partner_id/' + partnerId;
  }

  function _appendScript(src, partnerId) {
    var tag = document.createElement('script');
    tag.src = src;
    tag.id = partnerId;
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    return tag;
  }
}


