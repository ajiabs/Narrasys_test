
import reviewmodeScenesHtml from './reviewmode-scenes.html';

export class ReviewmodeScenesTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = reviewmodeScenesHtml;
  scope = true;
  static Name = 'npReviewmodeScenesTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new ReviewmodeScenesTemplate();
  }
}

