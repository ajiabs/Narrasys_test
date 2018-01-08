


import captionHtml from './caption.html';

export class CaptionTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = captionHtml;
  scope = true;
  static Name = 'npCaptionTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new CaptionTemplate();
  }
}
