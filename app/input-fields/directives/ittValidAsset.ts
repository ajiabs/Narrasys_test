// @npUpgrade-inputFields-false
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
        var tmplUrl = newVal.templateUrl;
        var asset = newVal.asset;
        switch (tmplUrl) {
          case 'templates/item/file.html':
          case 'templates/item/image-plain.html':
          case 'templates/item/image-inline-withtext.html':
          case 'templates/item/image-caption-sliding.html':
          case 'templates/item/image.html':
          case 'templates/item/image-fill.html':
          case 'templates/item/link-withimage-notitle.html':
            if (ittUtils.existy(asset)) {
              ngModelCtrl.$setValidity('itemAsset', true);
            } else {
              ngModelCtrl.$setValidity('itemAsset', false);
            }
            break;
          case 'templates/item/link.html':
          case 'templates/item/link-modal-thumb.html':
          case 'templates/item/link-descriptionfirst.html':
          case 'templates/item/link-embed.html':
            ngModelCtrl.$setValidity('itemAsset', true);
            break;
        }
      }

    }
  };
}
