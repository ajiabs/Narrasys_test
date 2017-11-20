
import sxsFileHtml from './sxs-file.html';
import { EventTemplates, componentTemplateNameify } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.SXS_FILE_TEMPLATE);
export class SxsFileTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = sxsFileHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new SxsFileTemplate();
  }
}
