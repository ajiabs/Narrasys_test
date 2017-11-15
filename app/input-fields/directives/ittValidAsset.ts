// @npUpgrade-inputFields-false
import { EventTemplates } from '../../constants';

/**
 * Created by githop on 7/12/16.
 */
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
