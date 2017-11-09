
import transcriptHtml from './transcript.html';

export class TranscriptTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = transcriptHtml;
  scope = true;
  static Name = 'npTranscriptTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new TranscriptTemplate();
  }
}
