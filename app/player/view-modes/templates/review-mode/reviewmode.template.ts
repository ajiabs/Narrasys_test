

import reviewmodeHtml from './reviewmode.html';

export class ReviewmodeTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = reviewmodeHtml;
  scope = true;
  static Name = 'npReviewmodeTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new ReviewmodeTemplate();
  }
}
