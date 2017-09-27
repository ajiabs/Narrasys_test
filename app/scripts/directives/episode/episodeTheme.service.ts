import * as WebFont from 'webfontloader';
import { IFont, IEpisodeTemplate } from '../../models';

export interface IEpisodeTheme {
  setTheme(template: IEpisodeTemplate): ng.IPromise<void>;
  loadThemeStyleSheet(templateId: string): ng.IPromise<void>;
  loadFontFamily(font: IFont): void;
}

export class EpisodeTheme implements IEpisodeTheme {
  linkId: string = 'np-template-theme';
  linkTag: HTMLLinkElement;
  private imgElm: HTMLImageElement;
  static Name = 'episodeTheme'; // tslint:disable-line
  static $inject = ['$q', 'config'];
  constructor(
    private $q: ng.IQService,
    private config) {
    //
  }

  setTheme(template: IEpisodeTemplate): ng.IPromise<void> {
    return this.loadThemeStyleSheet(template.id)
      .then(() => this.loadFontFamily(template.fonts));
  }

  loadThemeStyleSheet(templateId: string): ng.IPromise<void> {
    this.imgElm = document.createElement('img');

    return this.$q((resolve) => {
      if (this.linkTag != null) {
        this._changeHref(templateId);
      } else {
        this._appendLinkTag(templateId);
      }

      this.imgElm.src = this.linkTag.href;
      document.body.appendChild(this.imgElm);

      this.imgElm.onerror = () => {
        // https://www.viget.com/articles/js-201-run-a-function-when-a-stylesheet-finishes-loading
        document.body.removeChild(this.imgElm);
        resolve(void 0);
      };

    });
  }

  loadFontFamily(font: IFont): void {
    if (font != null) {
      WebFont.load(font);
    }
  }

  private _changeHref(id): void {
    this.linkTag.setAttribute('href', this._getHrefPath(id));
  }

  private _getHrefPath(templateId): string {
    return `https:${this.config.apiDataBaseUrl}/v1/templates/${templateId}.css`;
  }

  private _appendLinkTag(templateId: string): void {
    const link = document.createElement('link');
    link.setAttribute('id', this.linkId);
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', this._getHrefPath(templateId));
    this.linkTag = link;
    document.head.appendChild(this.linkTag);
  }

}
