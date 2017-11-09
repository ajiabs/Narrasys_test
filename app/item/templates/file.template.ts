/*  */
const TEMPLATE = `
<a class="edit-event" ng-click="editItem()">
  <span>Edit item</span>
</a>
<div class="itemTemplate">
  <div class="itemHead">
    <a role="button"
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
  <div class="text item__text item__text--file">
    <div class="title item__title item__title--file">
      <a role="button"
      tabindex="0"
      x-ng-keypress="toggleDetailOnKeyPress($event)"
      ng-click="toggleDetailView()"
      ng-bind-html="item.display_title || '(Untitled)' | highlightSubstring: appState.searchText"></a>
    </div>
    <div
      class="item__text item__text--file"
      ng-bind-html="item.display_description | highlightSubstring: appState.searchText"></div>
  </div>
  <div class="itemDetail" ng-if="item.showInlineDetail">
    <span ng-switch="item.asset.content_type.indexOf('image/')">
      <span ng-switch-when="-1">
        <a
          tabindex="0"
          ng-if="!item.noExternalLink"
          x-ng-keypress="outgoingLinkOnKeyPress(item.asset.url,$event)"
          ng-click="outgoingLink(item.asset.url)" class="escapelink item__link--escape-link">(new window)</a>
        <itt-iframe x-src="{{item.asset.url}}" item="item" x-contenttype="{{item.asset.content_type}}"></itt-iframe>
      </span>
      <span ng-switch-default>
        <img ng-src="{{item.asset.url}}">
      </span>
    </span>
  </div>
  <div class="clear "></div>
</div>

`;

export class FileTemplate implements ng.IDirective {
  restrict: string = 'E';
  template = TEMPLATE;
  scope = true;
  static Name = 'npFileTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new FileTemplate();
  }
}
