import {IBasePlayerManager, IScriptLoader, IWistiaUrlservice} from "../../interfaces";
/**
 * Created by githop on 4/12/17.
 */

declare global {
  interface Window {
    _wq: any;
  }
}

export interface IWistiaPlayerManager extends IBasePlayerManager {

}

//TODO refactor ittUtils into ES module
function _existy(x: any) {
  return x != null;
}

export class WistiaPlayerManager implements IWistiaPlayerManager {
  private _players = {};
  private _mainPlayerId;
  public type = 'wistia';
  private base;
  public commonMetaProps;
  private _setMetaProps;
  private wistaMetaProps = {
    videoType: this.type
  };

  private wistiaMetaObj = {
    instance: null,
    meta: {}
  };

  static $inject = ['playerManagerCommons', 'wistiaScriptLoader', 'wistiaUrlService', 'ittUtils'];
  constructor(
    public playerManagerCommons,
    private wistiaScriptLoader: IScriptLoader,
    private wistiaUrlService: IWistiaUrlservice,
    private ittUtils) {

    this.base = <IBasePlayerManager> playerManagerCommons({players: this._players, type: this.type});

    Object.assign(this.wistiaMetaObj.meta, this.wistiaMetaObj, this.base.commonMetaProps);
    const validKeys = Object.keys(this.wistiaMetaObj.meta);
    this._setMetaProps = this.base.setMetaProp(validKeys);

  }

  seedPlayerManager(id: string, mainPlayer: boolean, mediaSrcArr: string[]) {
    if (_existy(this.getPlayer(id)) && this.getMetaProp(id, 'startTime') > 0) {
      return
    }

    if (mainPlayer) {
      this._players = {};
      this._mainPlayerId = id;
    }

    const wistiaId = this.wistiaUrlService.extractId(mediaSrcArr[0]);

    const newProps = {
      mainPlayer: mainPlayer,
      div: this.setPlayerDiv(id, wistiaId),
      wistiaId: wistiaId
    };

    this.setPlayer(id, this.createMetaObj(newProps, this.wistiaMetaObj))
  }

  create(pid: string) {
    this.createWpInstance(pid)
      .then((success) => {



        this.ittUtils.ngTimeout(_ => {
          Wistia.embeds.setup();
          let v = Wistia.api(pid);
          console.log('v?', v.ready());
        },500);
      });
  }

  getPlayerState() {

  }

  getBufferedPercent() {

  }

  registerStateChangeListener() {

  }

  unregisterStateChangeListener() {

  }

  getMetaProp(pid: string, prop: string) {
    return this.base.getMetaProp(pid, prop);
  }

  setMetaProp(pid: string, prop: string, val: any) {
    return this._setMetaProps(pid, prop, val);
  }

  getPlayerDiv(id) {
    return this.base.getPlayerDiv(id);
  }

  private setPlayerDiv(pid: string, wistiaId: string) {
    return `<div id="${pid}" class="wistia_embed wistia_async_${wistiaId}">&nbsp;</div>`;
  }

  private getPlayer(pid) {
    return this.base.getPlayer(pid);
  }

  private setPlayer(pid, val) {
    return this.base.setPlayer(pid, val);
  }

  private createMetaObj(props, base) {
    return this.base.createMetaObj(props, base);
  }

  private createWpInstance(id: string) {
    return this.wistiaScriptLoader.load(id)
      .then(_ =>  {
        window._wq.push({
          id: id,
          onReady: function(video) {
          }
        });
      });
  }

  private onReady(video) {
    console.log('we ready!', video);
  }
}
