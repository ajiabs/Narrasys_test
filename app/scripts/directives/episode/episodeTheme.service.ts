import * as WebFont from 'webfontloader';
import { IFont, ITemplate } from '../../models';

export interface IEpisodeTheme {
  setTheme(template: ITemplate): void;
  loadThemeStyleSheet(templateId: string): ng.IPromise<void>;
  loadFontFamily(font: IFont): void;
}

export class EpisodeTheme implements IEpisodeTheme {
  linkId: string = 'np-template-theme';
  linkTag: HTMLLinkElement;
  static Name = 'episodeTheme'; // tslint:disable-line
  static $inject = ['$q', 'config'];
  constructor(
    private $q: ng.IQService,
    private config) {
    //
  }

  setTheme(template: ITemplate): void {
    this.loadThemeStyleSheet(template.id);
    this.loadFontFamily(template.fonts);
  }

  loadThemeStyleSheet(templateId: string): ng.IPromise<void> {
    return this.$q((resolve) => {
      if (this.linkTag != null) {
        this._changeHref(templateId);
      } else {
        this._appendLinkTag(templateId);
      }
      this.linkTag.onload = resolve;
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
