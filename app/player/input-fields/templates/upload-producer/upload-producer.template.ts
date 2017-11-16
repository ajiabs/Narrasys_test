
import uploadProducerHtml from './upload-producer.html';

export class UploadProducerTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = uploadProducerHtml;
  scope = true;
  static Name = 'npUploadProducerTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new UploadProducerTemplate();
  }
}
