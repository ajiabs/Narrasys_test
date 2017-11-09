

// const TEMPLATE = `
// <!-- one or the other of .item background-image and fillImg will be made invisible, depending on fill type.
// see ittItem for explanation of the redundant backgroundImageStyle and item.asset.cssUrl is for browser -->
// <a class="edit-event" ng-click="editItem()">
// 	<span>Edit item</span>
// </a>
// <div class="itemTemplate imageFill" ng-style="{'background-image': 'url(' + item.asset.cssBgUrl + ')'}">
// 	<img class="fillImg" ng-src="{{item.asset.url}}">
// </div>
// `;

import imageFillHtml from './../../templates/item/image-fill.html';

export class ImageFillTemplate implements ng.IDirective {
  restrict: string = 'E';
  template = imageFillHtml;
  scope = true;
  static Name = 'npImageFillTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new ImageFillTemplate();
  }
}
