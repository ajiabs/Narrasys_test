import {IScriptLoader} from "../../interfaces";
/**
 * Created by githop on 4/12/17.
 */

declare global {
  interface Window {
    _wq: any;
  }
}

export class WistiaScriptLoader implements IScriptLoader {
  private WISTIA_HREF = '//fast.wistia.com/assets/external/E-v1.js';

  static $inject = ['$q'];
  constructor(private $q: ng.IQService) { };

  load() {
    return this.$q((resolve) => {
      if (window._wq == null) {
        this._appendScript();
        resolve()
      }
    });
  }

  private _appendScript(): HTMLScriptElement {
    let tag: HTMLScriptElement = document.createElement('script');
    tag.src = this.WISTIA_HREF;
    tag.setAttribute('async', '');
    let firstScriptTag: HTMLScriptElement = document.getElementsByTagName('script')[0];
    firstScriptTag.parentElement.insertBefore(tag, firstScriptTag);
    return tag;
  }

}

