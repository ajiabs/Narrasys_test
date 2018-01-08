
import transcriptHtml from './transcript.html';
import { EventTemplates, componentTemplateNameify } from '../../../../constants';

const directiveName = componentTemplateNameify(EventTemplates.TRANSCRIPT_TEMPLATE);
export class TranscriptTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = transcriptHtml;
  scope = true;
  static Name = directiveName; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new TranscriptTemplate();
  }
}
