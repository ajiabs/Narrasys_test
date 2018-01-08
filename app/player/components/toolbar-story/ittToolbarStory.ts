// @npUpgrade-player-false
/**
 * Created by githop on 12/21/15.
 */

import toolbarStoryHtml from './toolbar-story.html';

export class ToolbarStory implements ng.IDirective {
  restrict: string = 'EA';
  template = toolbarStoryHtml;
  scope = true;
  static Name = 'npToolbarStory'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new ToolbarStory();
  }
}


// export default function ittToolbarStory() {
//   return {
//     scope: true,
//     templateUrl: 'templates/toolbar-story.html'
//   };
// }
