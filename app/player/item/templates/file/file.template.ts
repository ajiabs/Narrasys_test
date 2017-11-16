
import fileHtml from './file.html';

export class FileTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = fileHtml;
  scope = true;
  static Name = 'npFileTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new FileTemplate();
  }
}
