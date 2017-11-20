
import fileHtml from './file.html';
import { EventTemplates, componentTemplateNameify } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.FILE_TEMPLATE);

export class FileTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = fileHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new FileTemplate();
  }
}
