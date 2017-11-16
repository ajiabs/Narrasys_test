
import mirroredTwocolHtml from './mirrored-twocol.html';
import { componentTemplateNameify, EventTemplates } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.MIRRORED_TWOCOL_TEMPLATE);

export class MirroredTwocolTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = mirroredTwocolHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new MirroredTwocolTemplate();
  }
}
