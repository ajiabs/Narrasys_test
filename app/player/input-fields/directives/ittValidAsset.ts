// @npUpgrade-inputFields-true
import { EventTemplates } from '../../../constants';
import { IUpload } from '../../../models';

/**
 * Created by githop on 7/12/16.
 */

export class ValidAsset implements ng.IDirective {
  restrict: string = 'A';
  require = {
    ngModel: '^ngModel'
  };
  scope = {
    asset: '<',
    componentName: '@'
  };
  bindToController = true;
  controller = class ValidAssetController implements ng.IComponentController {
    componentName: string;
    asset: {};
    ngModel: ng.INgModelController;
    constructor() {
      //
    }

    $onChanges(changes: { componentName: ng.IChangesObject, asset: ng.IChangesObject }) {
      if (changes && this.ngModel != null) {
        const { componentName, asset } = changes;
        let cmpName;
        if (componentName == null) {
          cmpName = this.componentName;
        } else {
          cmpName = componentName.currentValue;
        }

        // stop relic from throwing undefined error even though handleNameChanges can deal with a null parameter
        let currentValue = null;
        if( asset && asset.currentValue )
          currentValue = asset.currentValue
        this.handleNameChanges(cmpName, currentValue);
      }
    }

    private handleNameChanges(componentName, asset) {
      switch (componentName) {
        case EventTemplates.FILE_TEMPLATE:
        case EventTemplates.IMAGE_PLAIN_TEMPLATE:
        case EventTemplates.IMAGE_INLINE_WITHTEXT_TEMPLATE:
        case EventTemplates.SLIDING_CAPTION:
        case EventTemplates.IMAGE_FILL_TEMPLATE:
        case EventTemplates.LINK_WITHIMAGE_NOTITLE_TEMPLATE:
          if (asset != null) {
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
