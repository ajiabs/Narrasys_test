
const TEMPLATE = `
<a class="edit-event" ng-click="editItem()">
	<span>Edit item</span>
</a>
<div class="itemTemplate">
	<div class="itemHead">
		<a
		  role="button"
		  aria-label="Seek video to {{item.displayStartTime}}"
		  tabindex="0"
		  class="startTime displayTime"
		  x-ng-click="seek(item.start_time)"
		  x-ng-keypress="seekOnKeyPress(item.start_time, $event)">{{item.displayStartTime}}</a>
		<div class="category item__title">
			<!--{{item.category}}-->
			<span ng-if="item.required">(Required viewing)</span>
		</div>
	</div>
	<div class="captionContainer touchable">
		<img x-ng-click="forceModal()" ng-src="{{item.asset.url}}">
		<div class="touchableIndicator"></div>
		<div class="caption slidingcaption">
			<div
			  class="title item__title item__title--image item__title--image-caption-sliding"
			  ng-bind-html="item.display_title | highlightSubstring: appState.searchText"></div>
			<div
			  class="text item__text item__text--image item__text--image-caption-sliding"
			  ng-bind-html="item.display_description | highlightSubstring: appState.searchText"></div>
		</div>
	</div>
	<div class="clear"></div>
</div>

`;

export class ImageCaptionSlidingTemplate implements ng.IDirective {
  restrict: string = 'E';
  template = TEMPLATE;
  scope = true;
  static Name = 'npImageCaptionSlidingTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new ImageCaptionSlidingTemplate();
  }
}
