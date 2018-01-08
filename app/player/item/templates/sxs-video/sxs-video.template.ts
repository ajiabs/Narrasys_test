
import sxsVideoHtml from './sxs-video.html';
import { EventTemplates, componentTemplateNameify } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.SXS_VIDEO_TEMPLATE);
export class SxsVideoTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = sxsVideoHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new SxsVideoTemplate();
  }
}
