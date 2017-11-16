

import transcriptWiththumbnailHtml from './transcript-withthumbnail.html';

export class TranscriptWiththumbnailTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = transcriptWiththumbnailHtml;
  scope = true;
  static Name = 'npTranscriptWiththumbnailTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new TranscriptWiththumbnailTemplate();
  }
}
