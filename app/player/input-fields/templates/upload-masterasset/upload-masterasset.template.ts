
import uploadMasterassetHtml from './upload-masterasset.html';

export class UploadMasterassetTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = uploadMasterassetHtml;
  scope = true;
  static Name = 'npUploadMasterassetTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new UploadMasterassetTemplate();
  }
}
