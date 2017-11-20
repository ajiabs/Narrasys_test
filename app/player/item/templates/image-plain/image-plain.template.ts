
import imagePlainHtml from './image-plain.html';
import { EventTemplates, componentTemplateNameify } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.IMAGE_PLAIN_TEMPLATE);
export class ImagePlainTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = imagePlainHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new ImagePlainTemplate();
  }
}
