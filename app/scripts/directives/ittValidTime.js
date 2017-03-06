/**
 * Created by githop on 3/3/17.
 */

(function () {
  'use strict';

  angular.module('com.inthetelling.story')
    .directive('ittValidTime', ittValidTime);

  ittValidTime.$inject = ['ittUtils'];
  function ittValidTime(ittUtls) {
    return {
      require: '?ngModel',
      link: function(scope, elm, attr, ngModel) {
        var _existy = ittUtls.existy;

        if (ngModel && scope.item._type === 'Scene') {
          ngModel.$validators = {
            time: validateStartTime
          };
        }

        function validateStartTime(viewVal) {
          var parsed = parseViewVal(viewVal);
          return (_existy(parsed) && parsed > 0.1);
        }

        function parseViewVal(val) {
          return parseFloat(val.split(':')[1]);
        }
      }
    };
  }


})();
