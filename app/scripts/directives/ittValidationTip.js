/**
 * Created by githop on 8/24/16.
 */

(function () {
  'use strict';

  angular.module('com.inthetelling.story')
    .directive('ittValidationTip', ittValidationTip);

  function ittValidationTip() {
    return {
      restrict: 'EA',
      scope: {
        text: '@',
        doInfo: '=?'
      },
      template: [
        '<span class="tooltip-static">',
        '	<i class="fa fa-info-circle" ng-class="{\'error-red\': !doInfo, \'info-blue\': doInfo}"></i>',
        '	<span class="tooltip-text">{{text}}</span>',
        '</span>'
      ].join('\n')
    };
  }


})();
