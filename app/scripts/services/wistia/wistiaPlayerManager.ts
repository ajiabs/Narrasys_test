import {IBasePlayerManager, IScriptLoader, IUrlSubService} from "../../interfaces";
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


export class WistiaPlayerManager implements IWistiaPlayerManager {
  private _players = {};
  private _mainPlayerId;
  public type = 'wistia';
  private base;
  public commonMetaProps;
  private wistaMetaProps = {
    videoType: this.type
  };

  private wistiaMetaOpb = {
    instance: null,
    meta: {}
  };

  static $inject = ['playerManagerCommons', 'wistiaScriptLoader', 'wistiaUrlService'];
  constructor(
    public playerManagerCommons: IBasePlayerManager,
    private wistiaScriptLoader: IScriptLoader,
    private wistiaUrlService: IUrlSubService) {

    this.base = playerManagerCommons({players: this._players, type: this.type});
    Object.assign(this.wistiaMetaOpb.meta, this.wistiaMetaOpb, this.base.commonMetaProps);

  }


  getMetaProp(pid: string, prop: string) {
    return this.base.getMetaProp(pid, prop);
  }

  setMetaProp(pid: string, prop: string, val: any) {

  }

  private getPlayer(pid) {
    return this.base.getPlayer(pid);
  }

  private _createWpInstance(id: string) {
    return this.wistiaScriptLoader.load()
      .then(_ => {
        window._wq.push({id, onReady: (video) => this.onReady(video)})
      });
  }

  private onReady(video) {
    console.log('we ready!', video);
  }
}
