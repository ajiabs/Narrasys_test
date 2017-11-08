// @npUpgrade-inputFields-false
/**
 * Created by githop on 8/9/16.
 */

ittOptionsDisabled.$inject = ['$parse'];

//from: http://stackoverflow.com/a/16203547
export default function ittOptionsDisabled($parse) {
  return {
    restrict: 'EA',
    priority: 0,
    require: 'ngModel',
    link: link
  };

  function _disableOptions(scope, attr, element, data, fnDisableIfTrue) {
    var options = element.find('option');
    var pos = 0, index = 0, len = options.length, locals;
    for (; pos < len; pos++) {
      var elm = angular.element(options[pos]);

      if (elm.val() != '') { //jshint ignore:line
        locals = {};
        locals[attr] = data[index];
        elm.attr('disabled', fnDisableIfTrue(scope, locals));
        index++;
      }
    }
  }

  function link(scope, elm, attrs) {
    var expElements = attrs.ittOptionsDisabled.match(/^\s*(.+)\s+for\s+(.+)\s+in\s+(.+)?\s*/);
    var attrToWatch = expElements[3];
    var fnDisableIfTrue = $parse(expElements[1]);

    scope.$watch(attrToWatch, function (nv) {
      if (nv) {
        _disableOptions(scope, expElements[2], elm, nv, fnDisableIfTrue);
      }
    }, true);

    scope.$watch(attrs.ngModel, function (nv) {
      var disOptions = $parse(attrToWatch)(scope);
      if (nv) {
        _disableOptions(scope, expElements[2], elm, disOptions, fnDisableIfTrue);
      }
    });
  }
}
