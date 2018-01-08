

import watchmodeHtml from './watchmode.html';

export class WatchmodeTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = watchmodeHtml;
  scope = true;
  static Name = 'npWatchmodeTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new WatchmodeTemplate();
  }
}
