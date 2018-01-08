
import searchresultsAllHtml from './searchresults-all.html';

export class SearchresultsAllTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = searchresultsAllHtml;
  scope = true;
  static Name = 'npSearchresultsAllTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new SearchresultsAllTemplate();
  }
}
