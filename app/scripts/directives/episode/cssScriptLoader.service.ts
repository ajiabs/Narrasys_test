
export class CssScriptLoader {
  linkId: string = 'np-template-theme';
  linkTag: HTMLLinkElement;
  static Name = 'cssScriptLoader'; // tslint:disable-line
  static $inject = ['$q', '$timeout', 'config'];
  constructor(
    private $q: ng.IQService,
    private $timeout: ng.ITimeoutService,
    private config) {
    //
  }


  loadThemeStyleSheet(templateId: string): ng.IPromise<void> {
    return this.$q((resolve) => {
      if (this.linkTag != null) {
        this.changeHref(templateId);
      } else {
        this._appendLinkTag(templateId);
      }
      this.linkTag.onload = resolve;
    });
  }

  changeHref(id) {
    //
  }


  private _getHrefPath(templateId) {
    return `https:${this.config.apiDataBaseUrl}/v1/templates/${templateId}.css`;
  }

  private _appendLinkTag(templateId: string) {
    const link = document.createElement('link');
    link.setAttribute('id', this.linkId);
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', this._getHrefPath(templateId));
    this.linkTag = link;
    console.log('tag!', this.linkTag);
    document.head.appendChild(this.linkTag);
  }

}
