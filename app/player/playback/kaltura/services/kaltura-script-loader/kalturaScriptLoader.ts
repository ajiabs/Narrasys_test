// @npUpgrade-kaltura-false
/**
 * Created by githop on 1/13/17.
 */

/***********************************
 **** Updated by Curve10 (JAB/EDD)
 **** Feb 2018
 ***********************************/

/*
 Kaltura script loading strategy:
 - check for KWidget in global scope
 -- if KWidget is not present, load script tag with partnerID and uIConfId, store loaded script in _scriptsMap
 -- if KWidget is present, check _scriptsMap to see if we have already created a script for this partnerID + uiConfId,
 if we haven't, load script and store result in _scriptsMap
 */

export interface IKalturaScriptLoader {
  load(partnerId, uiConfId);
}


export class KalturaScriptLoader implements IKalturaScriptLoader {
  static Name = 'kalturaScriptLoader'; // tslint:disable-line
  static $inject = ['$q', 'ittUtils'];

  constructor (
    private $q,
    private ittUtils) {

  }

  private _scriptsMap = {};
  private _existy = this.ittUtils.existy;

  // return {
  //   load: load
  // };

  /**
   *
   * @param partnerId
   * @param uiConfId
   * @returns {*}
   */
  load(partnerId, uiConfId) {
    return this.$q( (resolve) => {

      var scriptKey = uiConfId + partnerId;

      if (!this._existy(this._scriptsMap[scriptKey])) {
        this._scriptsMap[scriptKey] = 'ready';
      }

      if (typeof(KWidget) == 'undefined') {
        this._loadScript(partnerId, uiConfId, this._scriptsMap, resolve);
      } else if (this._scriptsMap[scriptKey] === 'ready') {
        this._loadScript(partnerId, uiConfId, this._scriptsMap, resolve);
      } else {
        resolve();
      }
    });
  }

  private _loadScript(partnerId, uiConfId, history, onDone) {
    var tagSrc = this._getScriptTagSrc(partnerId, uiConfId);
    var tag = this._appendScript(tagSrc, partnerId);
    tag.onload = onDone;
    history[uiConfId + partnerId] = tag;
  }

  private _getScriptTagSrc(partnerId, uiConfId) {
    return 'https://cdnapisec.kaltura.com/p/' + partnerId + '/sp/' + partnerId + '00/embedIframeJs/uiconf_id/' + uiConfId + '/partner_id/' + partnerId;
  }

  private _appendScript(src, partnerId) {
    var tag = document.createElement('script');
    tag.src = src;
    tag.id = partnerId;
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    return tag;
  }
}


