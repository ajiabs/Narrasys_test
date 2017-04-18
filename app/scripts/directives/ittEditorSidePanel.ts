import {IComponentOptions} from "angular";
/**
 * Created by githop on 4/18/17.
 */

const TEMPLTE = `
<div ng-class="{ 'sidePanel-open': $ctrl.expanded }" class="sidePanel__wrapper">
  <span class="sidePanel__toggle fa"
    ng-if="($ctrl.appState.editEvent || $ctrl.appState.editEpisode) && $ctrl.currentViewMode === 'review'"
    ng-class="$ctrl.expanded ? 'fa-chevron-left' : 'fa-chevron-right'"
    ng-click="$ctrl.toggleSidePanel()">
  </span>

  <div class="toolbar-bottom-fill">
    <ng-transclude></ng-transclude>
  </div>
</div>`;


class EditorSidePanelCtrl implements ng.IController {
  public expanded: boolean = false;
  static $inject = ['appState'];
  constructor(public appState) {}

  $onChanges(changes) {
    if (changes.currentViewMode !== 'review') {
      this.expanded = false;
    }
  }

  toggleSidePanel() {
    this.expanded = !this.expanded;
  }
}

export class EditorSidePanel implements IComponentOptions {
  static Name: string = 'ittEditorSidePanel';
  bindings: any = {
    currentViewMode: '<'
  };
  template: string = TEMPLTE;
  transclude: boolean = true;
  controller = EditorSidePanelCtrl;
}
