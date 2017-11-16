// @npUpgrade-inputFields-false
/**
 * Created by githop on 7/1/16.
 */

ittDynamicModel.$inject = ['$compile', '$parse'];

//http://stackoverflow.com/a/32096328
export default function ittDynamicModel($compile, $parse) {
  return {
    restrict: 'A',
    terminal: true,
    priority: 100000,
    link: function (scope, elem) {
      var name = $parse(elem.attr('itt-dynamic-model'))(scope);
      elem.removeAttr('itt-dynamic-model');
      elem.attr('ng-model', name);
      $compile(elem)(scope);
    }
  };
}

