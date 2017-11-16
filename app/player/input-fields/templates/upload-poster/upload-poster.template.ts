
import uploadPosterHtml from './upload-poster.html';

export class UploadPosterTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = uploadPosterHtml;
  scope = true;
  static Name = 'npUploadPosterTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new UploadPosterTemplate();
  }
}
