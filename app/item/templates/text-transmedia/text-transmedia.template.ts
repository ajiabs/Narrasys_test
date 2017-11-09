
import textTransmediaHttml from './text-transmedia.html';

export class TextTransmediaTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = textTransmediaHttml;
  scope = true;
  static Name = 'npTextDefinitionTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new TextTransmediaTemplate();
  }
}
