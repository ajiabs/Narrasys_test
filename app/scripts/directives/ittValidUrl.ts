/**
 * Created by githop on 6/24/16.
 */

ittValidUrl.$inject = ['ittUtils'];

export default function ittValidUrl(ittUtils) {
  return {
    require: '?ngModel',
    link: function (scope, elm, attr, ngModel) {
      if (ngModel) {
        ngModel.$validators.supportUrl = function (modelVal) {
          return ngModel.$isEmpty(modelVal) || ittUtils.isValidURL(modelVal);
        };
      }
    }
  };
}
