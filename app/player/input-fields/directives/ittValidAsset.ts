// @npUpgrade-inputFields-false
import { EventTemplates } from '../../../constants';
import { IPlugin } from '../../../models';

/**
 * Created by githop on 7/12/16.
 */

export class ValidAsset implements ng.IDirective {
  restrict: string = 'A';
  require = {
    ngModel: '^ngModel'
  };
  scope = {
    item: '<',
    componentName: '@'
  };
  bindToController = true;
  controller = class ValidAssetController implements ng.IComponentController {
    componentName: string;
    item: IPlugin;
    ngModel: ng.INgModelController;
    constructor() {
      //
    }

    $onChanges(changes: { componentName: ng.IChangesObject }) {
      if (changes && changes.componentName && !changes.componentName.isFirstChange() && this.ngModel != null) {
        this.handleNameChanges(changes.componentName.currentValue);
      }
    }

    private handleNameChanges(componentName) {
      switch (componentName) {
        case EventTemplates.FILE_TEMPLATE:
        case EventTemplates.IMAGE_PLAIN_TEMPLATE:
        case EventTemplates.IMAGE_INLINE_WITHTEXT_TEMPLATE:
        case EventTemplates.SLIDING_CAPTION:
        case EventTemplates.IMAGE_FILL_TEMPLATE:
        case EventTemplates.LINK_WITHIMAGE_NOTITLE_TEMPLATE:
          console.log("huh", this.item);
          if (this.item.asset != null) {
            this.ngModel.$setValidity('itemAsset', true);
          } else {
            this.ngModel.$setValidity('itemAsset', false);
          }
          break;
        case EventTemplates.LINK_TEMPLATE:
        case EventTemplates.LINK_MODAL_THUMB_TEMPLATE:
        case EventTemplates.LINK_DESCRIPTION_FIRST_TEMPLATE:
        case EventTemplates.LINK_EMBED_TEMPLATE:
          this.ngModel.$setValidity('itemAsset', true);
          break;
      }
    }
  };
  static Name = 'npValidAsset'; // tslint:disable-line
  static $inject = [];
  constructor() {
    //
  }

  static factory(): ng.IDirectiveFactory {
    const directiveInstance = () => new ValidAsset();
    directiveInstance.$inject = ValidAsset.$inject;
    return directiveInstance;
  }

  link(scope: ng.IScope, elm: JQuery, attrs: ng.IAttributes, ngModelCtrl): void {
    //
  }
}

ittValidAsset.$inject = ['ittUtils'];

export default function ittValidAsset(ittUtils) {
  return {
    restrict: 'EA',
    require: '^ngModel',
    scope: {
      item: '='
    },
    link: function (scope, elm, attrs, ngModelCtrl) {
      if (ngModelCtrl) {
        //set to valid right off the bat, then use $watch below
        //to update validity on subsequent selections.
        ngModelCtrl.$validators.itemAsset = function () {
          return true;
        };
        scope.$watch(watchItem, handleChanges, true);
      }

      function watchItem() {
        return scope.item;
      }

      function handleChanges(newVal) {
        var tmplUrl = newVal.component_name;
        var asset = newVal.asset;
        switch (tmplUrl) {
          case EventTemplates.FILE_TEMPLATE:
          case EventTemplates.IMAGE_PLAIN_TEMPLATE:
          case EventTemplates.IMAGE_INLINE_WITHTEXT_TEMPLATE:
          case EventTemplates.SLIDING_CAPTION:
          case EventTemplates.IMAGE_FILL_TEMPLATE:
          case EventTemplates.LINK_WITHIMAGE_NOTITLE_TEMPLATE:
            if (ittUtils.existy(asset)) {
              ngModelCtrl.$setValidity('itemAsset', true);
            } else {
              ngModelCtrl.$setValidity('itemAsset', false);
            }
            break;
          case EventTemplates.LINK_TEMPLATE:
          case EventTemplates.LINK_MODAL_THUMB_TEMPLATE:
          case EventTemplates.LINK_DESCRIPTION_FIRST_TEMPLATE:
          case EventTemplates.LINK_EMBED_TEMPLATE:
            ngModelCtrl.$setValidity('itemAsset', true);
            break;
        }
      }

    }
  };
}
