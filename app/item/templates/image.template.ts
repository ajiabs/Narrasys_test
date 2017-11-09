
const TEMPLATE = `
<a class="edit-event" ng-click="editItem()">
	<span>Edit item</span>
</a>
<div class="itemTemplate">
	<div class="itemHead">

		<a role="button"
		  aria-label="Seek video to {{item.displayStartTime}}"
		  tabindex="0" class="startTime displayTime"
		  x-ng-click="seek(item.start_time)"
		  x-ng-keypress="seekOnKeyPress(item.start_time, $event)">{{item.displayStartTime}}</a>
		<div class="category">
			<!--{{item.category}}-->
			<span ng-if="item.required">(Required viewing)</span>
		</div>
	</div>
	<div class="text item__text">
		<div class="title item__title item__title--image">
			<a 
			  class="fakeLink item__link--fake-link"
			  role="button"
			  tabindex="0"
			  ng-click="toggleDetailView()"
			  x-ng-keypress="toggleDetailOnKeyPress($event)"
			  ng-bind-html="item.display_title || '(Untitled)' | highlightSubstring: appState.searchText"></a>
		</div>
		<div
		  class="item__text item__text--image"
		  ng-bind-html="item.display_description | highlightSubstring: appState.searchText"></div>
	</div>
	<div class="itemDetail" x-ng-if="item.showInlineDetail">
		<div class="touchable" style="position:relative">
			<img x-ng-click="forceModal()" ng-src="{{item.asset.url}}">
			<div class="touchableIndicator"></div>
		</div>
	</div>
	<div class="clear"></div>
</div>

`;

export class ImageTemplate implements ng.IDirective {
  restrict: string = 'E';
  template = TEMPLATE;
  scope = true;
  static Name = 'npImageTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new ImageTemplate();
  }
}
