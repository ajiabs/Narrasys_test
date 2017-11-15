
import uploadSxsHtml from './upload-sxs.html';

export class UploadSxsTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = uploadSxsHtml;
  scope = true;
  static Name = 'npUploadSxsTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new UploadSxsTemplate();
  }
}
