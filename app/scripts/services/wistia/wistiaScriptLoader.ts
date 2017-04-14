import {IScriptLoader} from "../../interfaces";
/**
 * Created by githop on 4/12/17.
 */


declare global {
  interface Window {
    _wq: any;
  }
}

interface AsycnScript extends HTMLScriptElement {
  onreadystatechange(): any
  readyState: string | void
}

export class WistiaScriptLoader implements IScriptLoader {
  private WISTIA_HREF = 'https://fast.wistia.com/assets/external/E-v1.js';

  static $inject = ['$q'];
  constructor(private $q: ng.IQService) { };

  load(assetId: string) {
    return this.$q((resolve) => {
      if (window._wq == null) {
        this._appendScript(assetId, resolve);
      }
    });
  }

  private _appendScript(id, resolve): void {
    let tag = <AsycnScript> document.createElement('script');
    tag.setAttribute('src', this.WISTIA_HREF);
    tag.setAttribute('type', 'text/javascript');
    tag.setAttribute('async', '');
    tag.id = id;
    let firstScriptTag: HTMLScriptElement = document.getElementsByTagName('script')[0];
    firstScriptTag.parentElement.insertBefore(tag, firstScriptTag);
    tag.onload = resolve;
  }

}

