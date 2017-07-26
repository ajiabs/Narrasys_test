import {IScriptLoader} from '../../interfaces';
/**
 * Created by githop on 4/12/17.
 */

declare const Wistia: object;

export class WistiaScriptLoader implements IScriptLoader {
  private WISTIA_HREF = 'https://fast.wistia.com/assets/external/E-v1.js';

  static $inject = ['$q'];
  constructor(private $q: ng.IQService) {  }

  load(assetId: string): ng.IPromise<{}> {
    return this.$q((resolve) => {
      if (typeof Wistia === 'undefined') {
        this._appendScript(assetId, resolve);
      } else {
        resolve();
      }
    });
  }

  private _appendScript(id, resolve): void {
    const tag = <HTMLScriptElement> document.createElement('script');
    tag.setAttribute('src', this.WISTIA_HREF);
    tag.setAttribute('type', 'text/javascript');
    tag.setAttribute('async', '');
    tag.id = id;
    const firstScriptTag: HTMLScriptElement = document.getElementsByTagName('script')[0];
    firstScriptTag.parentElement.insertBefore(tag, firstScriptTag);
    tag.onload = resolve;
  }

}

